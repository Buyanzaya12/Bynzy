// routes/userfavorite.ts

import express from "express";

import {
  addToFavorites,
  getFavorites,
  getUserFavorites,
  removeFavorite,
} from "../controller/user/fav";

const router = express.Router();

router.post("/", addToFavorites);

router.get("/", getFavorites);

router.get("/user/:userId", getUserFavorites);

router.delete("/:id", removeFavorite);

export default router;