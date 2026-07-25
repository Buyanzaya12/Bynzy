import { Router } from "express";
import { addToCart } from "../controller/user/cart";
import { getCart } from "../controller/user/cart";
import { updateCartItem } from "../controller/user/cart";
import { removeFromCart } from "../controller/user/cart";
import { clearCart } from "../controller/user/cart";
import { authMiddleware } from "../middleware/auth.middleware";
const router = Router();

router.post("/", authMiddleware, addToCart);

router.get("/", authMiddleware, getCart);

router.put("/item/:id", authMiddleware, updateCartItem);

router.delete("/item/:id", authMiddleware, removeFromCart);

router.delete("/clear", authMiddleware, clearCart);
export default router;
