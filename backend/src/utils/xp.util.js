import { XP_REWARDS } from "../config/constants.js";

/**
 * Calculate XP reward for completing a lesson
 * Base XP + accuracy bonus + streak multiplier
 */
export const calculateXpReward = (baseXp, accuracy, streakDays) => {
  let xp = baseXp || XP_REWARDS.LESSON_COMPLETE;

  // Accuracy bonus: perfect score gets bonus XP
  if (accuracy === 100) {
    xp += XP_REWARDS.PERFECT_SCORE;
  } else if (accuracy >= 80) {
    xp += Math.round(XP_REWARDS.PERFECT_SCORE * 0.5);
  }

  // Streak multiplier
  const multiplier = getStreakMultiplier(streakDays);
  xp = Math.round(xp * multiplier);

  return xp;
};

/**
 * Get streak multiplier
 * Base 1.0, +0.1 for every 7-day milestone, capped at 2.0
 */
export const getStreakMultiplier = (streakDays) => {
  if (!streakDays || streakDays <= 0) return 1.0;

  const weekMilestones = Math.floor(streakDays / 7);
  const multiplier = 1.0 + weekMilestones * 0.1;

  return Math.min(multiplier, 2.0);
};

/**
 * Determine badge awards based on achievements
 */
export const checkBadgeEligibility = (profile) => {
  const newBadges = [];
  const existingBadgeNames = profile.badges.map((b) => b.name);

  // Streak badges
  if (profile.streak.current >= 7 && !existingBadgeNames.includes("Week Warrior")) {
    newBadges.push({
      name: "Week Warrior",
      description: "Maintained a 7-day streak",
      earnedAt: new Date(),
    });
  }

  if (profile.streak.current >= 30 && !existingBadgeNames.includes("Monthly Master")) {
    newBadges.push({
      name: "Monthly Master",
      description: "Maintained a 30-day streak",
      earnedAt: new Date(),
    });
  }

  if (profile.streak.current >= 100 && !existingBadgeNames.includes("Century Champion")) {
    newBadges.push({
      name: "Century Champion",
      description: "Maintained a 100-day streak",
      earnedAt: new Date(),
    });
  }

  // XP badges
  if (profile.xp >= 1000 && !existingBadgeNames.includes("XP Explorer")) {
    newBadges.push({
      name: "XP Explorer",
      description: "Earned 1,000 XP",
      earnedAt: new Date(),
    });
  }

  if (profile.xp >= 10000 && !existingBadgeNames.includes("XP Conqueror")) {
    newBadges.push({
      name: "XP Conqueror",
      description: "Earned 10,000 XP",
      earnedAt: new Date(),
    });
  }

  // Lesson badges
  const lessonCount = profile.completedLessons?.length || 0;
  if (lessonCount >= 10 && !existingBadgeNames.includes("First Steps")) {
    newBadges.push({
      name: "First Steps",
      description: "Completed 10 lessons",
      earnedAt: new Date(),
    });
  }

  if (lessonCount >= 50 && !existingBadgeNames.includes("Dedicated Learner")) {
    newBadges.push({
      name: "Dedicated Learner",
      description: "Completed 50 lessons",
      earnedAt: new Date(),
    });
  }

  // CEFR level badges
  const levelBadgeName = `CEFR ${profile.cefrLevel} Achieved`;
  if (
    profile.cefrLevel !== "A1" &&
    !existingBadgeNames.includes(levelBadgeName)
  ) {
    newBadges.push({
      name: levelBadgeName,
      description: `Reached ${profile.cefrLevel} proficiency level`,
      earnedAt: new Date(),
    });
  }

  return newBadges;
};
