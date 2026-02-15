'use client';

import { motion } from 'framer-motion';
import type { Rank } from '@/types';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'lg';
}

const rankConfig: Record<Rank, { color: string; glow: string }> = {
  S: {
    color: 'text-yellow-300 border-yellow-300',
    glow: 'shadow-[0_0_30px_rgba(253,224,71,0.4)]',
  },
  A: {
    color: 'text-cyber-green border-cyber-green',
    glow: 'shadow-[0_0_25px_rgba(0,255,136,0.3)]',
  },
  B: {
    color: 'text-cyber-cyan border-cyber-cyan',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
  },
  C: {
    color: 'text-orange-400 border-orange-400',
    glow: 'shadow-[0_0_15px_rgba(251,146,60,0.3)]',
  },
  D: {
    color: 'text-gray-400 border-gray-400',
    glow: '',
  },
};

export default function RankBadge({ rank, size = 'lg' }: RankBadgeProps) {
  const config = rankConfig[rank];
  const sizeClasses =
    size === 'lg'
      ? 'h-24 w-24 text-5xl border-2'
      : 'h-10 w-10 text-lg border';

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      }}
      className={`flex items-center justify-center rounded-full font-mono font-bold ${config.color} ${config.glow} ${sizeClasses}`}
    >
      {rank}
    </motion.div>
  );
}
