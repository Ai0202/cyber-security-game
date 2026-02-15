'use client';

import { useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getComponent } from '@/lib/data';
import { getGameComponent } from '@/lib/component-registry';
import { calculateRank } from '@/lib/session';
import CyberButton from '@/components/ui/CyberButton';
import RankBadge from '@/components/result/RankBadge';
import NeonBadge from '@/components/ui/NeonBadge';
import type { PhaseResult, StoryContext } from '@/types';

const defaultContext: StoryContext = {
  industry: '一般企業',
  targetOrg: 'テスト株式会社',
  targetDescription: '中規模のIT企業。従業員100名。社内ネットワークを運用。',
  objective: 'セキュリティテスト（練習モード）',
};

export default function PracticePage() {
  const params = useParams<{ componentId: string }>();
  const router = useRouter();
  const [result, setResult] = useState<Omit<
    PhaseResult,
    'componentId' | 'phaseId' | 'completedAt'
  > | null>(null);

  const component = getComponent(params.componentId);
  const GameComponent = useMemo(
    () => getGameComponent(params.componentId),
    [params.componentId]
  );

  const handleComplete = useCallback(
    (r: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>) => {
      setResult(r);
    },
    []
  );

  const handleRetry = () => {
    setResult(null);
  };

  if (!component) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">コンポーネントが見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/5 bg-cyber-bg/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <NeonBadge color="magenta">PRACTICE</NeonBadge>
          <span className="font-mono text-xs text-gray-500">
            {component.displayName}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameComponent
              storyContext={defaultContext}
              previousContext={{}}
              onComplete={handleComplete}
            />
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md px-4 py-8"
          >
            <div className="mb-6 text-center">
              <p className="font-mono text-xs tracking-widest text-gray-500">
                PRACTICE RESULT
              </p>
              <h2 className="mt-2 text-lg font-bold text-white">
                {component.name}
              </h2>
            </div>

            <div className="mb-6 flex flex-col items-center">
              <RankBadge rank={calculateRank(result.score)} />
              <p className="mt-4 font-mono text-3xl font-bold text-cyber-green">
                {result.score}
                <span className="text-lg text-gray-500"> / 100</span>
              </p>
            </div>

            {result.breakdown.length > 0 && (
              <div className="mb-6 space-y-2 rounded-lg border border-white/10 bg-cyber-card p-4">
                {result.breakdown.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-400">{item.category}</span>
                    <span className="font-mono text-gray-300">
                      {item.points}/{item.maxPoints}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Learning Points */}
            <div className="mb-8 rounded-lg border border-cyber-cyan/20 bg-cyber-card p-4">
              <h3 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">
                LEARNING POINTS
              </h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {component.learningPoints.map((point, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-cyber-cyan">-</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <CyberButton onClick={handleRetry} className="flex-1">
                RETRY
              </CyberButton>
              <CyberButton
                onClick={() => router.push('/')}
                variant="secondary"
                className="flex-1"
              >
                HOME
              </CyberButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
