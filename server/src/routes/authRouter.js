import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  sendRegisterOtp,
  verifyRegisterOtp,
  resendRegisterOtp,
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

// Registration Flow with Email OTP
router.post("/register", authActionLimiter, register);
router.post("/send-register-otp", authActionLimiter, sendRegisterOtp);
router.post("/verify-register-otp", authActionLimiter, verifyRegisterOtp);
router.post("/resend-register-otp", authActionLimiter, resendRegisterOtp);

// Standard Authentication
router.post("/login", authActionLimiter, login);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);
router.post("/logout", logout);

// Password Reset Flow
router.post("/forgot-password", authActionLimiter, forgotPassword);
router.post("/reset-password", authActionLimiter, resetPassword);

// Session Verification
router.get("/check", protectRoute, checkAuth);

export default router;
