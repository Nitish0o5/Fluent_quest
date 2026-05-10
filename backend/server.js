import "./src/config/dns-fix.js"; // Must be first — patches DNS for restricted networks
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes.js";
import connectDB from "./src/config/db.js";
import { ENV } from "./src/config/env.js";
import errorMiddleware from "./src/middleware/error.middleware.js";
import { apiLimiter } from "./src/middleware/rateLimit.middleware.js";

const app = express();

// CORS
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter
app.use("/api", apiLimiter);

// Routes
app.use("/api", routes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FluentQuest API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorMiddleware);

const startServer = async () => {
  await connectDB();

  app.listen(ENV.PORT, () => {
    console.log(`🚀 FluentQuest server running on port ${ENV.PORT}`);
    console.log(`📚 Environment: ${ENV.NODE_ENV}`);
    console.log(`🔗 API: http://localhost:${ENV.PORT}/api`);
  });
};

startServer();
