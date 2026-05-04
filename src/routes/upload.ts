import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file" });

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "bynzy" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
