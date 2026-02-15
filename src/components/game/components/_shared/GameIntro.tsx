'use client';

import { motion } from 'framer-motion';

type AccentColor = 'green' | 'cyan' | 'magenta' | 'red';

interface GameIntroProps {
  title: string;
  description: string;
  hint?: string;
  details?: string;
  onStart: () => void;
  accentColor?: AccentColor;
}

const accentStyles: Record<AccentColor, { text: string; border: string; hover: string }> = {
  green: {
    text: 'text-cyber-green',
    border: 'border-cyber-green',
    hover: 'hover:bg-cyber-green/10',
  },
  cyan: {
    text: 'text-cyber-cyan',
    border: 'border-cyber-cyan',
    hover: 'hover:bg-cyber-cyan/10',
  },
  magenta: {
    text: 'text-cyber-magenta',
    border: 'border-cyber-magenta',
    hover: 'hover:bg-cyber-magenta/10',
  },
  red: {
    text: 'text-red-400',
    border: 'border-red-400',
    hover: 'hover:bg-red-400/10',
  },
};

export default function GameIntro({
  title,
  description,
  hint,
  details,
  onStart,
  accentColor = 'cyan',
}: GameIntroProps) {
  const accent = accentStyles[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h2
        className={`mb-2 font-mono text-xs tracking-widest ${accent.text}`}
      >
        {title}
      </h2>

      <p className="mb-2 text-sm text-gray-400">{description}</p>

      {hint && (
        <p className="mb-4 text-xs text-cyber-green/70">{hint}</p>
      )}

      {details && (
        <p className="mb-6 text-xs text-gray-500">{details}</p>
      )}

      <button
        onClick={onStart}
        className={`rounded border px-8 py-3 font-mono text-sm font-bold tracking-wider transition-colors ${accent.border} ${accent.text} ${accent.hover}`}
      >
        START
      </button>
    </motion.div>
  );
}
