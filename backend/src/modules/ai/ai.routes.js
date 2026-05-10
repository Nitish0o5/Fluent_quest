import express from "express";
import * as aiController from "./ai.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";
import { aiLimiter } from "../../middleware/rateLimit.middleware.js";

const router = express.Router();

router.use(protect);

// AI Chat — student & instructor
router.post(
  "/chat",
  aiLimiter,
  authorize(PERMISSIONS.USE_AI_CHAT),
  aiController.chat,
);

// Grammar check — student & instructor
router.post(
  "/grammar-check",
  aiLimiter,
  authorize(PERMISSIONS.USE_AI_CHAT),
  aiController.grammarCheck,
);

// Generate content — instructor only
router.post(
  "/generate-content",
  aiLimiter,
  authorize(PERMISSIONS.GENERATE_AI_MATERIAL),
  aiController.generateContent,
);

// Get conversations
router.get(
  "/conversations",
  authorize(PERMISSIONS.USE_AI_CHAT),
  aiController.getConversations,
);

// Get single conversation
router.get(
  "/conversations/:id",
  authorize(PERMISSIONS.USE_AI_CHAT),
  aiController.getConversationById,
);

export default router;
