// controllers/userfavorite.ts

import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ADD TO FAVORITES
export const addToFavorites = async (
  req: Request,
  res: Response
) => {
  try {
    const { user_id, product_id } = req.body;

    const existingFavorite =
      await prisma.user_favorite.findFirst({
        where: {
          user_id,
          product_id,
        },
      });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Product already in favorites",
      });
    }

    const favorite = await prisma.user_favorite.create({
      data: {
        user_id,
        product_id,
      },

      include: {
        user: true,
        product: {
          include: {
            translations: true,
            images: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add favorite",
      error,
    });
  }
};

// GET ALL FAVORITES
export const getFavorites = async (
  _req: Request,
  res: Response
) => {
  try {
    const favorites = await prisma.user_favorite.findMany({
      include: {
        user: true,

        product: {
          include: {
            translations: true,
            images: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error,
    });
  }
};

// GET USER FAVORITES
export const getUserFavorites = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId } = req.params;

    const favorites = await prisma.user_favorite.findMany({
      where: {
        user_id: Number(userId),
      },

      include: {
        product: {
          include: {
            translations: true,
            images: true,
            brand: true,
            color: true,
          },
        },
      },

      orderBy: {
        created_at: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user favorites",
      error,
    });
  }
};

// REMOVE FAVORITE
export const removeFavorite = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await prisma.user_favorite.delete({
      where: {
        id: Number(id),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Favorite removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove favorite",
      error,
    });
  }
};