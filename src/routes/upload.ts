// import express from "express";
// import multer from "multer";
// import cloudinary from "../lib/cloudinary";

// const router = express.Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
// });

// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     console.log("========== UPLOAD ==========");
//     console.log("FILE:", req.file);

//     if (!req.file) {
//       return res.status(400).json({
//         error: "No file received",
//       });
//     }

//     const result = await new Promise<any>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(
//         {
//           folder: "bynzy",
//         },
//         (error, result) => {
//           if (error) {
//             console.error("CLOUDINARY ERROR:", error);
//             reject(error);
//           } else {
//             resolve(result);
//           }
//         },
//       );

//       stream.end(req.file!.buffer);
//     });

//     console.log("CLOUDINARY RESULT:", result.secure_url);

//     return res.status(200).json({
//       url: result.secure_url,
//     });
//   } catch (err: any) {
//     console.error("========== UPLOAD ERROR ==========");
//     console.error(err);

//     return res.status(500).json({
//       error: err?.message || "Image upload failed",
//     });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import cloudinary from "../lib/cloudinary";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("========== UPLOAD ==========");

    if (!req.file) {
      return res.status(400).json({
        error: "No file received",
      });
    }

    console.log("Filename:", req.file.originalname);
    console.log("Mimetype:", req.file.mimetype);
    console.log("Size:", req.file.size);

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "Only image files are allowed.",
      });
    }

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "bynzy",
          resource_type: "image",
          timeout: 120000,
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY ERROR:", error);
            reject(error);
            return;
          }

          if (!result?.secure_url) {
            reject(new Error("Cloudinary did not return an image URL."));
            return;
          }

          resolve(result);
        },
      );

      stream.on("error", (error) => {
        console.error("CLOUDINARY STREAM ERROR:", error);
        reject(error);
      });

      stream.end(req.file!.buffer);
    });

    console.log("UPLOAD SUCCESS:", result.public_id);

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
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
