import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { allMessages, sendMessage, deleteMessage } from "../controllers/messageController.js";

const router = express.Router();

router.route("/:chatId").get(protectRoute, allMessages);
router.route("/").post(protectRoute, sendMessage);
router.route("/:messageId").delete(protectRoute, deleteMessage);

export default router;
