import AuditLog from "../modules/admin/models/auditLog.model.js";

/**
 * Audit logging middleware
 * Logs significant actions to the AuditLog collection
 *
 * Usage: auditAction("LESSON_CREATED") as middleware after the controller
 * Or call logAudit() directly from services
 */

export const auditAction = (action) => {
  return async (req, res, next) => {
    // Only log after successful response
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Log only successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        AuditLog.create({
          action,
          actor: req.user._id,
          target: {
            type: req.method,
            id: req.params.id || null,
          },
          details: {
            path: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
          },
          ipAddress: req.ip,
        }).catch((err) => console.error("Audit log error:", err));
      }

      return originalJson(body);
    };

    next();
  };
};

/**
 * Direct audit logging function for use in services
 */
export const logAudit = async ({ action, actorId, target, details, ipAddress }) => {
  try {
    await AuditLog.create({
      action,
      actor: actorId,
      target,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};
