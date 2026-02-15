'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import { calculateRank } from '@/lib/session';
import CyberButton from '@/components/ui/CyberButton';
import RankBadge from '@/components/result/RankBadge';
import PhaseScoreCard from '@/components/result/PhaseScoreCard';
import AIFeedback from '@/components/result/AIFeedback';

export default function SessionReport() {
  const router = useRouter();
  const { session, totalScore, resetSession } = useGame();

  const overallRank = useMemo(() => calculateRank(totalScore), [totalScore]);

  const feedbackText = useMemo(() => {
    if (!session) return '';
    const points = session.phaseResults.flatMap((r) => {
      const comp = r.componentId;
      return r.breakdown.map((b) => `[${comp}] ${b.category}: ${b.comment}`);
    });
    return points.length > 0
      ? points.join('\n')
      : `総合スコア ${totalScore} 点、ランク ${overallRank} です。各フェーズの攻撃手法を体験しました。実際の防御では、多層防御（Defense in Depth）の考え方が重要です。一つの対策が突破されても、次の層で食い止められるようにしましょう。`;
  }, [session, totalScore, overallRank]);

  if (!session) return null;

  const handleRetry = () => {
    const storyId = session.storyId;
    resetSession();
    router.push(`/story/${storyId}`);
  };

  const handleHome = () => {
    resetSession();
    router.push('/');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8 text-center"
      >
        <p className="font-mono text-xs tracking-widest text-gray-500">
          MISSION COMPLETE
        </p>
      </motion.div>

      {/* Score + Rank */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex flex-col items-center"
      >
        <RankBadge rank={overallRank} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 font-mono text-4xl font-bold text-white"
        >
          {totalScore}
          <span className="text-lg text-gray-500"> / 100</span>
        </motion.p>
      </motion.div>

      {/* Phase Scores */}
      <div className="mb-8 space-y-3">
        <h2 className="font-mono text-xs tracking-widest text-gray-500">
          PHASE RESULTS
        </h2>
        {session.phaseResults.map((result, i) => (
          <PhaseScoreCard key={i} result={result} index={i} />
        ))}
      </div>

      {/* AI Feedback */}
      <div className="mb-8">
        <AIFeedback feedback={feedbackText} />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <CyberButton onClick={handleRetry} className="flex-1">
          RETRY
        </CyberButton>
        <CyberButton onClick={handleHome} variant="secondary" className="flex-1">
          HOME
        </CyberButton>
      </div>
    </div>
  );
}
