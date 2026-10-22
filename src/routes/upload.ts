// import express from "express";
// import multer from "multer";
// import cloudinary from "../lib/cloudinary";

// const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     const file = req.file;

//     if (!file) return res.status(400).json({ error: "No file" });

//     const result = await new Promise<any>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         { folder: "bynzy" },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         },
//       );

//       stream.end(file.buffer);
//     });

//     res.json({ url: result.secure_url });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// export default router;
import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("========== UPLOAD ==========");
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({
        error: "No file received",
      });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "bynzy",
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY ERROR:", error);
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      stream.end(req.file!.buffer);
    });

    console.log("CLOUDINARY RESULT:", result.secure_url);

    return res.status(200).json({
      url: result.secure_url,
    });
  } catch (err: any) {
    console.error("========== UPLOAD ERROR ==========");
    console.error(err);

    return res.status(500).json({
      error: err?.message || "Image upload failed",
    });
  }
});

export default router;
