import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE
export const createProductAttributeType = async (
  req: Request,
  res: Response,
) => {
  try {
    const { code, display_order, translations } = req.body;

    const existing = await prisma.product_attribute_type.findUnique({
      where: {
        code,
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attribute type code already exists",
      });
    }

    const attributeType = await prisma.product_attribute_type.create({
      data: {
        code,
        display_order: Number(display_order || 0),

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
      data: attributeType,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product attribute type",
      error,
    });
  }
};

// GET ALL
export const getProductAttributeTypes = async (
  _req: Request,
  res: Response,
) => {
  try {
    const attributeTypes = await prisma.product_attribute_type.findMany({
      include: {
        translations: true,
      },

      orderBy: {
        display_order: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: attributeTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product attribute types",
      error,
    });
  }
};

// GET ONE
export const getProductAttributeTypeById = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const attributeType = await prisma.product_attribute_type.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        translations: true,
      },
    });

    if (!attributeType) {
      return res.status(404).json({
        success: false,
        message: "Product attribute type not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: attributeType,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product attribute type",
      error,
    });
  }
};

// UPDATE
export const updateProductAttributeType = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    const { code, display_order, translations } = req.body;

    const attributeType = await prisma.product_attribute_type.update({
      where: {
        id: Number(id),
      },

      data: {
        code,
        display_order: Number(display_order || 0),

        translations: translations
          ? {
              deleteMany: {},

              create: translations,
            }
          : undefined,
      },

      include: {
        translations: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: attributeType,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product attribute type",
      error,
    });
  }
};

// DELETE
export const deleteProductAttributeType = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    await prisma.product_attribute_type.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product attribute type deleted successfully",
    });
  } catch (error: any) {
    console.log(error);

    if (error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "This attribute type is already used by products",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete product attribute type",
      error,
    });
  }
};
