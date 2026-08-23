import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/authMiddleware.js";
import { allMessages, sendMessage, deleteMessage, uploadAttachment } from "../controllers/messageController.js";

const router = express.Router();
const upload = multer();

router.route("/:chatId").get(protectRoute, allMessages);
router.route("/").post(protectRoute, sendMessage);
router.route("/:messageId").delete(protectRoute, deleteMessage);
router.route("/upload/file").post(protectRoute, upload.single("file"), uploadAttachment);

export default router;
