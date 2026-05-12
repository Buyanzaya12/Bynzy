import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

/**
 * ADD COLOR
 */
export const addColor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, image_url, translations } = req.body;

    if (!code) {
      res.status(400).json({ error: "Code is required" });
      return;
    }

    if (!translations || !Array.isArray(translations)) {
      res.status(400).json({ error: "Translations are required" });
      return;
    }

    const color = await prisma.color.create({
      data: {
        code,
        image_url: image_url || null, // ✅ optional field

        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            name: t.name,
          })),
        },
      },
      include: {
        translations: true,
      },
    });

    res.status(201).json({
      message: "Color created successfully",
      data: color,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2002") {
      res.status(400).json({ error: "Color code already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to create color" });
  }
};

/**
 * GET COLORS
 */
export const getColors = async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || "EN";

    const colors = await prisma.color.findMany({
      orderBy: { created_at: "desc" },
      include: {
        translations: true,
      },
    });

    const formatted = colors.map((color) => {
      const translation =
        color.translations.find((t) => t.language === lang) ||
        color.translations[0];

      return {
        id: color.id,
        code: color.code,
        image_url: color.image_url || null, // ✅ include image
        name: translation?.name || "",
      };
    });

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve colors" });
  }
};

/**
 * DELETE COLOR
 */
export const deleteColor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    await prisma.color.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Color deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Color not found" });
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json({
        error: "Cannot delete color. It is used by products.",
      });
      return;
    }

    res.status(500).json({ error: "Failed to delete color" });
  }
};

/**
 * UPDATE COLOR
 */
export const updateColor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { code, image_url, translations } = req.body;

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    const color = await prisma.color.update({
      where: { id },
      data: {
        code: code ?? undefined,
        image_url: image_url ?? undefined, // ✅ optional update

        translations: translations
          ? {
              deleteMany: {}, // replace all
              create: translations.map((t: any) => ({
                language: t.language,
                name: t.name,
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
      },
    });

    res.status(200).json({
      message: "Color updated successfully",
      data: color,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Color not found" });
      return;
    }

    if (error.code === "P2002") {
      res.status(400).json({ error: "Color code already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to update color" });
  }
};
