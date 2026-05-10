import { successResponse } from "../../utils/response.util.js";
import * as adminService from "./admin.service.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAllUsers(req.query);
    successResponse(res, result, "Users retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole(req.params.id, req.body.roles);
    successResponse(res, user, "User role updated");
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(
      req.params.id,
      req.body.isActive,
    );
    successResponse(res, user, `User ${req.body.isActive ? "activated" : "deactivated"}`);
  } catch (error) {
    next(error);
  }
};

export const getSystemHealth = async (req, res, next) => {
  try {
    const health = await adminService.getSystemHealth();
    successResponse(res, health, "System health retrieved");
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const result = await adminService.getAuditLogs(req.query);
    successResponse(res, result, "Audit logs retrieved");
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateCefrLevels = async (req, res, next) => {
  try {
    const { studentIds, newLevel } = req.body;
    const result = await adminService.bulkUpdateCefrLevels(studentIds, newLevel);
    successResponse(res, result, "CEFR levels updated");
  } catch (error) {
    next(error);
  }
};
