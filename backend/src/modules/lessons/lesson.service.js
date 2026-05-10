import Lesson from "./models/lesson.model.js";
import LessonProgress from "./models/lessonProgress.model.js";
import AppError from "../../utils/appError.util.js";

/**
 * Create a new lesson (instructor only)
 */
export const createLesson = async (data, instructorId) => {
  const lesson = await Lesson.create({
    ...data,
    createdBy: instructorId,
  });
  return lesson;
};

/**
 * Get lessons with filters
 */
export const getLessons = async (filters = {}) => {
  const query = { isPublished: true };

  if (filters.language) query.language = filters.language;
  if (filters.cefrLevel) query.cefrLevel = filters.cefrLevel;
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [lessons, total] = await Promise.all([
    Lesson.find(query)
      .sort({ order: 1, createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name")
      .select("-content.exercises.correctAnswer"),
    Lesson.countDocuments(query),
  ]);

  return {
    lessons,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get lesson by ID (full detail for enrolled students)
 */
export const getLessonById = async (id) => {
  const lesson = await Lesson.findById(id).populate("createdBy", "name");

  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  return lesson;
};

/**
 * Update a lesson (instructor — own lessons only)
 */
export const updateLesson = async (id, data, instructorId) => {
  const lesson = await Lesson.findById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  if (lesson.createdBy.toString() !== instructorId.toString()) {
    throw new AppError("Not authorized to edit this lesson", 403, "FORBIDDEN");
  }

  const allowedFields = [
    "title",
    "description",
    "cefrCanDo",
    "type",
    "category",
    "grammarTopic",
    "content",
    "order",
    "xpReward",
    "estimatedMinutes",
    "tags",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      lesson[field] = data[field];
    }
  }

  await lesson.save();
  return lesson;
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (id, instructorId) => {
  const lesson = await Lesson.findById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  if (lesson.createdBy.toString() !== instructorId.toString()) {
    throw new AppError("Not authorized to delete this lesson", 403, "FORBIDDEN");
  }

  await Lesson.findByIdAndDelete(id);
  // Clean up progress records
  await LessonProgress.deleteMany({ lessonId: id });

  return { deleted: true };
};

/**
 * Publish a lesson
 */
export const publishLesson = async (id, instructorId) => {
  const lesson = await Lesson.findById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  if (lesson.createdBy.toString() !== instructorId.toString()) {
    throw new AppError("Not authorized", 403, "FORBIDDEN");
  }

  if (!lesson.content?.exercises?.length) {
    throw new AppError("Cannot publish lesson without exercises", 400, "NO_EXERCISES");
  }

  lesson.isPublished = true;
  await lesson.save();
  return lesson;
};

/**
 * Get instructor's own lessons (including unpublished)
 */
export const getInstructorLessons = async (instructorId, filters = {}) => {
  const query = { createdBy: instructorId };

  if (filters.language) query.language = filters.language;
  if (filters.cefrLevel) query.cefrLevel = filters.cefrLevel;
  if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

  return Lesson.find(query).sort({ updatedAt: -1 });
};

/**
 * Start a lesson — create progress record
 */
export const startLesson = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.isPublished) {
    throw new AppError("Lesson not found or not published", 404, "LESSON_NOT_FOUND");
  }

  let progress = await LessonProgress.findOne({ userId, lessonId });

  if (progress && progress.status === "COMPLETED") {
    // Allow re-attempt
    progress.status = "IN_PROGRESS";
    progress.answers = [];
    progress.score = 0;
    progress.accuracy = 0;
    progress.attempts += 1;
    progress.startedAt = new Date();
    progress.completedAt = undefined;
    progress.xpEarned = 0;
    progress.timeSpentSeconds = 0;
    await progress.save();
    return progress;
  }

  if (!progress) {
    progress = await LessonProgress.create({
      userId,
      lessonId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
      attempts: 1,
    });
  } else {
    progress.status = "IN_PROGRESS";
    progress.startedAt = new Date();
    await progress.save();
  }

  return progress;
};

/**
 * Submit an exercise answer
 */
export const submitExercise = async (userId, lessonId, exerciseIndex, userAnswer, hesitationMs) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  const exercise = lesson.content.exercises[exerciseIndex];
  if (!exercise) {
    throw new AppError("Exercise not found", 404, "EXERCISE_NOT_FOUND");
  }

  const progress = await LessonProgress.findOne({ userId, lessonId });
  if (!progress || progress.status !== "IN_PROGRESS") {
    throw new AppError("Lesson not started", 400, "LESSON_NOT_STARTED");
  }

  const isCorrect =
    userAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

  // Check if already answered this exercise
  const existingAnswer = progress.answers.find(
    (a) => a.exerciseIndex === exerciseIndex,
  );

  if (existingAnswer) {
    existingAnswer.userAnswer = userAnswer;
    existingAnswer.isCorrect = isCorrect;
    existingAnswer.hesitationMs = hesitationMs || 0;
  } else {
    progress.answers.push({
      exerciseIndex,
      userAnswer,
      isCorrect,
      hesitationMs: hesitationMs || 0,
    });
  }

  await progress.save();

  return {
    isCorrect,
    correctAnswer: isCorrect ? undefined : exercise.correctAnswer,
    explanation: isCorrect ? undefined : exercise.explanation,
    hints: isCorrect ? undefined : exercise.hints,
  };
};

/**
 * Complete a lesson — calculate final score
 */
export const completeLesson = async (userId, lessonId) => {
  const progress = await LessonProgress.findOne({ userId, lessonId });
  if (!progress) {
    throw new AppError("Lesson progress not found", 404, "PROGRESS_NOT_FOUND");
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  const totalExercises = lesson.content.exercises.length;
  const correctAnswers = progress.answers.filter((a) => a.isCorrect).length;
  const accuracy = totalExercises > 0 ? Math.round((correctAnswers / totalExercises) * 100) : 0;

  const timeSpent = progress.startedAt
    ? Math.round((Date.now() - progress.startedAt.getTime()) / 1000)
    : 0;

  progress.status = "COMPLETED";
  progress.score = accuracy;
  progress.accuracy = accuracy;
  progress.completedAt = new Date();
  progress.timeSpentSeconds = timeSpent;

  await progress.save();

  return {
    score: accuracy,
    accuracy,
    correctAnswers,
    totalExercises,
    xpReward: lesson.xpReward,
    timeSpentSeconds: timeSpent,
  };
};

/**
 * Get progress for a specific lesson
 */
export const getProgress = async (userId, lessonId) => {
  const progress = await LessonProgress.findOne({ userId, lessonId })
    .populate("lessonId", "title cefrLevel type");

  return progress;
};

/**
 * Get level-wide progress for a user
 */
export const getLevelProgress = async (userId, language, cefrLevel) => {
  const totalLessons = await Lesson.countDocuments({
    language,
    cefrLevel,
    isPublished: true,
  });

  const completedProgress = await LessonProgress.countDocuments({
    userId,
    status: "COMPLETED",
  });

  // Get lesson IDs for this level
  const levelLessonIds = await Lesson.find({
    language,
    cefrLevel,
    isPublished: true,
  }).select("_id");

  const completedInLevel = await LessonProgress.countDocuments({
    userId,
    lessonId: { $in: levelLessonIds.map((l) => l._id) },
    status: "COMPLETED",
  });

  const avgAccuracy = await LessonProgress.aggregate([
    {
      $match: {
        userId,
        lessonId: { $in: levelLessonIds.map((l) => l._id) },
        status: "COMPLETED",
      },
    },
    { $group: { _id: null, avgAccuracy: { $avg: "$accuracy" } } },
  ]);

  return {
    language,
    cefrLevel,
    totalLessons,
    completedInLevel,
    completionPercentage:
      totalLessons > 0 ? Math.round((completedInLevel / totalLessons) * 100) : 0,
    averageAccuracy: avgAccuracy[0]?.avgAccuracy
      ? Math.round(avgAccuracy[0].avgAccuracy)
      : 0,
  };
};
