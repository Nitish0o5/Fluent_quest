import { successResponse } from "../../utils/response.util.js";
import * as lessonService from "./lesson.service.js";
import * as studentService from "../student/student.service.js";
import { calculateXpReward } from "../../utils/xp.util.js";

// ========== CRUD (Instructor) ==========

export const createLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.createLesson(req.body, req.user._id);
    successResponse(res, lesson, "Lesson created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getLessons = async (req, res, next) => {
  try {
    const result = await lessonService.getLessons(req.query);
    successResponse(res, result, "Lessons retrieved");
  } catch (error) {
    next(error);
  }
};

export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    successResponse(res, lesson, "Lesson retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.updateLesson(
      req.params.id,
      req.body,
      req.user._id,
    );
    successResponse(res, lesson, "Lesson updated");
  } catch (error) {
    next(error);
  }
};

export const deleteLesson = async (req, res, next) => {
  try {
    await lessonService.deleteLesson(req.params.id, req.user._id);
    successResponse(res, null, "Lesson deleted");
  } catch (error) {
    next(error);
  }
};

export const publishLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.publishLesson(req.params.id, req.user._id);
    successResponse(res, lesson, "Lesson published");
  } catch (error) {
    next(error);
  }
};

export const getInstructorLessons = async (req, res, next) => {
  try {
    const lessons = await lessonService.getInstructorLessons(req.user._id, req.query);
    successResponse(res, lessons, "Instructor lessons retrieved");
  } catch (error) {
    next(error);
  }
};

// ========== Progress (Student) ==========

export const startLesson = async (req, res, next) => {
  try {
    const progress = await lessonService.startLesson(req.user._id, req.params.id);
    successResponse(res, progress, "Lesson started");
  } catch (error) {
    next(error);
  }
};

export const submitExercise = async (req, res, next) => {
  try {
    const { exerciseIndex, answer, hesitationMs } = req.body;
    const result = await lessonService.submitExercise(
      req.user._id,
      req.params.id,
      exerciseIndex,
      answer,
      hesitationMs,
    );
    successResponse(res, result, result.isCorrect ? "Correct!" : "Incorrect");
  } catch (error) {
    next(error);
  }
};

export const completeLesson = async (req, res, next) => {
  try {
    const result = await lessonService.completeLesson(req.user._id, req.params.id);

    // Award XP to student profile
    const profile = await studentService.getProfile(req.user._id);
    const xpReward = calculateXpReward(
      result.xpReward,
      result.accuracy,
      profile.streak?.current || 0,
    );

    const xpResult = await studentService.addXp(req.user._id, xpReward);

    // Update average accuracy
    await studentService.updateAverageAccuracy(req.user._id, result.accuracy);

    successResponse(res, {
      ...result,
      xpEarned: xpReward,
      totalXp: xpResult.xp,
      streak: xpResult.streak,
      newBadges: xpResult.newBadges,
    }, "Lesson completed!");
  } catch (error) {
    next(error);
  }
};

export const getProgress = async (req, res, next) => {
  try {
    const progress = await lessonService.getProgress(req.user._id, req.params.id);
    successResponse(res, progress, "Progress retrieved");
  } catch (error) {
    next(error);
  }
};

export const getLevelProgress = async (req, res, next) => {
  try {
    const { language, cefrLevel } = req.query;
    const progress = await lessonService.getLevelProgress(
      req.user._id,
      language,
      cefrLevel,
    );
    successResponse(res, progress, "Level progress retrieved");
  } catch (error) {
    next(error);
  }
};
