import express from "express";
import { register, login, logout, GoogleUserLogin } from "../controllers/authController.js";
import { GoogleProtect } from "../middleware/googleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/googleLogin", GoogleProtect, GoogleUserLogin);
router.post("/logout", logout);

export default router;
