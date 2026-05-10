import express from "express";
import * as srsController from "./srs.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";

const router = express.Router();

router.use(protect);

// Create a card
router.post(
  "/cards",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.createCard,
);

// Get due cards
router.get(
  "/cards/due",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.getDueCards,
);

// Get SRS stats
router.get(
  "/cards/stats",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.getCardStats,
);

// Review a card
router.post(
  "/cards/:id/review",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.reviewCard,
);

// Delete a card
router.delete(
  "/cards/:id",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.deleteCard,
);

// Auto-generate cards from a lesson
router.post(
  "/cards/generate/:lessonId",
  authorize(PERMISSIONS.MANAGE_SRS_CARDS),
  srsController.autoGenerateCards,
);

export default router;
