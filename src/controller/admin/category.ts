import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { code, translations } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Code required" });
    }

    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({ error: "Translations required" });
    }

    const category = await prisma.category.create({
      data: {
        code,
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

    return res.status(201).json({
      data: category,
    });
  } catch (e: any) {
    return res.status(500).json({
      error: e.message,
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const lang = String(req.query.lang || "EN").toUpperCase();

    const categories = await prisma.category.findMany({
      orderBy: {
        created_at: "desc",
      },

      include: {
        translations: true,
        types: {
          include: {
            translations: {
              where: {
                language: lang as any,
              },
            },
          },
        },
      },
    });

    const data = categories.map((category) => ({
      id: category.id,

      code: category.code,

      slug: category.code,

      // Keep this for pages that only need one language
      name: category.translations[0]?.name ?? category.code,

      // ✅ Send translations to frontend
      translations: category.translations,

      types: category.types.map((type) => ({
        id: type.id,

        code: type.code,

        slug: type.code,

        name: type.translations[0]?.name ?? type.code,

        translations: type.translations,
      })),
    }));

    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to retrieve categories",
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: "Valid ID required",
      });
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    return res.status(500).json({
      error: "Failed to delete category",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const { code, translations } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Valid ID required",
      });
    }

    const category = await prisma.category.update({
      where: {
        id,
      },

      data: {
        code: code ?? undefined,

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
      },
    });

    return res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Duplicate code or translation conflict",
      });
    }

    return res.status(500).json({
      error: "Failed to update category",
    });
  }
};
