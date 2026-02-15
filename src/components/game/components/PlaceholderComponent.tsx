'use client';

import { motion } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';

export default function PlaceholderComponent({
  storyContext,
  onComplete,
}: GameComponentProps) {
  const handleComplete = () => {
    onComplete({
      score: 50,
      rank: 'B',
      breakdown: [
        {
          category: 'プレースホルダー',
          points: 50,
          maxPoints: 100,
          comment: 'このコンポーネントは開発中です',
        },
      ],
      contextOutput: {},
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-cyber-green/30 bg-cyber-card p-8 text-center"
      >
        <p className="font-mono text-sm text-cyber-green">
          // COMPONENT UNDER DEVELOPMENT
        </p>
        <p className="mt-4 text-gray-400">
          ターゲット: {storyContext.targetOrg}
        </p>
        <button
          onClick={handleComplete}
          className="mt-6 rounded border border-cyber-green px-6 py-2 font-mono text-cyber-green transition-colors hover:bg-cyber-green/10"
        >
          COMPLETE PHASE
        </button>
      </motion.div>
    </div>
  );
}
