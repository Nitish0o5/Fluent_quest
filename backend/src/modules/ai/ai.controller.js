import { successResponse } from "../../utils/response.util.js";
import * as aiService from "./ai.service.js";
import * as studentService from "../student/student.service.js";
import { XP_REWARDS } from "../../config/constants.js";

export const chat = async (req, res, next) => {
  try {
    const { message, language, cefrLevel, conversationId } = req.body;

    if (!message || !language || !cefrLevel) {
      return res.status(400).json({
        success: false,
        message: "message, language, and cefrLevel are required",
      });
    }

    const result = await aiService.chatWithTutor(
      req.user._id,
      message,
      language,
      cefrLevel,
      conversationId,
    );

    // Award XP for AI chat session
    await studentService.addXp(req.user._id, XP_REWARDS.AI_CHAT_SESSION);

    successResponse(res, result, "AI response generated");
  } catch (error) {
    next(error);
  }
};

export const grammarCheck = async (req, res, next) => {
  try {
    const { sentence, language, cefrLevel } = req.body;

    if (!sentence || !language) {
      return res.status(400).json({
        success: false,
        message: "sentence and language are required",
      });
    }

    const result = await aiService.correctGrammar(
      sentence,
      language,
      cefrLevel || "B1",
    );

    successResponse(res, result, "Grammar check complete");
  } catch (error) {
    next(error);
  }
};

export const generateContent = async (req, res, next) => {
  try {
    const { topic, language, cefrLevel, exerciseType, count } = req.body;

    if (!topic || !language || !cefrLevel) {
      return res.status(400).json({
        success: false,
        message: "topic, language, and cefrLevel are required",
      });
    }

    const content = await aiService.generateLessonContent(
      topic,
      language,
      cefrLevel,
      exerciseType || "MCQ",
      count || 5,
    );

    successResponse(res, content, "Content generated successfully");
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const conversations = await aiService.getConversations(req.user._id, limit);
    successResponse(res, conversations, "Conversations retrieved");
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const conversation = await aiService.getConversationById(
      req.params.id,
      req.user._id,
    );
    successResponse(res, conversation, "Conversation retrieved");
  } catch (error) {
    next(error);
  }
};
