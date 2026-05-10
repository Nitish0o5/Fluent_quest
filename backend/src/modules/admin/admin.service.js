import User from "../identity/models/user.model.js";
import StudentProfile from "../student/models/studentProfile.model.js";
import Lesson from "../lessons/models/lesson.model.js";
import AuditLog from "./models/auditLog.model.js";
import SRSCard from "../srs/models/srsCard.model.js";
import Conversation from "../ai/models/conversation.model.js";
import AppError from "../../utils/appError.util.js";

/**
 * Get all users with filters and pagination
 */
export const getAllUsers = async (filters = {}) => {
  const query = {};

  if (filters.role) query.roles = filters.role;
  if (filters.isActive !== undefined) query.isActive = filters.isActive === "true";
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-refreshToken"),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update a user's role
 */
export const updateUserRole = async (userId, roles) => {
  const validRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];
  const invalidRoles = roles.filter((r) => !validRoles.includes(r));

  if (invalidRoles.length > 0) {
    throw new AppError(
      `Invalid roles: ${invalidRoles.join(", ")}`,
      400,
      "INVALID_ROLES",
    );
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { roles },
    { new: true, runValidators: true },
  ).select("-refreshToken");

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  // If adding STUDENT role, ensure profile exists
  if (roles.includes("STUDENT")) {
    const profileExists = await StudentProfile.findOne({ userId });
    if (!profileExists) {
      await StudentProfile.create({ userId });
    }
  }

  return user;
};

/**
 * Toggle user active status
 */
export const toggleUserStatus = async (userId, isActive) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  ).select("-refreshToken");

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return user;
};

/**
 * Get system health metrics
 */
export const getSystemHealth = async () => {
  const [
    totalUsers,
    activeUsers,
    totalLessons,
    publishedLessons,
    totalCards,
    totalConversations,
    recentLogins,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Lesson.countDocuments(),
    Lesson.countDocuments({ isPublished: true }),
    SRSCard.countDocuments(),
    Conversation.countDocuments(),
    User.countDocuments({
      lastLoginAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  // Role breakdown
  const roleBreakdown = await User.aggregate([
    { $unwind: "$roles" },
    { $group: { _id: "$roles", count: { $sum: 1 } } },
  ]);

  // CEFR level distribution
  const cefrDistribution = await StudentProfile.aggregate([
    { $group: { _id: "$cefrLevel", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      recentLogins24h: recentLogins,
      byRole: Object.fromEntries(roleBreakdown.map((r) => [r._id, r.count])),
    },
    content: {
      totalLessons,
      publishedLessons,
      totalSRSCards: totalCards,
      totalAIConversations: totalConversations,
    },
    cefrDistribution: Object.fromEntries(
      cefrDistribution.map((c) => [c._id, c.count]),
    ),
    serverTime: new Date(),
    uptime: process.uptime(),
  };
};

/**
 * Get audit logs with filters
 */
export const getAuditLogs = async (filters = {}) => {
  const query = {};

  if (filters.action) query.action = filters.action;
  if (filters.actor) query.actor = filters.actor;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "name email"),
    AuditLog.countDocuments(query),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Bulk update CEFR levels for students (academic year transition)
 */
export const bulkUpdateCefrLevels = async (studentIds, newLevel) => {
  const result = await StudentProfile.updateMany(
    { userId: { $in: studentIds } },
    { $set: { cefrLevel: newLevel } },
  );

  return {
    matched: result.matchedCount,
    modified: result.modifiedCount,
    newLevel,
  };
};
