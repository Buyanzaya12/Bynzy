import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE
export const createProductAttribute = async (req: Request, res: Response) => {
  try {
    const { product_id, type_id, translations } = req.body;

    const existing = await prisma.product_attribute.findFirst({
      where: {
        product_id: Number(product_id),
        type_id: Number(type_id),
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attribute already exists for this product",
      });
    }

    const attribute = await prisma.product_attribute.create({
      data: {
        product_id: Number(product_id),
        type_id: Number(type_id),

        translations: {
          create: translations,
        },
      },

      include: {
        product: {
          include: {
            translations: true,
          },
        },

        type: {
          include: {
            translations: true,
          },
        },

        translations: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create attribute",
    });
  }
};

// GET ALL
export const getProductAttributes = async (
  req: Request,
  res: Response,
) => {
  try {
    const attributes = await prisma.product_attribute.findMany({
      include: {
        product: {
          include: {
            translations: true,
          },
        },

        type: {
          include: {
            translations: true,
          },
        },

        translations: true,
      },

      orderBy: {
        id: "desc",
      },
    });

    res.json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed",
    });
  }
};
// GET ONE
export const getProductAttributeById = async (
  req: Request,
  res: Response,
) => {
  try {
    const attribute = await prisma.product_attribute.findUnique({
      where: {
        id: Number(req.params.id),
      },

      include: {
        product: {
          include: {
            translations: true,
          },
        },

        type: {
          include: {
            translations: true,
          },
        },

        translations: true,
      },
    });

    if (!attribute) {
      return res.status(404).json({
        success: false,
      });
    }

    res.json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
};
// UPDATE
export const updateProductAttribute = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { type_id, translations } = req.body;

    const attribute = await prisma.product_attribute.update({
      where: {
        id: Number(id),
      },

      data: {
        type_id: Number(type_id),

        translations: {
          deleteMany: {},

          create: translations,
        },
      },

      include: {
        product: {
          include: {
            translations: true,
          },
        },

        type: {
          include: {
            translations: true,
          },
        },

        translations: true,
      },
    });

    res.json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
    });
  }
};

// DELETE
export const deleteProductAttribute = async (req: Request, res: Response) => {
  try {
    await prisma.product_attribute.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product attribute deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete attribute",
    });
  }
};
