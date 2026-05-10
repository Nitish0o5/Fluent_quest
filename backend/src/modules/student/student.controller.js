import { successResponse } from "../../utils/response.util.js";
import * as studentService from "./student.service.js";

export const onboard = async (req, res, next) => {
  try {
    const profile = await studentService.onboard(req.user._id, req.body);
    successResponse(res, profile, "Onboarding complete", 201);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await studentService.getProfile(req.user._id);
    successResponse(res, profile, "Profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const profile = await studentService.updateProfile(req.user._id, req.body);
    successResponse(res, profile, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await studentService.getLeaderboard(limit);
    successResponse(res, leaderboard, "Leaderboard retrieved");
  } catch (error) {
    next(error);
  }
};

export const useStreakFreeze = async (req, res, next) => {
  try {
    const result = await studentService.useStreakFreeze(req.user._id);
    successResponse(res, result, "Streak freeze used");
  } catch (error) {
    next(error);
  }
};
