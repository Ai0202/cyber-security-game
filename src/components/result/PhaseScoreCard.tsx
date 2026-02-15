'use client';

import { motion } from 'framer-motion';
import { getComponent, getPhase } from '@/lib/data';
import RankBadge from '@/components/result/RankBadge';
import type { PhaseResult } from '@/types';

interface PhaseScoreCardProps {
  result: PhaseResult;
  index: number;
}

export default function PhaseScoreCard({ result, index }: PhaseScoreCardProps) {
  const component = getComponent(result.componentId);
  const phase = getPhase(result.phaseId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.15 }}
      className="rounded-lg border border-white/10 bg-cyber-card p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-500">
            PHASE {index + 1} / {phase?.displayName}
          </p>
          <p className="mt-1 text-sm text-white">{component?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-2xl font-bold text-cyber-green">
            {result.score}
          </span>
          <RankBadge rank={result.rank} size="sm" />
        </div>
      </div>

      {result.breakdown.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-white/5 pt-3">
          {result.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{item.category}</span>
              <span className="font-mono text-gray-300">
                {item.points}/{item.maxPoints}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
