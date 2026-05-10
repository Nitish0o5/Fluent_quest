import { successResponse } from "../../utils/response.util.js";
import { ENV } from "../../config/env.js";
import * as authService from "./auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(
      req.body,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(
      res,
      { user, accessToken },
      "User registered successfully",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = await authService.login(
      req.body.email,
      req.body.password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(res, { accessToken }, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshAccessToken(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    successResponse(
      res,
      { accessToken },
      "Access token refreshed successfully",
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  const user = req.user;

  // Check onboarding status from student profile if user is a student
  let isOnboardingComplete = true;
  if (user.roles.includes("STUDENT")) {
    const StudentProfile = (await import("../student/models/studentProfile.model.js")).default;
    const profile = await StudentProfile.findOne({ userId: user._id });
    isOnboardingComplete = profile?.onboarded ?? false;
  }

  successResponse(
    res,
    {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roles: user.roles,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isOnboardingComplete,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    "User profile retrieved successfully",
  );
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await authService.logout(req.user.id);
    }

    res.clearCookie("refreshToken");
    successResponse(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};
