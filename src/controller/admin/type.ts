import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ─────────────────────────────
// ADD TYPE
// ─────────────────────────────
export const addType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category_id, code, translations } = req.body;

    if (!category_id || !code || !translations?.length) {
      res.status(400).json({
        error: "category_id, code and translations are required",
      });
      return;
    }

    const type = await prisma.type.create({
      data: {
        code, // ✅ MANUAL ONLY

        category_id: Number(category_id),

        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            name: t.name,
          })),
        },
      },
      include: {
        translations: true,
        category: true,
      },
    });

    res.status(201).json({
      message: "Type created successfully",
      data: type,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────
// GET TYPES
// ─────────────────────────────
export const getTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const types = await prisma.type.findMany({
      orderBy: {
        created_at: "desc",
      },

      include: {
        translations: true,

        category: {
          include: {
            translations: true,
          },
        },
      },
    });

    res.status(200).json({
      data: types,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve types",
    });
  }
};

// ─────────────────────────────
// GET BY CATEGORY
// ─────────────────────────────
export const getTypesByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoryId = Number(req.params.categoryId);
    const lang = (req.query.lang as string) || "EN";

    if (!categoryId) {
      res.status(400).json({ error: "Valid category ID required" });
      return;
    }

    const types = await prisma.type.findMany({
      where: { category_id: categoryId },
      include: { translations: true },
    });

    const formatted = types.map((t) => {
      const tr =
        t.translations.find((x) => x.language === lang) || t.translations[0];

      return {
        id: t.id,
        code: t.code,
        name: tr?.name || "",
      };
    });

    res.status(200).json({ data: formatted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve types" });
  }
};

// ─────────────────────────────
// DELETE TYPE
// ─────────────────────────────
export const deleteType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    await prisma.type.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Type deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Type not found" });
      return;
    }

    if (error.code === "P2003") {
      res.status(400).json({
        error: "Type is used in products",
      });
      return;
    }

    res.status(500).json({ error: "Failed to delete type" });
  }
};

// ─────────────────────────────
// UPDATE TYPE
// ─────────────────────────────
export const updateType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { code, category_id, translations } = req.body;

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    const type = await prisma.type.update({
      where: { id },
      data: {
        code: code ?? undefined, // ✅ manual only

        category_id: category_id ? Number(category_id) : undefined,

        translations: translations
          ? {
              deleteMany: {},
              create: translations.map((t: any) => ({
                language: t.language,
                name: t.name,
              })),
            }
          : undefined,
      },
      include: {
        translations: true,
        category: true,
      },
    });

    res.status(200).json({
      message: "Type updated successfully",
      data: type,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Type not found" });
      return;
    }

    res.status(500).json({ error: "Failed to update type" });
  }
};
