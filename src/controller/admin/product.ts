import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const generateCode = (name: string) => {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    console.log("========== PRODUCT REQUEST ==========");
    console.log(JSON.stringify(req.body, null, 2));
    const {
      code,
      price,
      discount,

      type_id,
      brand_id,
      color_id,

      availability_id,
      stock_profile_id,

      quantity,
      arrival_date,

      images,
      translations,

      audience_ids,
      home_section_ids,

      attributes,
      units,
    } = req.body;

    if (!translations || !Array.isArray(translations)) {
      return res.status(400).json({
        error: "translations array is required",
      });
    }

    const hasEN = translations.some((t: any) => t.language === "EN");

    if (!hasEN) {
      return res.status(400).json({
        error: "EN translation is required",
      });
    }
    console.log("IMAGES RECEIVED:", images);
    console.log("TRANSLATIONS:", translations);
    const product = await prisma.product.create({
      data: {
        code,

        price: Number(price),

        discount: discount ? Number(discount) : null,

        type_id: Number(type_id),

        brand_id: brand_id ? Number(brand_id) : null,

        color_id: color_id ? Number(color_id) : null,

        availability_id: availability_id ? Number(availability_id) : null,

        stock_profile_id: stock_profile_id ? Number(stock_profile_id) : null,

        arrival_date: arrival_date ? new Date(arrival_date) : null,

        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            name: t.name,
            description: t.description || null,
          })),
        },

        images: images?.length
          ? {
              create: images.map((url: string) => ({
                url,
              })),
            }
          : undefined,

        stock: quantity
          ? {
              create: {
                quantity: Number(quantity),
              },
            }
          : undefined,

        product_audiences: audience_ids?.length
          ? {
              create: audience_ids.map((id: number) => ({
                audience_id: Number(id),
              })),
            }
          : undefined,

        product_home_sections: home_section_ids?.length
          ? {
              create: home_section_ids.map((id: number) => ({
                section_id: Number(id),
              })),
            }
          : undefined,

        product_attributes: attributes?.length
          ? {
              create: attributes.map((attr: any) => ({
                type_id: Number(attr.type_id),
                value: attr.value,
              })),
            }
          : undefined,

        product_unit_maps: units?.length
          ? {
              create: units.map((unit: any) => ({
                unit_id: Number(unit.unit_id),

                quantity_in_base: Number(unit.quantity_in_base),

                price: unit.price ? Number(unit.price) : null,
              })),
            }
          : undefined,
      },

      include: {
        translations: true,

        images: true,

        stock: true,

        availability: true,

        stock_profile: true,

        product_audiences: {
          include: {
            audience: true,
          },
        },

        product_home_sections: {
          include: {
            section: true,
          },
        },

        product_attributes: {
          include: {
            type: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_unit_maps: {
          include: {
            unit: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });
    console.log("CREATED PRODUCT IMAGES:", product.images);
    return res.status(201).json({
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || "EN";

    const products = await prisma.product.findMany({
      orderBy: {
        created_at: "desc",
      },

      include: {
        translations: true,

        images: true,

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

        availability: {
          include: {
            translations: true,
          },
        },

        stock_profile: {
          include: {
            translations: true,
          },
        },

        product_audiences: {
          include: {
            audience: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_home_sections: {
          include: {
            section: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_attributes: {
          include: {
            type: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_unit_maps: {
          include: {
            unit: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    const formatted = products.map((product) => {
      const translation =
        product.translations.find((x) => x.language === lang) ||
        product.translations.find((x) => x.language === "EN");

      return {
        id: product.id,

        code: product.code,

        price: product.price,

        discount: product.discount,

        arrival_date: product.arrival_date,

        name: translation?.name || "",

        description: translation?.description || "",

        images: product.images,

        brand: product.brand,

        color: product.color,

        type: product.type,

        stock: product.stock,

        availability: product.availability,

        stock_profile: product.stock_profile,

        audiences: product.product_audiences,

        home_sections: product.product_home_sections,

        attributes: product.product_attributes,

        units: product.product_unit_maps,
      };
    });

    res.status(200).json({
      data: formatted,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve products",
    });
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
      res.status(400).json({
        error: "Valid ID required",
      });

      return;
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        translations: true,

        images: true,

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

        availability: {
          include: {
            translations: true,
          },
        },

        stock_profile: {
          include: {
            translations: true,
          },
        },

        product_audiences: {
          include: {
            audience: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_home_sections: {
          include: {
            section: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_attributes: {
          include: {
            type: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_unit_maps: {
          include: {
            unit: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        error: "Product not found",
      });

      return;
    }

    const translation =
      product.translations.find((x) => x.language === lang) ||
      product.translations.find((x) => x.language === "EN");

    res.status(200).json({
      data: {
        id: product.id,

        code: product.code,

        price: product.price,

        discount: product.discount,

        arrival_date: product.arrival_date,

        name: translation?.name || "",

        description: translation?.description || "",

        images: product.images,

        brand: product.brand,

        color: product.color,

        type: product.type,

        stock: product.stock,

        availability: product.availability,

        stock_profile: product.stock_profile,

        audiences: product.product_audiences,

        home_sections: product.product_home_sections,

        attributes: product.product_attributes,

        units: product.product_unit_maps,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to retrieve product",
    });
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
      res.status(400).json({
        error: "Valid product id required",
      });
      return;
    }

    const {
      code,
      price,
      discount,

      type_id,
      brand_id,
      color_id,

      availability_id,
      stock_profile_id,

      quantity,
      arrival_date,

      images,
      translations,

      audience_ids,
      home_section_ids,

      attributes,
      units,
    } = req.body;

    const product = await prisma.product.update({
      where: {
        id,
      },

      data: {
        code: code ?? undefined,

        price: price !== undefined ? Number(price) : undefined,

        discount: discount !== undefined ? Number(discount) : undefined,

        type_id: type_id !== undefined ? Number(type_id) : undefined,

        brand_id: brand_id ? Number(brand_id) : null,

        color_id: color_id ? Number(color_id) : null,

        availability_id: availability_id ? Number(availability_id) : null,

        stock_profile_id: stock_profile_id ? Number(stock_profile_id) : null,

        arrival_date: arrival_date ? new Date(arrival_date) : null,

        // TRANSLATIONS
        translations: translations
          ? {
              deleteMany: {},

              create: translations.map((t: any) => ({
                language: t.language,
                name: t.name,
                description: t.description || null,
              })),
            }
          : undefined,

        // IMAGES
        images: images
          ? {
              deleteMany: {},

              create: images.map((url: string) => ({
                url,
              })),
            }
          : undefined,

        // STOCK
        stock:
          quantity !== undefined
            ? {
                upsert: {
                  create: {
                    quantity: Number(quantity),
                  },

                  update: {
                    quantity: Number(quantity),
                  },
                },
              }
            : undefined,

        // AUDIENCES
        product_audiences: audience_ids
          ? {
              deleteMany: {},

              create: audience_ids.map((id: number) => ({
                audience_id: Number(id),
              })),
            }
          : undefined,

        // HOME SECTIONS
        product_home_sections: home_section_ids
          ? {
              deleteMany: {},

              create: home_section_ids.map((id: number) => ({
                section_id: Number(id),
              })),
            }
          : undefined,

        // ATTRIBUTES
        product_attributes: attributes
          ? {
              deleteMany: {},

              create: attributes.map((attr: any) => ({
                type_id: Number(attr.type_id),
                value: attr.value,
              })),
            }
          : undefined,

        // UNITS
        product_unit_maps: units
          ? {
              deleteMany: {},

              create: units.map((unit: any) => ({
                unit_id: Number(unit.unit_id),

                quantity_in_base: Number(unit.quantity_in_base),

                price: unit.price ? Number(unit.price) : null,
              })),
            }
          : undefined,
      },

      include: {
        translations: true,

        images: true,

        stock: true,

        availability: true,

        stock_profile: true,

        brand: true,

        color: true,

        type: true,

        product_audiences: {
          include: {
            audience: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_home_sections: {
          include: {
            section: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_attributes: {
          include: {
            type: {
              include: {
                translations: true,
              },
            },
          },
        },

        product_unit_maps: {
          include: {
            unit: {
              include: {
                translations: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({
        error: "Product not found",
      });
      return;
    }

    if (error.code === "P2002") {
      res.status(400).json({
        error: "Duplicate product code",
      });
      return;
    }

    res.status(500).json({
      error: error.message,
    });
  }
};
