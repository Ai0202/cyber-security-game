'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getPhase, getComponent } from '@/lib/data';

interface PhaseTransitionProps {
  componentId: string;
  phaseIndex: number;
  onComplete: () => void;
}

export default function PhaseTransition({
  componentId,
  phaseIndex,
  onComplete,
}: PhaseTransitionProps) {
  const [show, setShow] = useState(true);
  const component = getComponent(componentId);
  const phase = component ? getPhase(component.phaseId) : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-bg"
        >
          {/* Glitch lines background */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: '-100%', opacity: 0 }}
                animate={{
                  x: '200%',
                  opacity: [0, 0.3, 0],
                }}
                transition={{
                  delay: i * 0.15,
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="absolute h-px w-full bg-cyber-green"
                style={{ top: `${15 + i * 10}%` }}
              />
            ))}
          </div>

          <div className="relative text-center">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-xs tracking-[0.3em] text-gray-500"
            >
              PHASE {phaseIndex + 1}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 font-mono text-3xl font-bold tracking-wider text-cyber-green"
            >
              {phase?.displayName}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-3 text-sm text-gray-400"
            >
              {component?.name}
            </motion.p>
            {/* Loading bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1.5, ease: 'linear' }}
              className="mx-auto mt-6 h-px w-48 origin-left bg-cyber-green/50"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
