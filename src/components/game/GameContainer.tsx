'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import { getGameComponent } from '@/lib/component-registry';
import { getConnection } from '@/lib/data';
import PhaseTimeline from '@/components/story/PhaseTimeline';
import PhaseTransition from '@/components/game/PhaseTransition';
import type { PhaseResult } from '@/types';

type GamePhase = 'transition' | 'playing' | 'phase-complete';

export default function GameContainer() {
  const router = useRouter();
  const {
    session,
    currentComponentId,
    currentPhaseId,
    previousResults,
    accumulatedContext,
    completePhase,
  } = useGame();
  const [gamePhase, setGamePhase] = useState<GamePhase>('transition');

  // Get narrative text from connection template for phase transitions
  const narrativeText = useMemo(() => {
    const idx = session?.currentPhaseIndex ?? 0;
    if (!session || idx === 0) return undefined;
    const prevComponentId = session.selectedComponents[idx - 1];
    const currComponentId = session.selectedComponents[idx];
    if (!prevComponentId || !currComponentId) return undefined;
    const connection = getConnection(prevComponentId, currComponentId);
    return connection?.transition;
  }, [session]);

  const handleTransitionComplete = useCallback(() => {
    setGamePhase('playing');
  }, []);

  const handlePhaseComplete = useCallback(
    (result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>) => {
      setGamePhase('phase-complete');
      setTimeout(() => {
        completePhase(result);
        setGamePhase('transition');
      }, 3000);
    },
    [completePhase]
  );

  // セッション完了時は結果画面へ（遅延はphase-completeステートで処理済み）
  useEffect(() => {
    if (session?.status === 'completed') {
      router.push('/result');
    }
  }, [session?.status, router]);

  if (!session || !currentComponentId) {
    return null;
  }

  if (session.status === 'completed') {
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
          narrativeText={narrativeText}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Phase complete overlay */}
      <AnimatePresence>
        {gamePhase === 'phase-complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg"
          >
            <div className="text-center">
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-2xl font-bold tracking-wider text-cyber-green"
              >
                PHASE COMPLETE
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 1.5, ease: 'linear' }}
                className="mx-auto mt-4 h-px w-48 origin-left bg-cyber-green/50"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              previousResults={previousResults}
              phaseId={currentPhaseId ?? ''}
              componentId={currentComponentId}
              onComplete={handlePhaseComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
