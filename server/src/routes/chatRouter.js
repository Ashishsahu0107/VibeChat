import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  updateGroupAvatar,
  addToGroup,
  removeFromGroup,
  makeAdmin,
  updateChatState,
  deleteChat,
} from "../controllers/chatController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/", protectRoute, fetchChats);
router.post("/", protectRoute, accessChat);
router.post("/group", protectRoute, createGroupChat);
router.put("/rename", protectRoute, renameGroup);
router.put("/groupadd", protectRoute, addToGroup);
router.put("/groupremove", protectRoute, removeFromGroup);
router.put("/makeadmin", protectRoute, makeAdmin);
router.put("/:chatId/state", protectRoute, updateChatState);
router.put("/:chatId/avatar", protectRoute, upload.single("image"), updateGroupAvatar);
router.delete("/:chatId", protectRoute, deleteChat);

export default router;
