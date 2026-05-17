import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE PRODUCT ATTRIBUTE
export const createProductAttribute = async (
  req: Request,
  res: Response
) => {
  try {
    const { product_id, type_id, value } = req.body;

    const existingAttribute = await prisma.product_attribute.findFirst({
      where: {
        product_id,
        type_id,
      },
    });

    if (existingAttribute) {
      return res.status(400).json({
        success: false,
        message: "Attribute already exists for this product",
      });
    }

    const attribute = await prisma.product_attribute.create({
      data: {
        product_id,
        type_id,
        value,
      },
      include: {
        product: true,
        type: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product attribute",
      error,
    });
  }
};

// GET ALL PRODUCT ATTRIBUTES
export const getProductAttributes = async (
  _req: Request,
  res: Response
) => {
  try {
    const attributes = await prisma.product_attribute.findMany({
      include: {
        product: true,
        type: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: attributes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product attributes",
      error,
    });
  }
};

// GET SINGLE PRODUCT ATTRIBUTE
export const getProductAttributeById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const attribute = await prisma.product_attribute.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        product: true,
        type: true,
      },
    });

    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: "Product attribute not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product attribute",
      error,
    });
  }
};

// UPDATE PRODUCT ATTRIBUTE
export const updateProductAttribute = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { value, type_id } = req.body;

    const attribute = await prisma.product_attribute.update({
      where: {
        id: Number(id),
      },
      data: {
        value,
        type_id,
      },
      include: {
        product: true,
        type: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product attribute",
      error,
    });
  }
};

// DELETE PRODUCT ATTRIBUTE
export const deleteProductAttribute = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.product_attribute.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product attribute deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product attribute",
      error,
    });
  }
};