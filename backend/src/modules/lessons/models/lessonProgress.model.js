import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    exerciseIndex: { type: Number, required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    hesitationMs: { type: Number, default: 0 },
  },
  { _id: false },
);

const lessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },

    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"],
      default: "NOT_STARTED",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    answers: [answerSchema],

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    xpEarned: {
      type: Number,
      default: 0,
    },

    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// One progress record per user per lesson
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("LessonProgress", lessonProgressSchema);
