import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import multer from "multer";
import {
  getUsersForSidebar,
  updateProfile,
  changePassword,
  uploadProfileImage,
  blockUser,
  unblockUser,
  globalSearch,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/", protectRoute, getUsersForSidebar);
router.get("/search", protectRoute, globalSearch);
router.get("/:userId", protectRoute, getUserById);
router.put("/profile", protectRoute, updateProfile);
router.post("/profile/image", protectRoute, upload.single("image"), uploadProfileImage);
router.put("/change-password", protectRoute, changePassword);
router.post("/block/:userId", protectRoute, blockUser);
router.post("/unblock/:userId", protectRoute, unblockUser);

export default router;
