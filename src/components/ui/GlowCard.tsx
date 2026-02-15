'use client';

import { motion } from 'framer-motion';

interface GlowCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glowColor?: 'green' | 'magenta' | 'cyan';
}

const glowColors = {
  green: 'hover:border-cyber-green/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)]',
  magenta: 'hover:border-cyber-magenta/50 hover:shadow-[0_0_20px_rgba(255,0,255,0.15)]',
  cyan: 'hover:border-cyber-cyan/50 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]',
};

export default function GlowCard({
  children,
  onClick,
  className = '',
  glowColor = 'green',
}: GlowCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`cursor-pointer rounded-lg border border-white/10 bg-cyber-card p-6 transition-all ${glowColors[glowColor]} ${className}`}
    >
      {children}
    </motion.div>
  );
}
