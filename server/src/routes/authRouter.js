import express from "express";
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

router.post("/register", register);
router.post("/login", login);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check", protectRoute, checkAuth);

export default router;

