import SRSCard from "./models/srsCard.model.js";
import Lesson from "../lessons/models/lesson.model.js";
import AppError from "../../utils/appError.util.js";
import {
  calculateSM2,
  calculateRetrievability,
  updateStability,
} from "../../utils/srs.util.js";

/**
 * Create a new SRS card manually
 */
export const createCard = async (userId, data) => {
  const card = await SRSCard.create({
    userId,
    language: data.language,
    front: data.front,
    back: data.back,
    context: data.context,
    cefrLevel: data.cefrLevel,
    grammarTag: data.grammarTag,
    nextReviewDate: new Date(),
  });

  return card;
};

/**
 * Get cards due for review
 */
export const getDueCards = async (userId, language, limit = 20) => {
  const query = {
    userId,
    nextReviewDate: { $lte: new Date() },
    isMastered: false,
  };

  if (language) query.language = language;

  const cards = await SRSCard.find(query)
    .sort({ nextReviewDate: 1 })
    .limit(limit)
    .select("-reviewHistory");

  // Update retrievability for each card
  return cards.map((card) => {
    const retrievability = calculateRetrievability(
      card.lastReviewDate,
      card.stability,
    );
    return {
      ...card.toObject(),
      retrievability,
    };
  });
};

/**
 * Review a card — apply SM-2 algorithm
 */
export const reviewCard = async (cardId, userId, quality, responseTimeMs = 0) => {
  const card = await SRSCard.findOne({ _id: cardId, userId });
  if (!card) {
    throw new AppError("Card not found", 404, "CARD_NOT_FOUND");
  }

  if (quality < 0 || quality > 5) {
    throw new AppError("Quality must be between 0 and 5", 400, "INVALID_QUALITY");
  }

  // Calculate current retrievability before review
  const currentRetrievability = calculateRetrievability(
    card.lastReviewDate,
    card.stability,
  );

  // Apply SM-2 algorithm
  const { newEF, newInterval, newRepetitionCount, nextReviewDate } = calculateSM2(
    card.easinessFactor,
    quality,
    card.repetitionCount,
    card.interval,
  );

  // Update stability
  const newStability = updateStability(card.stability, currentRetrievability, quality);

  // Add to review history (keep last 10)
  const reviewEntry = {
    date: new Date(),
    quality,
    responseTimeMs,
  };

  if (card.reviewHistory.length >= 10) {
    card.reviewHistory.shift(); // Remove oldest
  }
  card.reviewHistory.push(reviewEntry);

  // Update card
  card.easinessFactor = newEF;
  card.interval = newInterval;
  card.repetitionCount = newRepetitionCount;
  card.nextReviewDate = nextReviewDate;
  card.lastReviewDate = new Date();
  card.stability = newStability;
  card.retrievability = currentRetrievability;

  // Mark as mastered if interval > 21 days and EF > 2.0
  if (newInterval > 21 && newEF > 2.0) {
    card.isMastered = true;
  }

  await card.save();

  return {
    card: {
      id: card._id,
      front: card.front,
      back: card.back,
      easinessFactor: card.easinessFactor,
      interval: card.interval,
      nextReviewDate: card.nextReviewDate,
      repetitionCount: card.repetitionCount,
      stability: card.stability,
      isMastered: card.isMastered,
    },
    review: {
      quality,
      previousRetrievability: currentRetrievability,
      newStability,
    },
  };
};

/**
 * Get SRS statistics for a user
 */
export const getCardStats = async (userId, language) => {
  const query = { userId };
  if (language) query.language = language;

  const [total, dueToday, mastered, learning] = await Promise.all([
    SRSCard.countDocuments(query),
    SRSCard.countDocuments({
      ...query,
      nextReviewDate: { $lte: new Date() },
      isMastered: false,
    }),
    SRSCard.countDocuments({ ...query, isMastered: true }),
    SRSCard.countDocuments({ ...query, isMastered: false }),
  ]);

  // Average EF
  const avgEF = await SRSCard.aggregate([
    { $match: query },
    { $group: { _id: null, avgEF: { $avg: "$easinessFactor" } } },
  ]);

  return {
    total,
    dueToday,
    mastered,
    learning,
    averageEasinessFactor: avgEF[0]?.avgEF
      ? Math.round(avgEF[0].avgEF * 100) / 100
      : 2.5,
  };
};

/**
 * Delete a card
 */
export const deleteCard = async (cardId, userId) => {
  const card = await SRSCard.findOneAndDelete({ _id: cardId, userId });
  if (!card) {
    throw new AppError("Card not found", 404, "CARD_NOT_FOUND");
  }
  return { deleted: true };
};

/**
 * Auto-generate SRS cards from a lesson
 */
export const autoGenerateCards = async (userId, lessonId) => {
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404, "LESSON_NOT_FOUND");
  }

  const cards = [];

  for (const exercise of lesson.content.exercises) {
    // Check if card already exists
    const existing = await SRSCard.findOne({
      userId,
      front: exercise.prompt,
      language: lesson.language,
    });

    if (!existing) {
      const card = await SRSCard.create({
        userId,
        language: lesson.language,
        front: exercise.prompt,
        back: exercise.correctAnswer,
        context: exercise.explanation || "",
        cefrLevel: lesson.cefrLevel,
        grammarTag: lesson.grammarTopic,
        sourceLesson: lesson._id,
        nextReviewDate: new Date(),
      });
      cards.push(card);
    }
  }

  return { generated: cards.length, cards };
};
