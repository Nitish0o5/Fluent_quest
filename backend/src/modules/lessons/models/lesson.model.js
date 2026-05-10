import mongoose from "mongoose";
import {
  CEFR_LEVELS,
  SUPPORTED_LANGUAGES,
  EXERCISE_TYPES,
  LESSON_CATEGORIES,
} from "../../../config/constants.js";

const exerciseSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    hints: [{ type: String }],
    explanation: { type: String },
  },
  { _id: true },
);

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      required: true,
    },

    cefrLevel: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    cefrCanDo: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: EXERCISE_TYPES,
      required: true,
    },

    category: {
      type: String,
      enum: LESSON_CATEGORIES,
      default: "Grammar",
    },

    grammarTopic: {
      type: String,
      trim: true,
    },

    content: {
      instructions: { type: String },
      exercises: [exerciseSchema],
    },

    order: {
      type: Number,
      default: 0,
    },

    xpReward: {
      type: Number,
      default: 10,
    },

    estimatedMinutes: {
      type: Number,
      default: 10,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    tags: [{ type: String }],
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient querying
lessonSchema.index({ language: 1, cefrLevel: 1, order: 1 });
lessonSchema.index({ createdBy: 1 });
lessonSchema.index({ isPublished: 1 });

export default mongoose.model("Lesson", lessonSchema);
