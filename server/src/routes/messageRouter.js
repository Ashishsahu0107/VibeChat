import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { sendMessage, getMessages, deleteMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/delete/messages", protectRoute, deleteMessages);

export default router;
