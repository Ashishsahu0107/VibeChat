import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  createStatus,
  getStatuses,
  viewStatus,
  deleteStatus,
} from "../controllers/statusController.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createStatus);
router.get("/", getStatuses);
router.post("/:statusId/view", viewStatus);
router.delete("/:statusId", deleteStatus);

export default router;  
