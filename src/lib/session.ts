import type { GameSession, PhaseResult, Rank } from '@/types';
import { getStory } from '@/lib/data';

export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * ストーリーの各フェーズからランダムにコンポーネントを1つずつ選択し、
 * 新しいゲームセッションを作成する。
 */
export function createSession(storyId: string): GameSession {
  const story = getStory(storyId);
  if (!story) {
    throw new Error(`Story not found: ${storyId}`);
  }

  const selectedComponents = story.phases.map((phase) => {
    const pool = phase.componentPool;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  });

  return {
    id: generateSessionId(),
    storyId,
    selectedComponents,
    storyContext: story.context,
    currentPhaseIndex: 0,
    phaseResults: [],
    status: 'in_progress',
    startedAt: new Date(),
  };
}

/**
 * フェーズ結果を記録し、次のフェーズに進める。
 */
export function advancePhase(
  session: GameSession,
  result: PhaseResult
): GameSession {
  const newResults = [...session.phaseResults, result];
  const nextIndex = session.currentPhaseIndex + 1;
  const isComplete = nextIndex >= session.selectedComponents.length;

  return {
    ...session,
    phaseResults: newResults,
    currentPhaseIndex: isComplete ? session.currentPhaseIndex : nextIndex,
    status: isComplete ? 'completed' : 'in_progress',
  };
}

/**
 * セッションが完了しているか判定する。
 */
export function isSessionComplete(session: GameSession): boolean {
  return session.status === 'completed';
}

/**
 * スコアからランクを算出する。
 */
export function calculateRank(score: number): Rank {
  if (score >= 90) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

/**
 * 全フェーズの contextOutput をマージして蓄積コンテキストを返す。
 */
export function getAccumulatedContext(
  results: PhaseResult[]
): Record<string, unknown> {
  return results.reduce<Record<string, unknown>>(
    (acc, result) => ({ ...acc, ...result.contextOutput }),
    {}
  );
}
