import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  checkAuth,
  GoogleUserLogin,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { GoogleProtect } from "../middleware/googleMiddleware.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

const authActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later." },
});

router.post("/register", authActionLimiter, register);
router.post("/login", authActionLimiter, login);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);
router.post("/logout", logout);
router.post("/forgot-password", authActionLimiter, forgotPassword);
router.post("/reset-password", authActionLimiter, resetPassword);
router.get("/check", protectRoute, checkAuth);

export default router;
