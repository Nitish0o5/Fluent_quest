import express from "express";
import * as lessonController from "./lesson.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";

const router = express.Router();

// All lesson routes require auth
router.use(protect);

// ========== Student Routes ==========

// Browse published lessons
router.get(
  "/",
  authorize(PERMISSIONS.VIEW_LESSONS),
  lessonController.getLessons,
);

// Get level-wide progress
router.get(
  "/progress/level",
  authorize(PERMISSIONS.VIEW_PROGRESS),
  lessonController.getLevelProgress,
);

// Get instructor's own lessons
router.get(
  "/my-lessons",
  authorize(PERMISSIONS.CREATE_LESSON),
  lessonController.getInstructorLessons,
);

// Get single lesson
router.get(
  "/:id",
  authorize(PERMISSIONS.VIEW_LESSONS),
  lessonController.getLessonById,
);

// Get progress for a lesson
router.get(
  "/:id/progress",
  authorize(PERMISSIONS.VIEW_PROGRESS),
  lessonController.getProgress,
);

// Start a lesson
router.post(
  "/:id/start",
  authorize(PERMISSIONS.SUBMIT_EXERCISE),
  lessonController.startLesson,
);

// Submit an exercise answer
router.post(
  "/:id/submit",
  authorize(PERMISSIONS.SUBMIT_EXERCISE),
  lessonController.submitExercise,
);

// Complete a lesson
router.post(
  "/:id/complete",
  authorize(PERMISSIONS.SUBMIT_EXERCISE),
  lessonController.completeLesson,
);

// ========== Instructor Routes ==========

// Create lesson
router.post(
  "/",
  authorize(PERMISSIONS.CREATE_LESSON),
  lessonController.createLesson,
);

// Update lesson
router.patch(
  "/:id",
  authorize(PERMISSIONS.EDIT_LESSON),
  lessonController.updateLesson,
);

// Delete lesson
router.delete(
  "/:id",
  authorize(PERMISSIONS.DELETE_LESSON),
  lessonController.deleteLesson,
);

// Publish lesson
router.patch(
  "/:id/publish",
  authorize(PERMISSIONS.PUBLISH_LESSON),
  lessonController.publishLesson,
);

export default router;
