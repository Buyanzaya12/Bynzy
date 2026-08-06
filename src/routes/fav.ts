import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";

import {
  addToFavorites,
  getFavorites,
  getUserFavorites,
  removeFavorite,
} from "../controller/user/fav";

const router = express.Router();

router.post("/", authMiddleware, addToFavorites);

router.get("/", authMiddleware, getFavorites);

router.get("/user/:userId", authMiddleware, getUserFavorites);

router.delete("/:id", authMiddleware, removeFavorite);

export default router;
