import mongoose from "mongoose";
import { CEFR_LEVELS, SUPPORTED_LANGUAGES } from "../../../config/constants.js";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
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

    cefrLevel: {
      type: String,
      enum: CEFR_LEVELS,
      required: true,
    },

    messages: [messageSchema],

    topic: {
      type: String,
      trim: true,
      default: "General Practice",
    },

    feedback: {
      corrections: { type: Number, default: 0 },
      score: { type: Number, default: 0, min: 0, max: 100 },
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
