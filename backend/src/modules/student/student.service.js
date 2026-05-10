import StudentProfile from "./models/studentProfile.model.js";
import AppError from "../../utils/appError.util.js";
import { STREAK_CONFIG } from "../../config/constants.js";
import { checkBadgeEligibility } from "../../utils/xp.util.js";

/**
 * Onboard a student — set language preferences and goals
 */
export const onboard = async (userId, data) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new AppError("Student profile not found", 404, "PROFILE_NOT_FOUND");
  }

  if (profile.onboarded) {
    throw new AppError("Already onboarded", 400, "ALREADY_ONBOARDED");
  }

  profile.targetLanguage = data.targetLanguage || profile.targetLanguage;
  profile.nativeLanguage = data.nativeLanguage || profile.nativeLanguage;
  profile.cefrLevel = data.cefrLevel || profile.cefrLevel;
  profile.cefrGoal = data.cefrGoal || profile.cefrGoal;
  profile.dailyGoalMinutes = data.dailyGoalMinutes || profile.dailyGoalMinutes;
  profile.onboarded = true;

  await profile.save();
  return profile;
};

/**
 * Get student profile
 */
export const getProfile = async (userId) => {
  const profile = await StudentProfile.findOne({ userId })
    .populate("completedLessons", "title cefrLevel type")
    .populate("enrolledCourses", "title language cefrLevel");

  if (!profile) {
    throw new AppError("Student profile not found", 404, "PROFILE_NOT_FOUND");
  }

  return profile;
};

/**
 * Update student profile settings
 */
export const updateProfile = async (userId, data) => {
  const allowedFields = [
    "targetLanguage",
    "nativeLanguage",
    "cefrGoal",
    "dailyGoalMinutes",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  const profile = await StudentProfile.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!profile) {
    throw new AppError("Student profile not found", 404, "PROFILE_NOT_FOUND");
  }

  return profile;
};

/**
 * Add XP to student profile and update streak
 */
export const addXp = async (userId, amount) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new AppError("Student profile not found", 404, "PROFILE_NOT_FOUND");
  }

  profile.xp += amount;
  profile.weeklyXp += amount;

  // Update streak
  await updateStreak(profile);

  // Check for new badges
  const newBadges = checkBadgeEligibility(profile);
  if (newBadges.length > 0) {
    profile.badges.push(...newBadges);
  }

  await profile.save();

  return { xp: profile.xp, weeklyXp: profile.weeklyXp, newBadges, streak: profile.streak };
};

/**
 * Update streak based on last active date
 */
const updateStreak = async (profile) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!profile.streak.lastActiveDate) {
    // First activity ever
    profile.streak.current = 1;
    profile.streak.longest = 1;
    profile.streak.lastActiveDate = today;
    return;
  }

  const lastActive = new Date(profile.streak.lastActiveDate);
  const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());

  const diffDays = Math.floor((today - lastActiveDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day — no streak change
    return;
  } else if (diffDays === 1) {
    // Consecutive day — increment streak
    profile.streak.current += 1;
    profile.streak.lastActiveDate = today;
  } else if (diffDays === 2 && profile.streak.freezesLeft > 0) {
    // Missed one day — use streak freeze
    profile.streak.freezesLeft -= 1;
    profile.streak.current += 1;
    profile.streak.lastActiveDate = today;
  } else {
    // Streak broken
    profile.streak.current = 1;
    profile.streak.lastActiveDate = today;
  }

  // Update longest streak
  if (profile.streak.current > profile.streak.longest) {
    profile.streak.longest = profile.streak.current;
  }
};

/**
 * Use a streak freeze manually
 */
export const useStreakFreeze = async (userId) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new AppError("Student profile not found", 404, "PROFILE_NOT_FOUND");
  }

  if (profile.streak.freezesLeft <= 0) {
    throw new AppError("No streak freezes left", 400, "NO_FREEZES");
  }

  if (profile.xp < STREAK_CONFIG.FREEZE_COST_XP) {
    throw new AppError(
      `Need ${STREAK_CONFIG.FREEZE_COST_XP} XP to use a streak freeze`,
      400,
      "INSUFFICIENT_XP",
    );
  }

  profile.streak.freezesLeft -= 1;
  profile.xp -= STREAK_CONFIG.FREEZE_COST_XP;
  await profile.save();

  return { freezesLeft: profile.streak.freezesLeft, xp: profile.xp };
};

/**
 * Get weekly leaderboard
 */
export const getLeaderboard = async (limit = 20) => {
  const leaderboard = await StudentProfile.find({ weeklyXp: { $gt: 0 } })
    .sort({ weeklyXp: -1 })
    .limit(limit)
    .populate("userId", "name email")
    .select("userId weeklyXp xp cefrLevel streak.current badges");

  return leaderboard.map((entry, index) => ({
    rank: index + 1,
    name: entry.userId?.name || "Unknown",
    weeklyXp: entry.weeklyXp,
    totalXp: entry.xp,
    cefrLevel: entry.cefrLevel,
    streak: entry.streak?.current || 0,
    badgeCount: entry.badges?.length || 0,
  }));
};

/**
 * Update average accuracy (called after lesson completion)
 */
export const updateAverageAccuracy = async (userId, newAccuracy) => {
  const profile = await StudentProfile.findOne({ userId });
  if (!profile) return;

  const totalCompleted = profile.totalLessonsCompleted || 0;
  const currentAvg = profile.averageAccuracy || 0;

  // Incremental average calculation
  profile.averageAccuracy = Math.round(
    (currentAvg * totalCompleted + newAccuracy) / (totalCompleted + 1),
  );
  profile.totalLessonsCompleted = totalCompleted + 1;

  await profile.save();
};

/**
 * Reset weekly XP for all users (called by cron/scheduler)
 */
export const resetWeeklyXp = async () => {
  await StudentProfile.updateMany({}, { weeklyXp: 0 });
};
