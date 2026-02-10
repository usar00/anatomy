/**
 * SM-2 ベースのスペースドリペティション
 * mastery_level: 0-5 (0=未学習, 5=完全習得)
 */

export function calculateNextReview(
  currentMastery: number,
  isCorrect: boolean
): { newMastery: number; nextReviewDays: number } {
  let newMastery = currentMastery;

  if (isCorrect) {
    newMastery = Math.min(5, currentMastery + 1);
  } else {
    newMastery = Math.max(0, currentMastery - 1);
  }

  // SM-2 inspired intervals
  const intervals: Record<number, number> = {
    0: 0, // 即時復習
    1: 0.5, // 12時間後
    2: 1, // 1日後
    3: 3, // 3日後
    4: 7, // 1週間後
    5: 14, // 2週間後
  };

  return {
    newMastery,
    nextReviewDays: intervals[newMastery] ?? 1,
  };
}

export function getNextReviewDate(nextReviewDays: number): string {
  const date = new Date();
  date.setTime(date.getTime() + nextReviewDays * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

/**
 * 星の数を計算（正答率ベース）
 */
export function calculateStars(correct: number, total: number): number {
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  if (rate >= 0.5) return 1;
  return 0;
}
