'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { GameSession, PhaseResult } from '@/types';
import { getStory, getComponent, getPhase } from '@/lib/data';
import {
  createSession,
  advancePhase,
  getAccumulatedContext,
} from '@/lib/session';

interface GameContextValue {
  session: GameSession | null;
  isLoading: boolean;

  // Actions
  startStory: (storyId: string) => void;
  completePhase: (
    result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>
  ) => void;
  resetSession: () => void;

  // Derived state
  currentPhaseId: string | null;
  currentComponentId: string | null;
  currentPhaseName: string | null;
  currentComponentName: string | null;
  previousResults: PhaseResult[];
  accumulatedContext: Record<string, unknown>;
  totalScore: number;
  phaseCount: number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startStory = useCallback((storyId: string) => {
    setIsLoading(true);
    try {
      const newSession = createSession(storyId);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completePhase = useCallback(
    (
      result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>
    ) => {
      setSession((prev) => {
        if (!prev) return prev;

        const story = getStory(prev.storyId);
        if (!story) return prev;

        const phaseId = story.phases[prev.currentPhaseIndex].phaseId;
        const componentId = prev.selectedComponents[prev.currentPhaseIndex];

        const fullResult: PhaseResult = {
          ...result,
          componentId,
          phaseId,
          completedAt: new Date(),
        };

        return advancePhase(prev, fullResult);
      });
    },
    []
  );

  const resetSession = useCallback(() => {
    setSession(null);
  }, []);

  const derived = useMemo(() => {
    if (!session) {
      return {
        currentPhaseId: null,
        currentComponentId: null,
        currentPhaseName: null,
        currentComponentName: null,
        previousResults: [] as PhaseResult[],
        accumulatedContext: {} as Record<string, unknown>,
        totalScore: 0,
        phaseCount: 0,
      };
    }

    const story = getStory(session.storyId);
    const currentPhaseId =
      story?.phases[session.currentPhaseIndex]?.phaseId ?? null;
    const currentComponentId =
      session.selectedComponents[session.currentPhaseIndex] ?? null;

    const phase = currentPhaseId ? getPhase(currentPhaseId) : null;
    const component = currentComponentId
      ? getComponent(currentComponentId)
      : null;

    const totalScore =
      session.phaseResults.length > 0
        ? Math.round(
            session.phaseResults.reduce((sum, r) => sum + r.score, 0) /
              session.phaseResults.length
          )
        : 0;

    return {
      currentPhaseId,
      currentComponentId,
      currentPhaseName: phase?.name ?? null,
      currentComponentName: component?.name ?? null,
      previousResults: session.phaseResults,
      accumulatedContext: getAccumulatedContext(session.phaseResults),
      totalScore,
      phaseCount: session.selectedComponents.length,
    };
  }, [session]);

  const value: GameContextValue = {
    session,
    isLoading,
    startStory,
    completePhase,
    resetSession,
    ...derived,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
