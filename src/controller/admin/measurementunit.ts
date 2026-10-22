import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const LANGUAGES = ["MN", "EN", "ZH", "RU", "DE", "FR"] as const;

type Language = (typeof LANGUAGES)[number];

type TranslationInput = {
  language: Language;
  name?: string | null;
  short_name?: string | null;
};

type MeasurementUnitInput = {
  code?: string;
  translations?: TranslationInput[];
};

const isValidLanguage = (language: unknown): language is Language =>
  typeof language === "string" && LANGUAGES.includes(language as Language);

const validateTranslations = (
  translations: unknown,
): translations is TranslationInput[] => {
  if (!Array.isArray(translations)) return false;

  const seen = new Set<string>();

  for (const item of translations) {
    if (!item || typeof item !== "object") return false;

    const translation = item as Record<string, unknown>;

    if (!isValidLanguage(translation.language)) return false;

    if (seen.has(translation.language)) return false;
    seen.add(translation.language);

    if (
      translation.name !== undefined &&
      translation.name !== null &&
      typeof translation.name !== "string"
    ) {
      return false;
    }

    if (
      translation.short_name !== undefined &&
      translation.short_name !== null &&
      typeof translation.short_name !== "string"
    ) {
      return false;
    }
  }

  return true;
};

const normalizeTranslations = (translations: TranslationInput[]) =>
  translations.map((translation) => ({
    language: translation.language,
    name: translation.name?.trim() || null,
    short_name: translation.short_name?.trim() || null,
  }));

const handleError = (res: Response, error: unknown) => {
  console.error("Measurement unit controller error:", error);

  const prismaError = error as {
    code?: string;
    message?: string;
  };

  if (prismaError?.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A measurement unit with this code already exists.",
    });
  }

  if (prismaError?.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Measurement unit not found.",
    });
  }

  if (prismaError?.code === "P2003") {
    return res.status(409).json({
      success: false,
      message:
        "This measurement unit is referenced by other records and cannot be deleted.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
};

// GET /measurementunit
export const getMeasurementUnits = async (req: Request, res: Response) => {
  try {
    const units = await prisma.measurement_unit.findMany({
      include: {
        translations: {
          orderBy: { language: "asc" },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /measurementunit/:id
export const getMeasurementUnitById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement unit ID.",
      });
    }

    const unit = await prisma.measurement_unit.findUnique({
      where: { id },
      include: {
        translations: true,
        conversions_from: {
          include: {
            to_unit: {
              include: { translations: true },
            },
          },
        },
        conversions_to: {
          include: {
            from_unit: {
              include: { translations: true },
            },
          },
        },
      },
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Measurement unit not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /measurementunit
export const createMeasurementUnit = async (
  req: Request<{}, {}, MeasurementUnitInput>,
  res: Response,
) => {
  try {
    const { code, translations } = req.body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Measurement unit code is required.",
      });
    }

    if (translations !== undefined && !validateTranslations(translations)) {
      return res.status(400).json({
        success: false,
        message:
          "Translations must contain valid, unique language codes: MN, EN, ZH, RU, DE, FR.",
      });
    }

    const unit = await prisma.measurement_unit.create({
      data: {
        code: code.trim().toUpperCase(),
        translations: {
          create: normalizeTranslations(translations ?? []),
        },
      },
      include: {
        translations: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Measurement unit created successfully.",
      data: unit,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PUT /measurementunit/:id
export const updateMeasurementUnit = async (
  req: Request<{ id: string }, {}, MeasurementUnitInput>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { code, translations } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement unit ID.",
      });
    }

    if (code !== undefined && (typeof code !== "string" || !code.trim())) {
      return res.status(400).json({
        success: false,
        message: "Measurement unit code cannot be empty.",
      });
    }

    if (translations !== undefined && !validateTranslations(translations)) {
      return res.status(400).json({
        success: false,
        message:
          "Translations must contain valid, unique language codes: MN, EN, ZH, RU, DE, FR.",
      });
    }

    const unit = await prisma.$transaction(async (tx: any) => {
      const existing = await tx.measurement_unit.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("MEASUREMENT_UNIT_NOT_FOUND");
      }

      if (translations !== undefined) {
        // Update existing translations and create missing ones.
        for (const translation of normalizeTranslations(translations)) {
          await tx.measurement_unit_translation.upsert({
            where: {
              unit_id_language: {
                unit_id: id,
                language: translation.language,
              },
            },
            create: {
              unit_id: id,
              ...translation,
            },
            update: {
              name: translation.name,
              short_name: translation.short_name,
            },
          });
        }
      }

      return tx.measurement_unit.update({
        where: { id },
        data: {
          ...(code !== undefined ? { code: code.trim().toUpperCase() } : {}),
        },
        include: {
          translations: true,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Measurement unit updated successfully.",
      data: unit,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "MEASUREMENT_UNIT_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Measurement unit not found.",
      });
    }

    return handleError(res, error);
  }
};

// DELETE /measurementunit/:id
export const deleteMeasurementUnit = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement unit ID.",
      });
    }

    const existing = await prisma.measurement_unit.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Measurement unit not found.",
      });
    }

    const [attributeCount, conversionCount] = await Promise.all([
      prisma.product_attribute.count({
        where: { unit_id: id },
      }),
      prisma.measurement_unit_conversion.count({
        where: {
          OR: [{ from_unit_id: id }, { to_unit_id: id }],
        },
      }),
    ]);

    if (attributeCount > 0 || conversionCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this unit because it is used by product attributes or unit conversions. Remove those references first.",
      });
    }

    await prisma.measurement_unit.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Measurement unit deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
// GET /measurementunit/conversion
export const getMeasurementUnitConversions = async (
  req: Request,
  res: Response,
) => {
  try {
    const conversions = await prisma.measurement_unit_conversion.findMany({
      include: {
        from_unit: {
          include: {
            translations: true,
          },
        },
        to_unit: {
          include: {
            translations: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: conversions,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
export const deleteMeasurementConversions = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement unit conversion ID.",
      });
    }

    const existing = await prisma.measurement_unit_conversion.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Measurement unit conversion not found.",
      });
    }

    await prisma.measurement_unit_conversion.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Measurement unit conversion deleted successfully.",
    });
  } catch (error) {
    return handleError(res, error);
  }
};
// POST /measurementunit/conversion
export const createMeasurementUnitConversion = async (
  req: Request,
  res: Response,
) => {
  try {
    const { from_unit_id, to_unit_id, conversion_rate } = req.body;

    const fromId = Number(from_unit_id);
    const toId = Number(to_unit_id);
    const rate = Number(conversion_rate);

    if (
      !Number.isInteger(fromId) ||
      fromId <= 0 ||
      !Number.isInteger(toId) ||
      toId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid from_unit_id and to_unit_id are required.",
      });
    }

    if (fromId === toId) {
      return res.status(400).json({
        success: false,
        message: "From unit and to unit must be different.",
      });
    }

    if (
      conversion_rate === undefined ||
      conversion_rate === null ||
      conversion_rate === "" ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversion rate must be a positive number.",
      });
    }

    const [fromUnit, toUnit] = await Promise.all([
      prisma.measurement_unit.findUnique({
        where: { id: fromId },
        select: { id: true },
      }),
      prisma.measurement_unit.findUnique({
        where: { id: toId },
        select: { id: true },
      }),
    ]);

    if (!fromUnit || !toUnit) {
      return res.status(404).json({
        success: false,
        message: "From unit or to unit was not found.",
      });
    }

    const conversion = await prisma.measurement_unit_conversion.create({
      data: {
        from_unit_id: fromId,
        to_unit_id: toId,
        conversion_rate: rate,
      },
      include: {
        from_unit: { include: { translations: true } },
        to_unit: { include: { translations: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Measurement unit conversion created successfully.",
      data: conversion,
    });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This unit conversion already exists.",
      });
    }

    return handleError(res, error);
  }
};

// PUT /measurementunit/conversion/:id
export const updateMeasurementUnitConversion = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    const { from_unit_id, to_unit_id, conversion_rate } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid measurement unit conversion ID.",
      });
    }

    const existing = await prisma.measurement_unit_conversion.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Measurement unit conversion not found.",
      });
    }

    const fromId =
      from_unit_id === undefined ? existing.from_unit_id : Number(from_unit_id);

    const toId =
      to_unit_id === undefined ? existing.to_unit_id : Number(to_unit_id);

    const rate =
      conversion_rate === undefined
        ? Number(existing.conversion_rate)
        : Number(conversion_rate);

    if (
      !Number.isInteger(fromId) ||
      fromId <= 0 ||
      !Number.isInteger(toId) ||
      toId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid from_unit_id and to_unit_id are required.",
      });
    }

    if (fromId === toId) {
      return res.status(400).json({
        success: false,
        message: "From unit and to unit must be different.",
      });
    }

    if (
      conversion_rate === null ||
      conversion_rate === "" ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Conversion rate must be a positive number.",
      });
    }

    const [fromUnit, toUnit] = await Promise.all([
      prisma.measurement_unit.findUnique({
        where: { id: fromId },
        select: { id: true },
      }),
      prisma.measurement_unit.findUnique({
        where: { id: toId },
        select: { id: true },
      }),
    ]);

    if (!fromUnit || !toUnit) {
      return res.status(404).json({
        success: false,
        message: "From unit or to unit was not found.",
      });
    }

    const conversion = await prisma.measurement_unit_conversion.update({
      where: { id },
      data: {
        from_unit_id: fromId,
        to_unit_id: toId,
        conversion_rate: rate,
      },
      include: {
        from_unit: { include: { translations: true } },
        to_unit: { include: { translations: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Measurement unit conversion updated successfully.",
      data: conversion,
    });
  } catch (error) {
    const prismaError = error as { code?: string };

    if (prismaError?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "This unit conversion already exists.",
      });
    }

    return handleError(res, error);
  }
};
