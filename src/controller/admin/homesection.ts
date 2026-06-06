import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE HOME SECTION
export const createHomeSection = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, translations } = req.body;

    const existingSection = await prisma.home_section.findUnique({
      where: {
        code,
      },
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: "Home section code already exists",
      });
    }

    const section = await prisma.home_section.create({
      data: {
        code,

        translations: {
          create: translations,
        },
      },

      include: {
        translations: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create home section",
      error,
    });
  }
};

// GET ALL HOME SECTIONS
export const getHomeSections = async (
  _req: Request,
  res: Response
) => {
  try {
    const sections = await prisma.home_section.findMany({
      include: {
        translations: true,

        products: {
          include: {
            product: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch home sections",
      error,
    });
  }
};

// GET SINGLE HOME SECTION
export const getHomeSectionById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const section = await prisma.home_section.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        translations: true,

        products: {
          include: {
            product: {
              include: {
                translations: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Home section not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch home section",
      error,
    });
  }
};

// UPDATE HOME SECTION
export const updateHomeSection = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { code, translations } = req.body;

    await prisma.home_section_translation.deleteMany({
      where: {
        section_id: Number(id),
      },
    });

    const section = await prisma.home_section.update({
      where: {
        id: Number(id),
      },

      data: {
        code,

        translations: {
          create: translations,
        },
      },

      include: {
        translations: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update home section",
      error,
    });
  }
};

// DELETE HOME SECTION
export const deleteHomeSection = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.home_section_translation.deleteMany({
      where: {
        section_id: Number(id),
      },
    });

    await prisma.home_section.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Home section deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete home section",
      error,
    });
  }
};