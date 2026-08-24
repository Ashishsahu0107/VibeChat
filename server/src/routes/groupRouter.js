import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { createGroup, getGroups, getGroupMessages, sendGroupMessage } from "../controllers/groupController.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.get("/:id/messages", protectRoute, getGroupMessages);
router.post("/:id/messages", protectRoute, sendGroupMessage);

export default router;
