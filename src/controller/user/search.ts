import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { slugify } from "../../lib/slugify";

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const keyword = String(req.query.q || "").trim();
    const slugifiedKeyword = slugify(keyword);
    const lang = String(req.query.lang || "EN").toUpperCase();

    if (!keyword) {
      return res.json({
        data: [],
      });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          //---------------------------------
          // Product name
          //---------------------------------
          {
            translations: {
              some: {
                language: lang as any,
                name: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
          },

          //---------------------------------
          // Description
          //---------------------------------
          {
            translations: {
              some: {
                language: lang as any,
                description: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
          },

          //---------------------------------
          // Product code
          //---------------------------------
          {
            code: {
              contains: keyword,
              mode: "insensitive",
            },
          },

          //---------------------------------
          // Brand
          //---------------------------------
          {
            brand: {
              is: {
                name: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
          },

          //---------------------------------
          // Type
          //---------------------------------
          {
            type: {
              translations: {
                some: {
                  language: lang as any,
                  name: {
                    contains: keyword,
                    mode: "insensitive",
                  },
                },
              },
            },
          },

          //---------------------------------
          // Category
          //---------------------------------
          {
            type: {
              category: {
                translations: {
                  some: {
                    language: lang as any,
                    name: {
                      contains: keyword,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },

          //---------------------------------
          // Color
          //---------------------------------
          {
            color: {
              is: {
                translations: {
                  some: {
                    language: lang as any,
                    name: {
                      contains: keyword,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          },

          //---------------------------------
          // Audience
          //---------------------------------
          {
            product_audiences: {
              some: {
                audience: {
                  translations: {
                    some: {
                      language: lang as any,
                      name: {
                        contains: keyword,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              },
            },
          },

          //---------------------------------
          // Attributes
          //---------------------------------
          {
            product_attributes: {
              some: {
                value: {
                  contains: keyword,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      },

      include: {
        translations: {
          where: {
            language: lang as any,
          },
        },

        images: true,

        brand: true,

        color: {
          include: {
            translations: {
              where: {
                language: lang as any,
              },
            },
          },
        },

        type: {
          include: {
            translations: {
              where: {
                language: lang as any,
              },
            },

            category: {
              include: {
                translations: {
                  where: {
                    language: lang as any,
                  },
                },
              },
            },
          },
        },

        stock: true,
      },

      take: 20,
    });

    const data = products.map((product) => {
      const productName = product.translations[0]?.name || product.code;

      const categoryName =
        product.type.category.translations[0]?.name || "category";

      const typeName = product.type.translations[0]?.name || "type";

      return {
        ...product,

        url: `/${lang.toLowerCase()}/${slugify(
          categoryName,
        )}/${slugify(typeName)}/${slugify(productName)}-${product.code}`,
      };
    });

    return res.json({
      data,
    });
  } catch (err: any) {
    console.error(err);

    return res.status(500).json({
      error: err.message,
    });
  }
};
