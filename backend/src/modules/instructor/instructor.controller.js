import { successResponse } from "../../utils/response.util.js";
import * as instructorService from "./instructor.service.js";

export const createCourse = async (req, res, next) => {
  try {
    const course = await instructorService.createCourse(req.body, req.user._id);
    successResponse(res, course, "Course created", 201);
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (req, res, next) => {
  try {
    const courses = await instructorService.getCourses(req.user._id);
    successResponse(res, courses, "Courses retrieved");
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const course = await instructorService.getCourseById(req.params.id, req.user._id);
    successResponse(res, course, "Course retrieved");
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await instructorService.updateCourse(
      req.params.id,
      req.body,
      req.user._id,
    );
    successResponse(res, course, "Course updated");
  } catch (error) {
    next(error);
  }
};

export const addLessonToCourse = async (req, res, next) => {
  try {
    const course = await instructorService.addLessonToCourse(
      req.params.id,
      req.body.lessonId,
      req.user._id,
    );
    successResponse(res, course, "Lesson added to course");
  } catch (error) {
    next(error);
  }
};

export const removeLessonFromCourse = async (req, res, next) => {
  try {
    const course = await instructorService.removeLessonFromCourse(
      req.params.id,
      req.body.lessonId,
      req.user._id,
    );
    successResponse(res, course, "Lesson removed from course");
  } catch (error) {
    next(error);
  }
};

export const enrollStudent = async (req, res, next) => {
  try {
    const course = await instructorService.enrollStudent(
      req.params.id,
      req.body.studentId,
    );
    successResponse(res, course, "Student enrolled");
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await instructorService.getStudentAnalytics(req.user._id);
    successResponse(res, analytics, "Analytics retrieved");
  } catch (error) {
    next(error);
  }
};

export const getAtRiskStudents = async (req, res, next) => {
  try {
    const students = await instructorService.getAtRiskStudents(req.user._id);
    successResponse(res, students, "At-risk students retrieved");
  } catch (error) {
    next(error);
  }
};
