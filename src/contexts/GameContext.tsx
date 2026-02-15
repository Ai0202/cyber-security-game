'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { GameSession, PhaseResult, StoryContext } from '@/types';
import { getStory, getComponent, getPhase, phases, components } from '@/lib/data';
import {
  createSession,
  advancePhase,
  getAccumulatedContext,
  generateSessionId,
} from '@/lib/session';

interface GameContextValue {
  session: GameSession | null;
  isLoading: boolean;

  // Actions
  startStory: (storyId: string) => void;
  startRandomMission: () => Promise<void>;
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

  const startRandomMission = useCallback(async () => {
    setIsLoading(true);
    try {
      // Select one random component per phase
      const selectedComponents = phases.map((phase) => {
        const pool = components.filter((c) => c.phaseId === phase.id);
        return pool[Math.floor(Math.random() * pool.length)].id;
      });

      // Try to generate story context via API
      let storyContext: StoryContext;
      try {
        const res = await fetch('/api/game/generate-story', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentChain: selectedComponents }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        storyContext = data.context;
      } catch {
        // Fallback context
        storyContext = {
          industry: '一般企業',
          targetOrg: 'テクノコーポレーション',
          targetDescription: '中規模のIT企業。従業員300名。セキュリティ対策は標準的。',
          objective: '企業の機密情報を窃取し、組織に最大限のダメージを与える',
        };
      }

      const newSession: GameSession = {
        id: generateSessionId(),
        storyId: 'random-mission',
        selectedComponents,
        storyContext,
        currentPhaseIndex: 0,
        phaseResults: [],
        status: 'in_progress',
        startedAt: new Date(),
      };

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

        const componentId = prev.selectedComponents[prev.currentPhaseIndex];
        const component = getComponent(componentId);
        const phaseId = component?.phaseId ?? phases[prev.currentPhaseIndex]?.id ?? 'recon';

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

    const currentComponentId =
      session.selectedComponents[session.currentPhaseIndex] ?? null;
    const component = currentComponentId
      ? getComponent(currentComponentId)
      : null;
    const currentPhaseId = component?.phaseId ?? null;
    const phase = currentPhaseId ? getPhase(currentPhaseId) : null;

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
    startRandomMission,
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
