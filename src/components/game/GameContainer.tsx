'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { getGameComponent } from '@/lib/component-registry';
import PhaseTimeline from '@/components/story/PhaseTimeline';
import PhaseTransition from '@/components/game/PhaseTransition';
import type { PhaseResult } from '@/types';

type GamePhase = 'transition' | 'playing';

export default function GameContainer() {
  const router = useRouter();
  const {
    session,
    currentComponentId,
    accumulatedContext,
    completePhase,
  } = useGame();
  const [gamePhase, setGamePhase] = useState<GamePhase>('transition');

  const handleTransitionComplete = useCallback(() => {
    setGamePhase('playing');
  }, []);

  const handlePhaseComplete = useCallback(
    (result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>) => {
      completePhase(result);
      setGamePhase('transition');
    },
    [completePhase]
  );

  if (!session || !currentComponentId) {
    return null;
  }

  // セッション完了時は結果画面へ
  if (session.status === 'completed') {
    router.push('/result');
    return null;
  }

  const GameComponent = getGameComponent(currentComponentId);

  return (
    <div className="min-h-screen">
      {/* Phase progress bar */}
      <div className="sticky top-0 z-40 border-b border-white/5 bg-cyber-bg/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <span className="font-mono text-xs text-gray-500">
            PHASE {session.currentPhaseIndex + 1} / {session.selectedComponents.length}
          </span>
          <PhaseTimeline
            selectedComponents={session.selectedComponents}
            currentPhaseIndex={session.currentPhaseIndex}
            compact
          />
        </div>
      </div>

      {/* Phase transition overlay */}
      {gamePhase === 'transition' && (
        <PhaseTransition
          componentId={currentComponentId}
          phaseIndex={session.currentPhaseIndex}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Game component */}
      <AnimatePresence mode="wait">
        {gamePhase === 'playing' && (
          <motion.div
            key={currentComponentId + session.currentPhaseIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameComponent
              storyContext={session.storyContext}
              previousContext={accumulatedContext}
              onComplete={handlePhaseComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
