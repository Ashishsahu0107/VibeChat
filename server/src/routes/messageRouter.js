import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  allMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  starMessage,
  markAsRead,
  uploadAttachment,
  searchMessages,
} from "../controllers/messageController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB

router.get("/:chatId", protectRoute, allMessages);
router.get("/:chatId/search", protectRoute, searchMessages);
router.post("/", protectRoute, sendMessage);
router.put("/:messageId/edit", protectRoute, editMessage);
router.delete("/:messageId", protectRoute, deleteMessage);
router.post("/:messageId/react", protectRoute, reactToMessage);
router.post("/:messageId/star", protectRoute, starMessage);
router.post("/:chatId/read", protectRoute, markAsRead);
router.post("/upload/file", protectRoute, upload.single("file"), uploadAttachment);

export default router;
