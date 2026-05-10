/**
 * Simple in-memory rate limiter middleware.
 * For production, replace with Redis-backed solution.
 */

const requestCounts = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // Clean up every minute

// Periodically clean expired entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.startTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Create rate limiter with configurable options
 * @param {Object} options
 * @param {number} options.windowMs - Time window in ms (default: 60000 = 1 min)
 * @param {number} options.maxRequests - Max requests per window (default: 100)
 * @param {string} options.message - Error message when limited
 */
export const rateLimit = ({
  windowMs = 60 * 1000,
  maxRequests = 100,
  message = "Too many requests, please try again later.",
} = {}) => {
  return (req, res, next) => {
    const key = `${req.ip}-${req.originalUrl}`;
    const now = Date.now();

    const record = requestCounts.get(key);

    if (!record || now - record.startTime > windowMs) {
      requestCounts.set(key, { count: 1, startTime: now, windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message,
        errorCode: "RATE_LIMIT_EXCEEDED",
      });
    }

    record.count += 1;
    next();
  };
};

// Pre-configured limiters
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes.",
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: "AI request limit reached. Please wait a moment.",
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: "API rate limit exceeded. Please slow down.",
});
