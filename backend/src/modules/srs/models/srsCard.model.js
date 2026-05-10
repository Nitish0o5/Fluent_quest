import mongoose from "mongoose";
import { CEFR_LEVELS, SUPPORTED_LANGUAGES } from "../../../config/constants.js";

const reviewHistorySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    quality: { type: Number, min: 0, max: 5, required: true },
    responseTimeMs: { type: Number, default: 0 },
  },
  { _id: false },
);

const srsCardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    language: {
      type: String,
      enum: SUPPORTED_LANGUAGES,
      required: true,
    },

    front: {
      type: String,
      required: true,
      trim: true,
    },

    back: {
      type: String,
      required: true,
      trim: true,
    },

    context: {
      type: String,
      trim: true,
    },

    cefrLevel: {
      type: String,
      enum: CEFR_LEVELS,
      default: "A1",
    },

    grammarTag: {
      type: String,
      trim: true,
    },

    // SM-2 Algorithm Fields
    repetitionCount: {
      type: Number,
      default: 0,
    },

    easinessFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
    },

    interval: {
      type: Number,
      default: 0,
    },

    nextReviewDate: {
      type: Date,
      default: Date.now,
    },

    lastReviewDate: {
      type: Date,
    },

    // Enhanced metrics
    stability: {
      type: Number,
      default: 1.0,
    },

    retrievability: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },

    // Keep last 10 reviews (Subset Pattern)
    reviewHistory: {
      type: [reviewHistorySchema],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Review history limited to 10 entries",
      },
    },

    sourceLesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },

    isMastered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index for efficient due card queries
srsCardSchema.index({ userId: 1, nextReviewDate: 1 });
srsCardSchema.index({ userId: 1, language: 1 });
srsCardSchema.index({ userId: 1, isMastered: 1 });

export default mongoose.model("SRSCard", srsCardSchema);
