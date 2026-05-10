export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const SUPPORTED_LANGUAGES = [
  "English",
  "German",
  "Italian",
  "Swedish",
  "Spanish",
  "French",
];

export const EXERCISE_TYPES = [
  "MCQ",
  "FILL_BLANK",
  "WORD_MATCH",
  "TRANSLATION",
  "AI_CHAT",
  "LISTENING",
];

export const LESSON_CATEGORIES = [
  "Grammar",
  "Vocabulary",
  "Conversation",
  "Reading",
  "Listening",
  "Writing",
];

export const ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"];

export const SRS_QUALITY_GRADES = {
  COMPLETE_BLACKOUT: 0,
  INCORRECT_REMEMBERED: 1,
  INCORRECT_EASY_RECALL: 2,
  CORRECT_SERIOUS_DIFFICULTY: 3,
  CORRECT_SOME_HESITATION: 4,
  PERFECT_RESPONSE: 5,
};

export const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  PERFECT_SCORE: 25,
  STREAK_BONUS_PER_WEEK: 5,
  SRS_REVIEW: 2,
  AI_CHAT_SESSION: 5,
  FIRST_LESSON_OF_DAY: 5,
};

export const STREAK_CONFIG = {
  INITIAL_FREEZES: 2,
  MAX_FREEZES: 5,
  FREEZE_COST_XP: 50,
};

export const CEFR_VOCABULARY_TARGETS = {
  A1: { min: 300, max: 600 },
  A2: { min: 600, max: 1200 },
  B1: { min: 1200, max: 2500 },
  B2: { min: 2500, max: 5000 },
  C1: { min: 5000, max: 10000 },
  C2: { min: 10000, max: 20000 },
};

export const CEFR_CAN_DO = {
  A1: [
    "Can introduce self and ask simple questions about familiar topics",
    "Can write a simple postcard",
    "Can understand familiar names and very simple sentences",
  ],
  A2: [
    "Can describe background and immediate needs",
    "Can handle short social exchanges",
    "Can find specific information in simple everyday material",
  ],
  B1: [
    "Can deal with most travel situations",
    "Can describe dreams, hopes, and ambitions",
    "Can write simple connected text on familiar topics",
  ],
  B2: [
    "Can explain viewpoints on concrete and abstract topics with fluency",
    "Can interact with native speakers without strain",
    "Can write clear, detailed text on a wide range of subjects",
  ],
  C1: [
    "Can understand long, complex texts and recognize implicit meaning",
    "Can use language flexibly for social, academic, and professional purposes",
    "Can produce clear, well-structured, detailed text on complex subjects",
  ],
  C2: [
    "Can express self spontaneously and precisely",
    "Can distinguish finer shades of meaning in complex situations",
    "Can summarize information from different spoken and written sources",
  ],
};
