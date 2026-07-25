import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// ADD TO CART
export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { product_id, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(product_id),
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    let cart = await prisma.user_cart.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!cart) {
      cart = await prisma.user_cart.create({
        data: {
          user_id: userId,
        },
      });
    }

    const existing = await prisma.user_cart_item.findFirst({
      where: {
        cart_id: cart.id,
        product_id: Number(product_id),
      },
    });

    if (existing) {
      const item = await prisma.user_cart_item.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: existing.quantity + Number(quantity),
        },
      });

      return res.status(200).json({
        message: "Cart updated",
        data: item,
      });
    }

    const item = await prisma.user_cart_item.create({
      data: {
        cart_id: cart.id,
        product_id: Number(product_id),
        quantity: Number(quantity),
      },
    });

    return res.status(201).json({
      message: "Added to cart",
      data: item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to add to cart",
    });
  }
};

// GET CART
export const getCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.user_cart.findUnique({
      where: {
        user_id: userId,
      },

      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,

                translations: true,

                brand: true,

                color: true,

                type: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.json({
        data: null,
        total: 0,
      });
    }

    const items = cart.items.map((item) => ({
      ...item,

      subtotal: Number(item.product.price) * item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return res.json({
      data: {
        ...cart,
        items,
      },

      total,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to get cart",
    });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    const { quantity } = req.body;

    if (!quantity || Number(quantity) < 1) {
      return res.status(400).json({
        error: "Quantity must be greater than 0",
      });
    }

    const item = await prisma.user_cart_item.update({
      where: {
        id: Number(id),
      },

      data: {
        quantity: Number(quantity),
      },
    });

    return res.json({
      message: "Updated",
      data: item,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to update cart item",
    });
  }
};

// REMOVE ITEM
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user_cart_item.delete({
      where: {
        id: Number(id),
      },
    });

    return res.json({
      message: "Removed from cart",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to remove item",
    });
  }
};

// CLEAR CART
export const clearCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.user_cart.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!cart) {
      return res.json({
        message: "Cart already empty",
      });
    }

    await prisma.user_cart_item.deleteMany({
      where: {
        cart_id: cart.id,
      },
    });

    return res.json({
      message: "Cart cleared",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to clear cart",
    });
  }
};
