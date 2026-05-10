import Course from "./models/course.model.js";
import StudentProfile from "../student/models/studentProfile.model.js";
import LessonProgress from "../lessons/models/lessonProgress.model.js";
import User from "../identity/models/user.model.js";
import AppError from "../../utils/appError.util.js";

/**
 * Create a new course
 */
export const createCourse = async (data, instructorId) => {
  const course = await Course.create({
    ...data,
    instructorId,
  });
  return course;
};

/**
 * Get instructor's courses
 */
export const getCourses = async (instructorId) => {
  return Course.find({ instructorId })
    .populate("lessons", "title cefrLevel type isPublished")
    .sort({ updatedAt: -1 });
};

/**
 * Get a single course
 */
export const getCourseById = async (courseId, instructorId) => {
  const course = await Course.findOne({ _id: courseId, instructorId })
    .populate("lessons", "title cefrLevel type isPublished xpReward estimatedMinutes")
    .populate("enrolledStudents", "name email");

  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  return course;
};

/**
 * Update a course
 */
export const updateCourse = async (courseId, data, instructorId) => {
  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  const allowedFields = [
    "title",
    "description",
    "language",
    "cefrLevel",
    "isPublished",
    "tags",
    "estimatedHours",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      course[field] = data[field];
    }
  }

  await course.save();
  return course;
};

/**
 * Add a lesson to a course
 */
export const addLessonToCourse = async (courseId, lessonId, instructorId) => {
  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  if (course.lessons.includes(lessonId)) {
    throw new AppError("Lesson already in course", 400, "DUPLICATE_LESSON");
  }

  course.lessons.push(lessonId);
  await course.save();

  return course;
};

/**
 * Remove a lesson from a course
 */
export const removeLessonFromCourse = async (courseId, lessonId, instructorId) => {
  const course = await Course.findOne({ _id: courseId, instructorId });

  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  course.lessons = course.lessons.filter(
    (id) => id.toString() !== lessonId.toString(),
  );
  await course.save();

  return course;
};

/**
 * Enroll a student in a course
 */
export const enrollStudent = async (courseId, studentId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  if (course.enrolledStudents.includes(studentId)) {
    throw new AppError("Student already enrolled", 400, "ALREADY_ENROLLED");
  }

  course.enrolledStudents.push(studentId);
  await course.save();

  // Also update the student profile
  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { $addToSet: { enrolledCourses: courseId } },
  );

  return course;
};

/**
 * Get student analytics for the instructor's courses
 */
export const getStudentAnalytics = async (instructorId) => {
  const courses = await Course.find({ instructorId }).select("_id title enrolledStudents lessons");

  const analytics = [];

  for (const course of courses) {
    const studentCount = course.enrolledStudents.length;

    // Get aggregate progress for enrolled students
    const progressStats = await LessonProgress.aggregate([
      {
        $match: {
          lessonId: { $in: course.lessons },
          userId: { $in: course.enrolledStudents },
        },
      },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: "$accuracy" },
          totalCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          avgTimeSpent: { $avg: "$timeSpentSeconds" },
        },
      },
    ]);

    analytics.push({
      courseId: course._id,
      courseTitle: course.title,
      totalStudents: studentCount,
      totalLessons: course.lessons.length,
      avgAccuracy: progressStats[0]?.avgAccuracy
        ? Math.round(progressStats[0].avgAccuracy)
        : 0,
      totalCompletions: progressStats[0]?.totalCompleted || 0,
      avgTimeSpentSeconds: progressStats[0]?.avgTimeSpent
        ? Math.round(progressStats[0].avgTimeSpent)
        : 0,
    });
  }

  return analytics;
};

/**
 * Get at-risk students (inactive > 3 days or accuracy < 40%)
 */
export const getAtRiskStudents = async (instructorId) => {
  const courses = await Course.find({ instructorId }).select("enrolledStudents title");

  const allStudentIds = [
    ...new Set(courses.flatMap((c) => c.enrolledStudents.map((s) => s.toString()))),
  ];

  if (allStudentIds.length === 0) return [];

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const atRiskProfiles = await StudentProfile.find({
    userId: { $in: allStudentIds },
    $or: [
      { "streak.lastActiveDate": { $lt: threeDaysAgo } },
      { "streak.lastActiveDate": null },
      { averageAccuracy: { $lt: 40, $gt: 0 } },
    ],
  }).populate("userId", "name email");

  return atRiskProfiles.map((profile) => ({
    studentName: profile.userId?.name || "Unknown",
    studentEmail: profile.userId?.email || "Unknown",
    lastActive: profile.streak?.lastActiveDate,
    currentStreak: profile.streak?.current || 0,
    averageAccuracy: profile.averageAccuracy,
    cefrLevel: profile.cefrLevel,
    reason:
      !profile.streak?.lastActiveDate || profile.streak.lastActiveDate < threeDaysAgo
        ? "Inactive for 3+ days"
        : "Low accuracy (< 40%)",
  }));
};
