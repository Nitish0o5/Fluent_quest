import express from "express";
import * as studentController from "./student.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";

const router = express.Router();

// All student routes require authentication
router.use(protect);

// Onboarding
router.post(
  "/onboard",
  authorize(PERMISSIONS.VIEW_STUDENT_DASHBOARD),
  studentController.onboard,
);

// Profile
router.get(
  "/profile",
  authorize(PERMISSIONS.VIEW_STUDENT_DASHBOARD),
  studentController.getProfile,
);

router.patch(
  "/profile",
  authorize(PERMISSIONS.VIEW_STUDENT_DASHBOARD),
  studentController.updateProfile,
);

// Leaderboard
router.get(
  "/leaderboard",
  authorize(PERMISSIONS.VIEW_LEADERBOARD),
  studentController.getLeaderboard,
);

// Streak freeze
router.post(
  "/streak-freeze",
  authorize(PERMISSIONS.VIEW_STUDENT_DASHBOARD),
  studentController.useStreakFreeze,
);

export default router;
