import express from "express";
import { register, login, logout, checkAuth, GoogleUserLogin } from "../controllers/authController.js";
import { GoogleProtect } from "../middleware/googleMiddleware.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);

export default router;

