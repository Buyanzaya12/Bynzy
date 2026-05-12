import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const generateCode = (name: string) => {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w]/g, "");
};

export const addBrand = async (req: Request, res: Response) => {
  try {
    const { name, image_url, code } = req.body;

    if (!name || !image_url || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        image_url,
        code,
      },
    });

    return res.status(201).json({
      data: {
        id: brand.id,
        name: brand.name,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to create brand" });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      data: brands,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve brands" });
  }
};

export const deleteBrand = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    await prisma.brand.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Brand deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    res.status(500).json({ error: "Failed to delete brand" });
  }
};

export const updateBrand = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { name, image_url, code } = req.body;

    if (!id) {
      res.status(400).json({ error: "Valid ID required" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Brand name is required" });
      return;
    }

    

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name,
        image_url,
        code,
      },
    });

    res.status(200).json({
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "P2025") {
      res.status(404).json({ error: "Brand not found" });
      return;
    }

    if (error.code === "P2002") {
      res.status(400).json({ error: "Brand with this name already exists" });
      return;
    }

    res.status(500).json({ error: "Failed to update brand" });
  }
};
