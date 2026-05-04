import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const generateCode = (name: string) => {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      code,
      price,
      discount,
      type_id,
      brand_id,
      color_id,
      quantity,
      images,
      translations, // 👈 NEW FIELD
    } = req.body;

    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({
        error: "translations array is required",
      });
    }

    // optional: ensure at least EN exists
    const hasEN = translations.some((t) => t.language === "EN");
    if (!hasEN) {
      return res.status(400).json({
        error: "EN translation is required",
      });
    }

    const product = await prisma.product.create({
      data: {
        code,
        price: Number(price),
        discount: discount ? Number(discount) : null,

        type_id: Number(type_id),
        brand_id: brand_id ? Number(brand_id) : null,
        color_id: color_id ? Number(color_id) : null,

        // ✅ TRANSLATIONS (NEW CORE PART)
        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        },

        // images
        images: images?.length
          ? {
              create: images.map((url: string) => ({
                url,
              })),
            }
          : undefined,

        // stock
        stock: quantity
          ? {
              create: {
                quantity: Number(quantity),
              },
            }
          : undefined,
      },
      include: {
        translations: true,
        images: true,
        stock: true,
      },
    });

    return res.status(201).json({ data: product });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || "EN";
    const products = await prisma.product.findMany({
      orderBy: { created_at: "desc" },
      include: {
        translations: true,
        images: true,
        brand: true,
        type: true,
        color: true,
        stock: true,
      },
    });
    const formatted = products.map((p) => {
      const t =
        p.translations.find((tr) => tr.language === lang) ||
        p.translations.find((tr) => tr.language === "EN");
      return {
        id: p.id,
        code: p.code,
        price: p.price,
        discount: p.discount,

        name: t?.name || "",
        description: t?.description || "",
        images: p.images,
        brand: p.brand,
        type: p.type,
        color: p.color,
        stock: p.stock,
      };
    });
    res.status(200).json({
      data: formatted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const lang = (req.query.lang as string) || "EN";

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: true,
        brand: true,
        type: true,
        color: true,
        stock: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const t =
      product.translations.find((tr) => tr.language === lang) ||
      product.translations.find((tr) => tr.language === "EN");
    res.status(200).json({
      data: {
        id: product.id,
        code: product.code,
        price: product.price,
        discount: product.discount,
        name: t?.name || "",
        description: t?.description || "",
        images: product.images,
        brand: product.brand,
        type: product.type,
        color: product.color,
        stock: product.stock,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    const {
      code,
      price,
      discount,
      type_id,
      brand_id,
      color_id,
      images,
      translations,
    } = req.body;

    const product = await prisma.product.update({
      where: { id },

      data: {
        code: code ?? undefined,

        price: price ? Number(price) : undefined,
        type_id: type_id ? Number(type_id) : undefined,
        brand_id: brand_id ? Number(brand_id) : null,
        color_id: color_id ? Number(color_id) : null,

        translations: translations
          ? {
              deleteMany: {},
              create: translations.map((t: any) => ({
                language: t.language,
                name: t.name,
                description: t.description ?? null,
              })),
            }
          : undefined,
      },

      include: {
        images: true,
        brand: true,
        type: true,
        color: true,
        stock: true,
      },
    });

    res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    if (error.code === "P2002") {
      res.status(400).json({ error: "Duplicate product" });
      return;
    }

    res.status(500).json({ error: "Failed to update product" });
  }
};
