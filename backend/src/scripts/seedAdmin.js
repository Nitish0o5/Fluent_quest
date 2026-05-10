import mongoose from "mongoose";
import { ENV } from "../config/env.js";
import connectDB from "../config/db.js";
import User from "../modules/identity/models/user.model.js";
import StudentProfile from "../modules/student/models/studentProfile.model.js";
import { hashPassword } from "../utils/password.util.js";

const seedAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({ roles: "ADMIN" });

  if (existingAdmin) {
    console.log("✅ Admin already exists:", existingAdmin.email);
    process.exit();
  }

  const hashedPassword = await hashPassword("Admin@123");

  const admin = await User.create({
    name: "FluentQuest Admin",
    email: "admin@fluentquest.com",
    password: hashedPassword,
    roles: ["ADMIN"],
    isEmailVerified: true,
  });

  console.log("✅ Admin created successfully");
  console.log("   Email: admin@fluentquest.com");
  console.log("   Password: Admin@123");
  process.exit();
};

seedAdmin();
