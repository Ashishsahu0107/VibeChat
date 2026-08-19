import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { getUsersForSidebar, updateProfile, uploadProfileImage } from "../controllers/userController.js";
import multer from "multer";

const router = express.Router();
const upload = multer(); // Memory storage

router.get("/", protectRoute, getUsersForSidebar);
router.put("/profile", protectRoute, updateProfile);
router.post("/profile/image", protectRoute, upload.single("image"), uploadProfileImage);

export default router;
