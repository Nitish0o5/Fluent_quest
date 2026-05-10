import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../../config/env.js";
import Conversation from "./models/conversation.model.js";
import AppError from "../../utils/appError.util.js";

// Initialize Gemini
let genAI = null;
let model = null;

const getModel = () => {
  if (!model) {
    if (!ENV.GEMINI_API_KEY) {
      throw new AppError(
        "GEMINI_API_KEY not configured",
        503,
        "AI_NOT_CONFIGURED",
      );
    }
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return model;
};

/**
 * Build a CEFR-aware system prompt for the AI tutor
 */
const buildTutorPrompt = (language, cefrLevel) => {
  const levelGuide = {
    A1: "Use only basic vocabulary (300-600 words). Speak in very short, simple sentences. Focus on present tense. Be extremely patient and encouraging.",
    A2: "Use elementary vocabulary (600-1200 words). Use simple past tense and basic connectors. Keep sentences short but allow compound sentences.",
    B1: "Use intermediate vocabulary (1200-2500 words). Use present perfect, conditionals, and relative clauses. Encourage longer responses.",
    B2: "Use upper-intermediate vocabulary (2500-5000 words). Use passive voice, reported speech, and all tenses. Engage in nuanced discussions.",
    C1: "Use advanced vocabulary (5000-10000 words) including idioms. Use complex grammar (inversion, cleft sentences). Discuss abstract topics.",
    C2: "Use native-level vocabulary (10000+ words). Use sophisticated grammar and stylistic variation. Discuss nuanced, literary, and philosophical topics.",
  };

  return `You are an expert ${language} language tutor specializing in ${cefrLevel} level students.

ROLE: You are a patient, encouraging, and knowledgeable language tutor.

LANGUAGE LEVEL GUIDELINES:
${levelGuide[cefrLevel] || levelGuide.A1}

INSTRUCTIONS:
1. Always respond primarily in ${language}, with brief English explanations when correcting errors.
2. If the student makes a grammatical error, correct it immediately with a clear explanation.
3. Format corrections as: "✏️ Correction: [wrong] → [right] — [brief explanation]"
4. After corrections, continue the conversation naturally.
5. Ask follow-up questions to keep the conversation going.
6. Adjust your language complexity to match the ${cefrLevel} level.
7. Periodically introduce new vocabulary appropriate for the ${cefrLevel} level.
8. When introducing new words, provide the translation in parentheses.
9. Be encouraging — praise correct usage and effort.
10. Keep responses concise (2-4 sentences for A1-A2, 3-6 sentences for B1+).

NEVER:
- Switch entirely to English unless the student is completely stuck
- Use vocabulary significantly above the student's level without explanation
- Be overly formal or robotic — be warm and conversational`;
};

/**
 * Chat with AI tutor
 */
export const chatWithTutor = async (userId, message, language, cefrLevel, conversationId) => {
  const aiModel = getModel();

  let conversation;

  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
    }
  } else {
    conversation = await Conversation.create({
      userId,
      language,
      cefrLevel,
      messages: [],
      topic: "General Practice",
    });
  }

  // Add user message
  conversation.messages.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  // Build prompt with conversation history
  const systemPrompt = buildTutorPrompt(language, cefrLevel);

  const chatHistory = conversation.messages
    .slice(-10) // Last 10 messages for context
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${chatHistory}\n\nRespond as the Tutor to the student's latest message. Remember to correct any errors.`;

  try {
    const result = await aiModel.generateContent(fullPrompt);
    const aiResponse = result.response.text();

    // Add AI response
    conversation.messages.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });

    // Count corrections in response
    const correctionCount = (aiResponse.match(/✏️ Correction/g) || []).length;
    conversation.feedback.corrections += correctionCount;

    await conversation.save();

    return {
      conversationId: conversation._id,
      message: aiResponse,
      corrections: correctionCount,
    };
  } catch (error) {
    await conversation.save(); // Save user message even if AI fails
    throw new AppError(
      "AI service temporarily unavailable",
      503,
      "AI_SERVICE_ERROR",
    );
  }
};

/**
 * Grammar Error Correction (GEC)
 */
export const correctGrammar = async (sentence, language, cefrLevel) => {
  const aiModel = getModel();

  const prompt = `You are an expert ${language} grammar checker for ${cefrLevel} students.

Analyze the following sentence and provide corrections in this exact JSON format:
{
  "original": "the original sentence",
  "corrected": "the corrected sentence",
  "isCorrect": true/false,
  "errors": [
    {
      "wrong": "the incorrect part",
      "right": "the correct form",
      "type": "grammar/spelling/vocabulary/punctuation",
      "explanation": "brief explanation of why this is wrong and the rule"
    }
  ],
  "suggestion": "a more natural-sounding alternative (optional)",
  "cefrNote": "what CEFR level this grammar point belongs to"
}

If the sentence is correct, set isCorrect to true and leave errors empty.

Sentence to check: "${sentence}"

Respond ONLY with the JSON object, no additional text.`;

  try {
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      original: sentence,
      corrected: sentence,
      isCorrect: true,
      errors: [],
      suggestion: null,
      cefrNote: cefrLevel,
    };
  } catch (error) {
    throw new AppError(
      "Grammar check service unavailable",
      503,
      "GEC_SERVICE_ERROR",
    );
  }
};

/**
 * Generate lesson content using AI (for instructors)
 */
export const generateLessonContent = async (topic, language, cefrLevel, exerciseType, count = 5) => {
  const aiModel = getModel();

  const typeInstructions = {
    MCQ: "multiple choice questions with 4 options each",
    FILL_BLANK: "fill-in-the-blank exercises (use ___ for the blank)",
    TRANSLATION: "translation exercises from English to " + language,
    WORD_MATCH: "word matching exercises (word and its definition/translation)",
  };

  const prompt = `You are an expert ${language} language curriculum designer.

Generate ${count} ${typeInstructions[exerciseType] || "exercises"} about "${topic}" for ${cefrLevel} level students.

Respond in this exact JSON format:
{
  "title": "Lesson title",
  "description": "Brief lesson description",
  "instructions": "Instructions for the student",
  "exercises": [
    {
      "prompt": "The question or exercise text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "the correct answer",
      "hints": ["hint1"],
      "explanation": "Why this is the correct answer"
    }
  ]
}

For FILL_BLANK type, options can be empty. For TRANSLATION, options should be empty.
Ensure all content is appropriate for ${cefrLevel} level.
Make exercises progressively harder within the set.

Respond ONLY with the JSON object.`;

  try {
    const result = await aiModel.generateContent(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new AppError("Failed to generate content", 500, "GENERATION_FAILED");
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Content generation service unavailable",
      503,
      "AI_SERVICE_ERROR",
    );
  }
};

/**
 * Get user's conversations
 */
export const getConversations = async (userId, limit = 20) => {
  return Conversation.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select("language cefrLevel topic feedback createdAt updatedAt")
    .lean();
};

/**
 * Get a single conversation with full history
 */
export const getConversationById = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404, "CONVERSATION_NOT_FOUND");
  }

  return conversation;
};
