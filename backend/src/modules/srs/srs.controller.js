import { successResponse } from "../../utils/response.util.js";
import * as srsService from "./srs.service.js";
import * as studentService from "../student/student.service.js";
import { XP_REWARDS } from "../../config/constants.js";

export const createCard = async (req, res, next) => {
  try {
    const card = await srsService.createCard(req.user._id, req.body);
    successResponse(res, card, "Card created", 201);
  } catch (error) {
    next(error);
  }
};

export const getDueCards = async (req, res, next) => {
  try {
    const { language, limit } = req.query;
    const cards = await srsService.getDueCards(
      req.user._id,
      language,
      parseInt(limit) || 20,
    );
    successResponse(res, cards, `${cards.length} cards due for review`);
  } catch (error) {
    next(error);
  }
};

export const reviewCard = async (req, res, next) => {
  try {
    const { quality, responseTimeMs } = req.body;
    const result = await srsService.reviewCard(
      req.params.id,
      req.user._id,
      quality,
      responseTimeMs,
    );

    // Award XP for review
    await studentService.addXp(req.user._id, XP_REWARDS.SRS_REVIEW);

    successResponse(res, result, "Card reviewed");
  } catch (error) {
    next(error);
  }
};

export const getCardStats = async (req, res, next) => {
  try {
    const stats = await srsService.getCardStats(req.user._id, req.query.language);
    successResponse(res, stats, "SRS stats retrieved");
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req, res, next) => {
  try {
    await srsService.deleteCard(req.params.id, req.user._id);
    successResponse(res, null, "Card deleted");
  } catch (error) {
    next(error);
  }
};

export const autoGenerateCards = async (req, res, next) => {
  try {
    const result = await srsService.autoGenerateCards(
      req.user._id,
      req.params.lessonId,
    );
    successResponse(res, result, `${result.generated} cards generated`);
  } catch (error) {
    next(error);
  }
};
