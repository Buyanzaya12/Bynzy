import { Request, Response } from "express";
import cloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";

// CREATE BRAND (CLOUDINARY)
export const addBrand = async (req: Request, res: Response) => {
  try {
    const { name, code, image_url } = req.body;

    const brand = await prisma.brand.create({
      data: {
        name,
        code,
        image_url,
      },
    });

    return res.status(201).json({
      success: true,
      data: brand,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Failed to create brand",
    });
  }
};

// GET ALL BRANDS
export const getBrands = async (_req: Request, res: Response) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
    });
  }
};

// GET SINGLE BRAND
export const getBrandById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        products: {
          include: {
            translations: true,
            images: true,
          },
        },
      },
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
    });
  }
};

// UPDATE BRAND
export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const file = req.file as Express.Multer.File | undefined;

    const existing = await prisma.brand.findFirst({
      where: {
        code,
        NOT: { id: Number(id) },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Code already exists",
      });
    }

    let image_url: string | undefined;


    if (file) {
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "brands" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        stream.end(file.buffer);
      });

      image_url = uploadResult.secure_url;
    }
    const brand = await prisma.brand.update({
      where: { id: Number(id) },
      data: {
        name,
        code,
        ...(image_url && { image_url }),
      },
    });

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update brand",
    });
  }
};

// DELETE BRAND
export const deleteBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.brand.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete brand",
    });
  }
};
