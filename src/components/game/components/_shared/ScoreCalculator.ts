import type { Rank, ScoreBreakdown } from '@/types';

export function calculateRank(score: number): Rank {
  if (score >= 90) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function buildResult(
  score: number,
  breakdown: ScoreBreakdown[],
  contextOutput: Record<string, unknown>
): Omit<
  { score: number; rank: Rank; breakdown: ScoreBreakdown[]; contextOutput: Record<string, unknown> },
  never
> {
  const clamped = clampScore(score);
  return {
    score: clamped,
    rank: calculateRank(clamped),
    breakdown,
    contextOutput,
  };
}
