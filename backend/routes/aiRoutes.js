import express from "express";
import { handleAiChat } from "../controllers/aiController.js";
// Optional: Add authentication middleware if needed later
// import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/ai/chat
// Add 'protect' middleware if only logged-in users should access the AI
router.post("/chat", handleAiChat);

export default router;
                                                                            