import express from "express";
import * as adminController from "./admin.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { authorize } from "../../middleware/permission.middleware.js";
import { PERMISSIONS } from "../../config/permissions.matrix.js";

const router = express.Router();

router.use(protect);

// User management
router.get(
  "/users",
  authorize(PERMISSIONS.MANAGE_USERS),
  adminController.getAllUsers,
);

router.patch(
  "/users/:id/role",
  authorize(PERMISSIONS.MANAGE_USERS),
  adminController.updateUserRole,
);

router.patch(
  "/users/:id/status",
  authorize(PERMISSIONS.MANAGE_USERS),
  adminController.toggleUserStatus,
);

// System health
router.get(
  "/health",
  authorize(PERMISSIONS.VIEW_SYSTEM_HEALTH),
  adminController.getSystemHealth,
);

// Audit logs
router.get(
  "/audit-logs",
  authorize(PERMISSIONS.MANAGE_AUDIT_LOGS),
  adminController.getAuditLogs,
);

// Bulk operations
router.post(
  "/bulk-update-levels",
  authorize(PERMISSIONS.BULK_OPERATIONS),
  adminController.bulkUpdateCefrLevels,
);

export default router;
