import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// CREATE PRODUCT AVAILABILITY
export const createProductAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const { code, translations } = req.body;

    const existingAvailability =
      await prisma.product_availability.findUnique({
        where: {
          code,
        },
      });

    if (existingAvailability) {
      return res.status(400).json({
        success: false,
        message: "Availability code already exists",
      });
    }

    const availability =
      await prisma.product_availability.create({
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
      data: availability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create product availability",
      error,
    });
  }
};

// GET ALL PRODUCT AVAILABILITIES
export const getProductAvailabilities = async (
  _req: Request,
  res: Response
) => {
  try {
    const availabilities =
      await prisma.product_availability.findMany({
        include: {
          translations: true,
          products: true,
        },

        orderBy: {
          created_at: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: availabilities,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product availabilities",
      error,
    });
  }
};

// GET SINGLE PRODUCT AVAILABILITY
export const getProductAvailabilityById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const availability =
      await prisma.product_availability.findUnique({
        where: {
          id: Number(id),
        },

        include: {
          translations: true,

          products: {
            include: {
              translations: true,
              images: true,
            },
          },
        },
      });

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "Product availability not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product availability",
      error,
    });
  }
};

// UPDATE PRODUCT AVAILABILITY
export const updateProductAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    const availability =
      await prisma.product_availability.update({
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
      data: availability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product availability",
      error,
    });
  }
};

// DELETE PRODUCT AVAILABILITY
export const deleteProductAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.product_availability.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Product availability deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product availability",
      error,
    });
  }
};