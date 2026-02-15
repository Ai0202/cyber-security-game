'use client';

import { motion } from 'framer-motion';

type BadgeColor = 'green' | 'magenta' | 'cyan' | 'yellow' | 'red';

interface NeonBadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const colorStyles: Record<BadgeColor, string> = {
  green: 'border-cyber-green/50 text-cyber-green bg-cyber-green/10',
  magenta: 'border-cyber-magenta/50 text-cyber-magenta bg-cyber-magenta/10',
  cyan: 'border-cyber-cyan/50 text-cyber-cyan bg-cyber-cyan/10',
  yellow: 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10',
  red: 'border-red-400/50 text-red-400 bg-red-400/10',
};

export default function NeonBadge({
  children,
  color = 'green',
  className = '',
}: NeonBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-block rounded-full border px-3 py-1 font-mono text-xs font-bold tracking-wider ${colorStyles[color]} ${className}`}
    >
      {children}
    </motion.span>
  );
}
