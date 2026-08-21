import express from "express";
import { submitContactForm } from "../controllers/publicController.js";

const router = express.Router();

// Public route to submit a contact form
router.post("/contact", submitContactForm);

export default router;
