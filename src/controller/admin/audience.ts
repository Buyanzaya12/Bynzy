
import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";


export const createAudience = async (req: Request, res: Response) => {
  try {
    const { code, name } = req.body;

    const existingAudience = await prisma.audience.findUnique({
      where: { code },
    });

    if (existingAudience) {
      return res.status(400).json({
        success: false,
        message: "Audience code already exists",
      });
    }

    const audience = await prisma.audience.create({
      data: {
        code,
        name,
      },
    });

    return res.status(201).json({
      success: true,
      data: audience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create audience",
      error,
    });
  }
};

// GET ALL AUDIENCES
export const getAudiences = async (_req: Request, res: Response) => {
  try {
    const audiences = await prisma.audience.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: audiences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audiences",
      error,
    });
  }
};

// GET SINGLE AUDIENCE
export const getAudienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const audience = await prisma.audience.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        product_audiences: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!audience) {
      return res.status(404).json({
        success: false,
        message: "Audience not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: audience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audience",
      error,
    });
  }
};

// UPDATE AUDIENCE
export const updateAudience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name } = req.body;

    const audience = await prisma.audience.update({
      where: {
        id: Number(id),
      },
      data: {
        code,
        name,
      },
    });

    return res.status(200).json({
      success: true,
      data: audience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update audience",
      error,
    });
  }
};

// DELETE AUDIENCE
export const deleteAudience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.audience.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Audience deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete audience",
      error,
    });
  }
};





