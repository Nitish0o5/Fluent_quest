import mongoose from "mongoose";
import { CEFR_LEVELS, SUPPORTED_LANGUAGES } from "../../../config/constants.js";

const courseSchema = new mongoose.Schema(
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

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],

    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isPublished: {
      type: Boolean,
      default: false,
    },

    tags: [{ type: String }],

    estimatedHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

courseSchema.index({ instructorId: 1 });
courseSchema.index({ language: 1, cefrLevel: 1 });

export default mongoose.model("Course", courseSchema);
