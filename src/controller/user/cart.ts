import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

// 🛒 ADD TO CART
export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: "Product and quantity required" });
    }

    // 1️⃣ Get or create cart
    let cart = await prisma.user_cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = await prisma.user_cart.create({
        data: { user_id: userId },
      });
    }

    // 2️⃣ Check if item exists
    const existingItem = await prisma.user_cart_item.findFirst({
      where: {
        cart_id: cart.id,
        product_id: Number(product_id),
      },
    });

    if (existingItem) {
      // update quantity
      const item = await prisma.user_cart_item.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + Number(quantity),
        },
      });

      return res.json({ message: "Cart updated", data: item });
    }

    // 3️⃣ create new item
    const item = await prisma.user_cart_item.create({
      data: {
        cart_id: cart.id,
        product_id: Number(product_id),
        quantity: Number(quantity),
      },
    });

    res.json({ message: "Added to cart", data: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

// 🛒 GET CART
export const getCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const cart = await prisma.user_cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                brand: true,
                type: true,
                color: true,
              },
            },
          },
        },
      },
    });

    res.json({ data: cart });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cart" });
  }
};

// 🗑️ REMOVE ITEM
export const removeFromCart = async (req: any, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user_cart_item.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item" });
  }
};

// ✏️ UPDATE QUANTITY
export const updateCartItem = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const item = await prisma.user_cart_item.update({
      where: { id: Number(id) },
      data: { quantity: Number(quantity) },
    });

    res.json({ message: "Updated", data: item });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart" });
  }
};
