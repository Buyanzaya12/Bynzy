// import { Response } from "express";
// import { prisma } from "../../lib/prisma";

// // ADD TO CART
// export const addToCart = async (req: any, res: Response) => {
//   try {
//     const userId = req.user.id;

//     const { product_id, variant_id, quantity = 1 } = req.body;

// const productId = Number(product_id);
// const requestedQuantity = Number(quantity);

// const variantId = variant_id !== null &&
// variant_id !== undefined &&
// variant_id !== ""
// ? Number(variant_id)
// : null;

//  if (!productId) {
//   return res.status(400).json({
//     error: "Product ID is required",
//   });
//  }

//     if (!requestedQuantity || requestedQuantity < 1) {
//       return res.status(400).json({
//         error: "Quantity must be greater than 0",
//       });
//     }

//    const product = await prisma.product.findUnique({
//     where: {
//       id: productId,
//     },
//    });
//    if (!product) {
//     return res.status(404).json({
//       error: "Product not found",
//     });
//    }

//    let variant = null;

//    if (variantId !== null) {
//     variant = await prisma.product_variant.findFirst({
//       where: {
//         id: variantId,
//         product_id: productId,
//       },
//     });
//     if (!variant) {
//       return res.status(404).json({
//         error: "Product variant not found",
//       });
//     }

//   if (requestedQuantity > variant.quantity) {
//     return res.status(400).json({
//       error: `Only ${variant.quantity} items available for this variant`,
//     });
//   }
// } else {
// const stock = await prisma.product_stock.findUnique({
//   where: {
//     product_id: productId,
//   },
// });
//   if (stock && requestedQuantity > stock.quantity) {
//     return res.status(400).json({
//       error: `Only ${stock.quantity} items available for this product`,
//     });
//   }
// }

// let cart = await prisma.user_cart.findUnique({
//   where: {
//     user_id: userId,
//   },
// });
//      if (!cart) {
//       cart = await prisma.user_cart.create({
//         data: {
//           user_id: userId,
//         },
//       });
//     }
//     const existing = await prisma.user_cart_item.findFirst({
//       where: {
//         cart_id: cart.id,
//         product_id: productId,
//         variant_id: variantId,
//       },
//     });
// // GET CART
// export const getCart = async (req: any, res: Response) => {
//   try {
//     const userId = req.user.id;

//     const cart = await prisma.user_cart.findUnique({
//       where: {
//         user_id: userId,
//       },

//       include: {
//         items: {
//           include: {
//             product: {
//               include: {
//                 images: true,

//                 translations: true,

//                 brand: true,

//                 color: true,

//                 type: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!cart) {
//       return res.json({
//         data: null,
//         total: 0,
//       });
//     }

//     const items = cart.items.map((item) => ({
//       ...item,

//       subtotal: Number(item.product.price) * item.quantity,
//     }));

//     const total = items.reduce((sum, item) => sum + item.subtotal, 0);

//     return res.json({
//       data: {
//         ...cart,
//         items,
//       },

//       total,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       error: "Failed to get cart",
//     });
//   }
// };

// // UPDATE CART ITEM
// export const updateCartItem = async (req: any, res: Response) => {
//   try {
//     const { id } = req.params;

//     const { quantity } = req.body;

//     if (!quantity || Number(quantity) < 1) {
//       return res.status(400).json({
//         error: "Quantity must be greater than 0",
//       });
//     }

//     const item = await prisma.user_cart_item.update({
//       where: {
//         id: Number(id),
//       },

//       data: {
//         quantity: Number(quantity),
//       },
//     });

//     return res.json({
//       message: "Updated",
//       data: item,
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       error: "Failed to update cart item",
//     });
//   }
// };

// // REMOVE ITEM
// export const removeFromCart = async (req: any, res: Response) => {
//   try {
//     const { id } = req.params;

//     await prisma.user_cart_item.delete({
//       where: {
//         id: Number(id),
//       },
//     });

//     return res.json({
//       message: "Removed from cart",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       error: "Failed to remove item",
//     });
//   }
// };

// // CLEAR CART
// export const clearCart = async (req: any, res: Response) => {
//   try {
//     const userId = req.user.id;

//     const cart = await prisma.user_cart.findUnique({
//       where: {
//         user_id: userId,
//       },
//     });

//     if (!cart) {
//       return res.json({
//         message: "Cart already empty",
//       });
//     }

//     await prisma.user_cart_item.deleteMany({
//       where: {
//         cart_id: cart.id,
//       },
//     });

//     return res.json({
//       message: "Cart cleared",
//     });
//   } catch (error) {
//     console.error(error);

//     return res.status(500).json({
//       error: "Failed to clear cart",
//     });
//   }
// };
import { Response } from "express";
import { prisma } from "../../lib/prisma";

// =====================================================
// ADD TO CART
// =====================================================

export const addToCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { product_id, variant_id, quantity = 1 } = req.body;

    const productId = Number(product_id);
    const requestedQuantity = Number(quantity);

    const variantId =
      variant_id !== null && variant_id !== undefined && variant_id !== ""
        ? Number(variant_id)
        : null;

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (!productId) {
      return res.status(400).json({
        error: "Product id is required",
      });
    }

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({
        error: "Quantity must be greater than 0",
      });
    }

    // -----------------------------------------
    // FIND PRODUCT
    // -----------------------------------------

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // -----------------------------------------
    // FIND VARIANT
    // -----------------------------------------

    let variant = null;

    if (variantId !== null) {
      variant = await prisma.product_variant.findFirst({
        where: {
          id: variantId,
          product_id: productId,
        },
      });

      if (!variant) {
        return res.status(404).json({
          error: "Product variant not found",
        });
      }

      // Variant has its own stock
      if (requestedQuantity > variant.quantity) {
        return res.status(400).json({
          error: `Only ${variant.quantity} items available`,
        });
      }
    } else {
      // -----------------------------------------
      // MAIN PRODUCT STOCK
      // -----------------------------------------

      const stock = await prisma.product_stock.findUnique({
        where: {
          product_id: productId,
        },
      });

      if (stock && requestedQuantity > stock.quantity) {
        return res.status(400).json({
          error: `Only ${stock.quantity} items available`,
        });
      }
    }

    // -----------------------------------------
    // FIND OR CREATE CART
    // -----------------------------------------

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

    // -----------------------------------------
    // FIND EXISTING ITEM
    //
    // IMPORTANT:
    //
    // Product 10
    // Variant null
    //
    // is different from
    //
    // Product 10
    // Variant 25
    //
    // and different from
    //
    // Product 10
    // Variant 26
    // -----------------------------------------

    const existing = await prisma.user_cart_item.findFirst({
      where: {
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId,
      },
    });

    // -----------------------------------------
    // UPDATE EXISTING ITEM
    // -----------------------------------------

    if (existing) {
      const newQuantity = existing.quantity + requestedQuantity;

      // Check stock again
      if (variant) {
        if (newQuantity > variant.quantity) {
          return res.status(400).json({
            error: `Only ${variant.quantity} items available`,
          });
        }
      } else {
        const stock = await prisma.product_stock.findUnique({
          where: {
            product_id: productId,
          },
        });

        if (stock && newQuantity > stock.quantity) {
          return res.status(400).json({
            error: `Only ${stock.quantity} items available`,
          });
        }
      }

      const item = await prisma.user_cart_item.update({
        where: {
          id: existing.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
          variant: true,
        },
      });

      return res.status(200).json({
        message: "Cart updated",
        data: item,
      });
    }

    // -----------------------------------------
    // CREATE NEW ITEM
    // -----------------------------------------

    const item = await prisma.user_cart_item.create({
      data: {
        cart_id: cart.id,
        product_id: productId,
        variant_id: variantId,
        quantity: requestedQuantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return res.status(201).json({
      message: "Added to cart",
      data: item,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      error: "Failed to add to cart",
    });
  }
};

// =====================================================
// GET CART
// =====================================================

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
                color: {
                  include: {
                    translations: true,
                  },
                },
                type: {
                  include: {
                    translations: true,
                  },
                },
                stock: true,
              },
            },

            variant: {
              include: {
                color: {
                  include: {
                    translations: true,
                  },
                },

                images: true,
              },
            },
          },
        },
      },
    });

    // -----------------------------------------
    // EMPTY CART
    // -----------------------------------------

    if (!cart) {
      return res.json({
        data: null,
        total: 0,
      });
    }

    // -----------------------------------------
    // FORMAT ITEMS
    // -----------------------------------------

    const items = cart.items.map((item) => {
      /*
       * If variant exists:
       *
       * price = variant.price
       * stock = variant.quantity
       *
       * Otherwise:
       *
       * price = product.price
       * stock = product.stock.quantity
       */

      const price = item.variant
        ? Number(item.variant.price ?? item.product.price ?? 0)
        : Number(item.product.price ?? 0);

      const stock = item.variant
        ? Number(item.variant.quantity ?? 0)
        : Number(item.product.stock?.quantity ?? 0);

      return {
        id: item.id,

        product_id: item.product_id,

        variant_id: item.variant_id,

        quantity: item.quantity,

        price,

        stock,

        subtotal: price * item.quantity,

        product: item.product,

        variant: item.variant,
      };
    });

    // -----------------------------------------
    // CART TOTAL
    // -----------------------------------------

    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return res.json({
      data: {
        id: cart.id,
        user_id: cart.user_id,
        items,
      },

      total,
    });
  } catch (error) {
    console.error("GET CART ERROR:", error);

    return res.status(500).json({
      error: "Failed to get cart",
    });
  }
};

// =====================================================
// UPDATE CART ITEM
// =====================================================

export const updateCartItem = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const { quantity } = req.body;

    const cartItemId = Number(id);
    const newQuantity = Number(quantity);

    if (!cartItemId) {
      return res.status(400).json({
        error: "Valid cart item id required",
      });
    }

    if (!newQuantity || newQuantity < 1) {
      return res.status(400).json({
        error: "Quantity must be greater than 0",
      });
    }

    // -----------------------------------------
    // FIND CART ITEM
    // -----------------------------------------

    const item = await prisma.user_cart_item.findFirst({
      where: {
        id: cartItemId,

        cart: {
          user_id: userId,
        },
      },

      include: {
        product: {
          include: {
            stock: true,
          },
        },

        variant: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }

    // -----------------------------------------
    // DETERMINE STOCK
    // -----------------------------------------

    let availableStock = 0;

    if (item.variant) {
      availableStock = Number(item.variant.quantity ?? 0);
    } else {
      availableStock = Number(item.product.stock?.quantity ?? 0);
    }

    // -----------------------------------------
    // STOCK VALIDATION
    // -----------------------------------------

    if (newQuantity > availableStock) {
      return res.status(400).json({
        error: `Only ${availableStock} items available`,
      });
    }

    // -----------------------------------------
    // UPDATE
    // -----------------------------------------

    const updated = await prisma.user_cart_item.update({
      where: {
        id: cartItemId,
      },

      data: {
        quantity: newQuantity,
      },

      include: {
        product: true,
        variant: true,
      },
    });

    return res.json({
      message: "Cart item updated",

      data: updated,
    });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);

    return res.status(500).json({
      error: "Failed to update cart item",
    });
  }
};

// =====================================================
// REMOVE FROM CART
// =====================================================

export const removeFromCart = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;

    const cartItemId = Number(id);

    if (!cartItemId) {
      return res.status(400).json({
        error: "Valid cart item id required",
      });
    }

    // -----------------------------------------
    // MAKE SURE ITEM BELONGS TO USER
    // -----------------------------------------

    const item = await prisma.user_cart_item.findFirst({
      where: {
        id: cartItemId,

        cart: {
          user_id: userId,
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        error: "Cart item not found",
      });
    }

    // -----------------------------------------
    // DELETE
    // -----------------------------------------

    await prisma.user_cart_item.delete({
      where: {
        id: cartItemId,
      },
    });

    return res.json({
      message: "Removed from cart",
    });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);

    return res.status(500).json({
      error: "Failed to remove item",
    });
  }
};

// =====================================================
// CLEAR CART
// =====================================================

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
    console.error("CLEAR CART ERROR:", error);

    return res.status(500).json({
      error: "Failed to clear cart",
    });
  }
};
