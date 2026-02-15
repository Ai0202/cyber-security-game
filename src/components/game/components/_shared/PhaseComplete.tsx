'use client';

import { motion } from 'framer-motion';
import NeonBadge from '@/components/ui/NeonBadge';

type PhaseColor = 'green' | 'red' | 'cyan';

interface PhaseCompleteProps {
  message?: string;
  color?: PhaseColor;
}

export default function PhaseComplete({
  message = 'PHASE COMPLETE',
  color = 'green',
}: PhaseCompleteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-4 text-center"
    >
      <NeonBadge color={color}>{message}</NeonBadge>
    </motion.div>
  );
}
