import mongoose from "mongoose";
import { CEFR_LEVELS, SUPPORTED_LANGUAGES, STREAK_CONFIG } from "../../../config/constants.js";

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    targetLanguage: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      default: "English",
    },

    nativeLanguage: {
      type: String,
      default: "English",
    },

    cefrLevel: {
      type: String,
      enum: CEFR_LEVELS,
      default: "A1",
    },

    cefrGoal: {
      type: String,
      enum: CEFR_LEVELS,
      default: "B2",
    },

    xp: {
      type: Number,
      default: 0,
    },

    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
      freezesLeft: { type: Number, default: STREAK_CONFIG.INITIAL_FREEZES },
    },

    dailyGoalMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 120,
    },

    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    badges: [
      {
        name: { type: String, required: true },
        description: { type: String },
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    onboarded: {
      type: Boolean,
      default: false,
    },

    weeklyXp: {
      type: Number,
      default: 0,
    },

    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalLessonsCompleted: {
      type: Number,
      default: 0,
    },

    totalTimeSpentMinutes: {
      type: Number,
      default: 0,
    },

    enrolledCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Index for leaderboard queries
studentProfileSchema.index({ weeklyXp: -1 });
studentProfileSchema.index({ xp: -1 });

export default mongoose.model("StudentProfile", studentProfileSchema);
