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

      variants,
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

        color_id: null,

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

        images:
          !variants?.length && images?.length
            ? {
                create: images.map((url: string) => ({
                  url,
                })),
              }
            : undefined,

        stock:
          !variants?.length && quantity
            ? {
                create: {
                  quantity: Number(quantity),
                },
              }
            : undefined,

        product_variants: variants?.length
          ? {
              create: variants.map((variant: any) => ({
                color_id: variant.color_id ? Number(variant.color_id) : null,

                quantity: Number(variant.quantity),

                price: variant.price ? Number(variant.price) : null,

                images: {
                  create: variant.images.map((url: string) => ({
                    url,
                  })),
                },
              })),
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

                translations: {
                  create: [
                    {
                      language: "MN",
                      value: attr.value,
                    },
                    {
                      language: "EN",
                      value: attr.value,
                    },
                    {
                      language: "RU",
                      value: attr.value,
                    },
                    {
                      language: "ZH",
                      value: attr.value,
                    },
                    {
                      language: "DE",
                      value: attr.value,
                    },
                    {
                      language: "FR",
                      value: attr.value,
                    },
                  ],
                },
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

        product_variants: {
          include: {
            color: {
              include: {
                translations: true,
              },
            },

            images: true,
          },
        },

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

            translations: true,
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

type SupportedLanguage = "MN" | "EN" | "RU" | "ZH" | "DE" | "FR";

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const requestedLang = (req.query.lang as string) || "EN";
    // Жижиг үсгээр ирсэн ч (mn), заавал том үсэг (MN) болгож бэлдэнэ
    const targetLang = requestedLang.trim().toUpperCase();

    const products = await prisma.product.findMany({
      orderBy: {
        created_at: "desc",
      },
      include: {
        translations: true,
        images: true,
        brand: true,
        type: {
          include: {
            translations: true,
            category: {
              include: {
                translations: true,
              },
            },
          },
        },
        stock: true,
      },
    });

    const formatted = products.map((product) => {
      // 1. 🛡️ ХЭЛ ШҮҮЛТҮҮРИЙГ БАТАЛГААЖУУЛАХ (Энд String хөрвүүлэлт хийж хайж байна)
      const productTranslation =
        product.translations.find(
          (x) => String(x.language).toUpperCase() === targetLang,
        ) ||
        product.translations.find(
          (x) => String(x.language).toUpperCase() === "EN",
        ) ||
        product.translations[0];

      const typeTranslation =
        product.type?.translations?.find(
          (x) => String(x.language).toUpperCase() === targetLang,
        ) ||
        product.type?.translations?.find(
          (x) => String(x.language).toUpperCase() === "EN",
        ) ||
        product.type?.translations[0];

      const categoryTranslation =
        product.type?.category?.translations?.find(
          (x) => String(x.language).toUpperCase() === targetLang,
        ) ||
        product.type?.category?.translations?.find(
          (x) => String(x.language).toUpperCase() === "EN",
        ) ||
        product.type?.category?.translations[0];
      console.log("GET PRODUCTS CALLED");
      return {
        id: product.id,
        code: product.code,
        price: product.price,
        discount: product.discount,
        arrival_date: product.arrival_date,

        // Сонгосон хэлээр нь бэлэн текст болгож фронт руу илгээнэ
        name: productTranslation?.name || "Untitled Product",
        description: productTranslation?.description || "",
        category: categoryTranslation?.name || "stationery",
        type_name: typeTranslation?.name || "items",

        // Хуучин фронт талын ProductCard болон HomePage-ийн кодуудыг эвдэхгүй хэвээр нь үлдээв
        translations: product.translations,
        type: product.type,
        images: product.images,
        brand: product.brand,
        stock: product.stock,
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

export const getProductByCode = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const code = String(req.params.code);
    const lang = (req.query.lang as string) || "EN";

    if (!code) {
      res.status(400).json({
        error: "Product code required",
      });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        code,
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
            translations: true,
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

        product_variants: {
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
    });

    if (!product) {
      res.status(404).json({
        error: "Product not found",
      });
      return;
    }

    res.status(200).json({
      data: {
        id: product.id,

        code: product.code,

        translations: product.translations,

        price: product.price,

        discount: product.discount,

        arrival_date: product.arrival_date,

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

        variants: product.product_variants.map((variant: any) => ({
          id: variant.id,

          price: variant.price ? Number(variant.price) : Number(product.price),

          quantity: variant.quantity,

          color: variant.color
            ? {
                id: variant.color.id,

                image_url: variant.color.image_url,

                name:
                  variant.color.translations.find(
                    (t: any) => t.language === lang,
                  )?.name ??
                  variant.color.translations.find(
                    (t: any) => t.language === "EN",
                  )?.name ??
                  variant.color.translations[0]?.name ??
                  "",
              }
            : null,

          images: variant.images,
        })),
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

    console.log("CODE:", error.code);
    console.log("META:", error.meta);
    if (error.code === "P2025") {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.status(500).json({ error: "Failed to delete product" });
  }
};
// export const updateProduct = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const id = Number(req.params.id);

//     if (!id) {
//       res.status(404).json({
//         error: "Product not found",
//       });
//       return;
//     }

//     const {
//       code,
//       price,
//       discount,

//       type_id,
//       brand_id,
//       color_id,

//       availability_id,
//       stock_profile_id,

//       quantity,
//       arrival_date,

//       images,
//       translations,

//       audience_ids,
//       home_section_ids,

//       attributes,
//       units,

//       variants, // NEW
//     } = req.body;

//     // Remove old attribute translations
//     await prisma.product_attribute_translation.deleteMany({
//       where: {
//         attribute: {
//           product_id: id,
//         },
//       },
//     });

//     // Remove old attributes
//     await prisma.product_attribute.deleteMany({
//       where: {
//         product_id: id,
//       },
//     });

//     // Remove old variant images
//     await prisma.product_variant_image.deleteMany({
//       where: {
//         variant: {
//           product_id: id,
//         },
//       },
//     });

//     // Remove old variants
//     await prisma.product_variant.deleteMany({
//       where: {
//         product_id: id,
//       },
//     });

//     const product = await prisma.product.update({
//       where: {
//         id,
//       },

//       data: {
//         code: code ?? undefined,

//         price: price !== undefined ? Number(price) : undefined,

//         discount: discount !== undefined ? Number(discount) : undefined,

//         type:
//           type_id !== undefined
//             ? { connect: { id: Number(type_id) } }
//             : undefined,

//         brand:
//           brand_id !== undefined
//             ? brand_id
//               ? {
//                   connect: {
//                     id: Number(brand_id),
//                   },
//                 }
//               : {
//                   disconnect: true,
//                 }
//             : undefined,

//         color:
//           color_id !== undefined
//             ? color_id
//               ? {
//                   connect: {
//                     id: Number(color_id),
//                   },
//                 }
//               : {
//                   disconnect: true,
//                 }
//             : undefined,

//         availability:
//           availability_id !== undefined
//             ? availability_id
//               ? {
//                   connect: {
//                     id: Number(availability_id),
//                   },
//                 }
//               : {
//                   disconnect: true,
//                 }
//             : undefined,

//         stock_profile:
//           stock_profile_id !== undefined
//             ? stock_profile_id
//               ? {
//                   connect: {
//                     id: Number(stock_profile_id),
//                   },
//                 }
//               : {
//                   disconnect: true,
//                 }
//             : undefined,

//         arrival_date: arrival_date ? new Date(arrival_date) : null,

//         // TRANSLATIONS
//         translations: translations
//           ? {
//               deleteMany: {},

//               create: translations.map((t: any) => ({
//                 language: t.language,
//                 name: t.name,
//                 description: t.description || null,
//               })),
//             }
//           : undefined,

//         // IMAGES
//         images: images
//           ? {
//               deleteMany: {},

//               create: images.map((url: string) => ({
//                 url,
//               })),
//             }
//           : undefined,

//         // STOCK
//         stock:
//           quantity !== undefined
//             ? {
//                 upsert: {
//                   create: {
//                     quantity: Number(quantity),
//                   },

//                   update: {
//                     quantity: Number(quantity),
//                   },
//                 },
//               }
//             : undefined,

//         // AUDIENCES
//         product_audiences: audience_ids
//           ? {
//               deleteMany: {},

//               create: audience_ids.map((id: number) => ({
//                 audience_id: Number(id),
//               })),
//             }
//           : undefined,

//         // HOME SECTIONS
//         product_home_sections: home_section_ids
//           ? {
//               deleteMany: {},

//               create: home_section_ids.map((id: number) => ({
//                 section_id: Number(id),
//               })),
//             }
//           : undefined,

//         // ATTRIBUTES
//         product_attributes: attributes
//           ? {
//               create: attributes.map((attr: any) => ({
//                 type_id: Number(attr.type_id),

//                 translations: {
//                   create: attr.translations.map((t: any) => ({
//                     language: t.language,
//                     value: t.value,
//                   })),
//                 },
//               })),
//             }
//           : undefined,

//         // UNITS
//         product_unit_maps: units
//           ? {
//               deleteMany: {},

//               create: units.map((unit: any) => ({
//                 unit_id: Number(unit.unit_id),

//                 quantity_in_base: Number(unit.quantity_in_base),

//                 price: unit.price ? Number(unit.price) : null,
//               })),
//             }
//           : undefined,

//         // VARIANTS
//         product_variants: variants
//           ? {
//               create: variants.map((variant: any) => ({
//                 color_id: variant.color_id ? Number(variant.color_id) : null,

//                 quantity: Number(variant.quantity ?? 0),

//                 price:
//                   variant.price !== undefined && variant.price !== null
//                     ? Number(variant.price)
//                     : null,

//                 images: {
//                   create:
//                     variant.images?.map((url: string, index: number) => ({
//                       url,
//                       sort_order: index,
//                     })) ?? [],
//                 },
//               })),
//             }
//           : undefined,
//         include: {
//           translations: true,

//           images: true,

//           stock: true,

//           availability: true,

//           stock_profile: true,

//           brand: true,

//           color: {
//             include: {
//               translations: true,
//             },
//           },

//           type: {
//             include: {
//               translations: true,
//             },
//           },

//           product_audiences: {
//             include: {
//               audience: {
//                 include: {
//                   translations: true,
//                 },
//               },
//             },
//           },

//           product_home_sections: {
//             include: {
//               section: {
//                 include: {
//                   translations: true,
//                 },
//               },
//             },
//           },

//           product_attributes: {
//             include: {
//               type: {
//                 include: {
//                   translations: true,
//                 },
//               },

//               translations: true,
//             },
//           },

//           product_unit_maps: {
//             include: {
//               unit: {
//                 include: {
//                   translations: true,
//                 },
//               },
//             },
//           },

//           product_variants: {
//             include: {
//               color: {
//                 include: {
//                   translations: true,
//                 },
//               },

//               images: true,
//             },
//           },
//         },
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: product,
//     });
//   } catch (error: any) {
//     console.error("=========UPDATE PRODUCT ERROR ========");
//     console.error(error);
//     console.error("MESSAGE:", error.message);
//     console.error("CODE:", error?.code);
//     console.error("META:", error?.meta);
//     console.error("========================================");

//     if (error.code === "P2025") {
//       res.status(404).json({
//         error: "Product not found",
//       });
//       return;
//     }

//     if (error.code === "P2002") {
//       res.status(400).json({
//         error: "Duplicate product code",
//       });
//       return;
//     }

//     res.status(500).json({
//       success: false,
//       error: error?.message || "Failed to update product",
//       code: error?.code || null,
//       meta: error?.meta || null,
//     });
//   }
// };
export const updateProduct = async (req, res) => {
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

      variants,
    } = req.body;

    // -----------------------------------------
    // DELETE OLD ATTRIBUTES
    // -----------------------------------------

    await prisma.product_attribute_translation.deleteMany({
      where: {
        attribute: {
          product_id: id,
        },
      },
    });

    await prisma.product_attribute.deleteMany({
      where: {
        product_id: id,
      },
    });

    // -----------------------------------------
    // DELETE OLD VARIANT IMAGES
    // -----------------------------------------

    await prisma.product_variant_image.deleteMany({
      where: {
        variant: {
          product_id: id,
        },
      },
    });

    // -----------------------------------------
    // DELETE OLD VARIANTS
    // -----------------------------------------

    await prisma.product_variant.deleteMany({
      where: {
        product_id: id,
      },
    });

    // -----------------------------------------
    // UPDATE PRODUCT
    // -----------------------------------------

    const product = await prisma.product.update({
      where: {
        id,
      },

      data: {
        code: code ?? undefined,

        price: price !== undefined ? Number(price) : undefined,

        discount: discount !== undefined ? Number(discount) : undefined,

        // -----------------------------------------
        // TYPE
        // -----------------------------------------

        type:
          type_id !== undefined
            ? {
                connect: {
                  id: Number(type_id),
                },
              }
            : undefined,

        // -----------------------------------------
        // BRAND
        // -----------------------------------------

        brand:
          brand_id !== undefined
            ? brand_id
              ? {
                  connect: {
                    id: Number(brand_id),
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,

        // -----------------------------------------
        // COLOR
        // -----------------------------------------

        color:
          color_id !== undefined
            ? color_id
              ? {
                  connect: {
                    id: Number(color_id),
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,

        // -----------------------------------------
        // AVAILABILITY
        // -----------------------------------------

        availability:
          availability_id !== undefined
            ? availability_id
              ? {
                  connect: {
                    id: Number(availability_id),
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,

        // -----------------------------------------
        // STOCK PROFILE
        // -----------------------------------------

        stock_profile:
          stock_profile_id !== undefined
            ? stock_profile_id
              ? {
                  connect: {
                    id: Number(stock_profile_id),
                  },
                }
              : {
                  disconnect: true,
                }
            : undefined,

        // -----------------------------------------
        // ARRIVAL DATE
        // -----------------------------------------

        arrival_date: arrival_date ? new Date(arrival_date) : null,

        // -----------------------------------------
        // TRANSLATIONS
        // -----------------------------------------

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

        // -----------------------------------------
        // PRODUCT IMAGES
        // -----------------------------------------

        images: images
          ? {
              deleteMany: {},

              create: images.map((url: string) => ({
                url,
              })),
            }
          : undefined,

        // -----------------------------------------
        // PRODUCT STOCK
        // -----------------------------------------

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
        // -----------------------------------------
        // AUDIENCES
        // -----------------------------------------

        product_audiences: audience_ids
          ? {
              deleteMany: {},

              create: audience_ids.map((id: any) => ({
                audience_id: Number(id),
              })),
            }
          : undefined,

        // -----------------------------------------
        // HOME SECTIONS
        // -----------------------------------------

        product_home_sections: home_section_ids
          ? {
              deleteMany: {},

              create: home_section_ids.map((id: any) => ({
                section_id: Number(id),
              })),
            }
          : undefined,

        // -----------------------------------------
        // ATTRIBUTES
        // -----------------------------------------

        product_attributes: attributes
          ? {
              create: attributes.map((attr: any) => ({
                type_id: Number(attr.type_id),

                translations: {
                  create: (attr.translations || []).map((t: any) => ({
                    language: t.language,
                    value: t.value,
                  })),
                },
              })),
            }
          : undefined,

        // -----------------------------------------
        // UNITS
        // -----------------------------------------

        product_unit_maps: units
          ? {
              deleteMany: {},

              create: units.map((unit: any) => ({
                unit_id: Number(unit.unit_id),

                quantity_in_base: Number(unit.quantity_in_base),

                price:
                  unit.price !== undefined && unit.price !== null
                    ? Number(unit.price)
                    : null,
              })),
            }
          : undefined,

        // -----------------------------------------
        // VARIANTS
        // -----------------------------------------

        product_variants: variants
          ? {
              create: variants.map((variant: any) => ({
                color_id:
                  variant.color_id !== undefined &&
                  variant.color_id !== null &&
                  variant.color_id !== ""
                    ? Number(variant.color_id)
                    : null,

                quantity: Number(variant.quantity ?? 0),

                price:
                  variant.price !== undefined &&
                  variant.price !== null &&
                  variant.price !== ""
                    ? Number(variant.price)
                    : null,

                images: {
                  create: (variant.images || []).map(
                    (url: string, index: number) => ({
                      url,
                      sort_order: index,
                    }),
                  ),
                },
              })),
            }
          : undefined,
      },

      // -----------------------------------------
      // INCLUDE
      // -----------------------------------------

      include: {
        translations: true,

        images: true,

        stock: true,

        availability: true,

        stock_profile: true,

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
            translations: true,
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

        product_variants: {
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
    });

    // -----------------------------------------
    // SUCCESS RESPONSE
    // -----------------------------------------

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("========= UPDATE PRODUCT ERROR =========");
    console.error(error);

    const err = error as {
      code?: string;
      message?: string;
      meta?: unknown;
    };

    console.error("MESSAGE:", err.message);
    console.error("CODE:", err.code);
    console.error("META:", err.meta);
    console.error("========================================");

    // Product not found
    if (err.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Product not found",
      });
      return;
    }

    // Duplicate product code
    if (err.code === "P2002") {
      res.status(400).json({
        success: false,
        error: "Duplicate product code",
      });
      return;
    }

    // Other errors
    res.status(500).json({
      success: false,
      error: err.message || "Failed to update product",
      code: err.code || null,
      meta: err.meta || null,
    });
  }
};
export const permanentlyDeleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    await prisma.$transaction(async (tx) => {
      await tx.product_translation.deleteMany({
        where: { product_id: id },
      });

      await tx.product_image.deleteMany({
        where: { product_id: id },
      });

      await tx.product_stock_log.deleteMany({
        where: { product_id: id },
      });

      await tx.product_stock.deleteMany({
        where: { product_id: id },
      });

      await tx.product_attribute.deleteMany({
        where: { product_id: id },
      });

      await tx.product_audience.deleteMany({
        where: { product_id: id },
      });

      await tx.product_home_section.deleteMany({
        where: { product_id: id },
      });

      await tx.product_unit_map.deleteMany({
        where: { product_id: id },
      });

      await tx.user_cart_item.deleteMany({
        where: { product_id: id },
      });

      await tx.user_favorite.deleteMany({
        where: { product_id: id },
      });

      await tx.product.delete({
        where: { id },
      });
    });

    res.json({
      message: "Product permanently deleted",
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
};
