import express from "express";
import * as instructorController from "./instructor.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";

const router = express.Router();

router.use(protect);

// Course CRUD
router.post(
  "/courses",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.createCourse,
);

router.get(
  "/courses",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.getCourses,
);

router.get(
  "/courses/:id",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.getCourseById,
);

router.patch(
  "/courses/:id",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.updateCourse,
);

// Course lesson management
router.post(
  "/courses/:id/lessons",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.addLessonToCourse,
);

router.delete(
  "/courses/:id/lessons",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.removeLessonFromCourse,
);

// Student enrollment
router.post(
  "/courses/:id/enroll",
  authorize(PERMISSIONS.MANAGE_OWN_COURSES),
  instructorController.enrollStudent,
);

// Analytics
router.get(
  "/analytics",
  authorize(PERMISSIONS.VIEW_STUDENT_ANALYTICS),
  instructorController.getAnalytics,
);

router.get(
  "/at-risk",
  authorize(PERMISSIONS.VIEW_STUDENT_ANALYTICS),
  instructorController.getAtRiskStudents,
);

export default router;
