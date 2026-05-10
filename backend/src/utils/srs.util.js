/**
 * SM-2 Spaced Repetition Algorithm Utility
 *
 * Variables:
 *   n  = repetition count
 *   I  = interval in days
 *   EF = easiness factor (minimum 1.3)
 *   q  = quality of response (0-5)
 *
 * Interval rules:
 *   I(1) = 1
 *   I(2) = 6
 *   I(n) = I(n-1) * EF  for n > 2
 *
 * EF update:
 *   EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 *   EF  = max(EF', 1.3)
 *
 * If q < 3: n resets to 0, I resets to 1 (but EF persists)
 */

export const calculateSM2 = (currentEF, quality, repetitionCount, currentInterval) => {
  let newEF = currentEF;
  let newInterval;
  let newRepetitionCount;

  // Update easiness factor
  newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(newEF, 1.3);
  newEF = Math.round(newEF * 100) / 100; // Round to 2 decimal places

  if (quality < 3) {
    // Failed recall — reset repetition, keep EF
    newRepetitionCount = 0;
    newInterval = 1;
  } else {
    // Successful recall
    newRepetitionCount = repetitionCount + 1;

    if (newRepetitionCount === 1) {
      newInterval = 1;
    } else if (newRepetitionCount === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEF);
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newEF,
    newInterval,
    newRepetitionCount,
    nextReviewDate,
  };
};

/**
 * Calculate retrievability based on elapsed time and stability
 * R = e^(-t/S) where t = days since last review, S = stability
 */
export const calculateRetrievability = (lastReviewDate, stability) => {
  if (!lastReviewDate) return 0;

  const now = new Date();
  const daysSinceReview = (now - new Date(lastReviewDate)) / (1000 * 60 * 60 * 24);
  const retrievability = Math.exp(-daysSinceReview / stability);

  return Math.round(retrievability * 100) / 100;
};

/**
 * Update stability after a review
 * Successful recall at low retrievability → greater stability increase
 */
export const updateStability = (currentStability, retrievability, quality) => {
  if (quality >= 3) {
    // Successful recall
    const stabilityIncrease = 1 + (1 - retrievability) * 0.5;
    return Math.round(currentStability * stabilityIncrease * 100) / 100;
  } else {
    // Failed recall — reduce stability
    return Math.max(0.5, Math.round(currentStability * 0.7 * 100) / 100);
  }
};
