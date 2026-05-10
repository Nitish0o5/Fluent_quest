import AppError from "../../utils/appError.util.js";
import User from "./models/user.model.js";
import StudentProfile from "../student/models/studentProfile.model.js";
import { hashPassword, comparePassword } from "../../utils/password.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000;

export const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 409, "USER_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const roles = role && ["INSTRUCTOR"].includes(role) ? [role] : ["STUDENT"];

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    roles,
  });

  // Auto-create student profile for students
  if (roles.includes("STUDENT")) {
    await StudentProfile.create({ userId: user._id });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      roles: user.roles,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  if (!user.isActive) {
    throw new AppError("Account disabled", 403, "ACCOUNT_DISABLED");
  }

  if (user.isLocked()) {
    throw new AppError("Account locked. Try later.", 423, "ACCOUNT_LOCKED");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }

    await user.save();
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
  if (!token) throw new AppError("No refresh token", 401, "NO_TOKEN");

  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new AppError("Invalid refresh token", 401, "INVALID_TOKEN");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
