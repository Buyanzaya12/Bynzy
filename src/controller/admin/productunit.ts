import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE PRODUCT UNIT
export const createProductUnit = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, translations } = req.body;

    const existingUnit = await prisma.product_unit.findUnique({
      where: {
        code,
      },
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "Product unit code already exists",
      });
    }

    const unit = await prisma.product_unit.create({
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
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product unit",
      error,
    });
  }
};

// GET ALL PRODUCT UNITS
export const getProductUnits = async (
  _req: Request,
  res: Response
) => {
  try {
    const units = await prisma.product_unit.findMany({
      include: {
        translations: true,
        product_units: {
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
      data: units,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product units",
      error,
    });
  }
};

// GET SINGLE PRODUCT UNIT
export const getProductUnitById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const unit = await prisma.product_unit.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        translations: true,

        product_units: {
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

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Product unit not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product unit",
      error,
    });
  }
};

// UPDATE PRODUCT UNIT
export const updateProductUnit = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const unit = await prisma.product_unit.update({
      where: {
        id: Number(id),
      },

      data: {
        code,
      },

      include: {
        translations: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product unit",
      error,
    });
  }
};

// DELETE PRODUCT UNIT
export const deleteProductUnit = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.product_unit.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product unit deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product unit",
      error,
    });
  }
};