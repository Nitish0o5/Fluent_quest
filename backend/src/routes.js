import express from "express";

import authRoutes from "./modules/identity/auth.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import lessonRoutes from "./modules/lessons/lesson.routes.js";
import srsRoutes from "./modules/srs/srs.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import instructorRoutes from "./modules/instructor/instructor.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/student", studentRoutes);
router.use("/lessons", lessonRoutes);
router.use("/srs", srsRoutes);
router.use("/ai", aiRoutes);
router.use("/instructor", instructorRoutes);
router.use("/admin", adminRoutes);

export default router;
