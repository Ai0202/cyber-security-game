'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getPhase, getComponent } from '@/lib/data';

interface PhaseTransitionProps {
  componentId: string;
  phaseIndex: number;
  narrativeText?: string;
  onComplete: () => void;
}

export default function PhaseTransition({
  componentId,
  phaseIndex,
  narrativeText,
  onComplete,
}: PhaseTransitionProps) {
  const [show, setShow] = useState(true);
  const component = getComponent(componentId);
  const phase = component ? getPhase(component.phaseId) : null;

  const displayDuration = narrativeText ? 6000 : 5000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, displayDuration);
    return () => clearTimeout(timer);
  }, [displayDuration]);

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

          <div className="relative mx-auto max-w-sm px-6 text-center">
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
              className="mt-2 text-sm text-gray-400"
            >
              {phase?.name}
            </motion.p>

            {/* Narrative text from connection template */}
            {narrativeText && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-4 text-xs leading-relaxed text-cyber-cyan/80"
              >
                {narrativeText}
              </motion.p>
            )}

            {/* Phase description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-5 rounded border border-white/10 bg-cyber-card/80 p-4 text-left"
            >
              <p className="mb-1 font-mono text-[10px] tracking-widest text-cyber-cyan">
                MISSION: {component?.displayName}
              </p>
              <p className="text-sm leading-relaxed text-gray-300">
                {component?.description}
              </p>
            </motion.div>

            {/* Risk / learning hint */}
            {component?.learningPoints && component.learningPoints.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
                className="mt-3 rounded border border-cyber-magenta/20 bg-cyber-card/50 p-3 text-left"
              >
                <p className="mb-1.5 font-mono text-[10px] tracking-widest text-cyber-magenta">
                  REAL-WORLD RISK
                </p>
                <ul className="space-y-1 text-xs leading-relaxed text-gray-400">
                  {component.learningPoints.slice(0, 2).map((point, i) => (
                    <li key={i} className="flex gap-1.5">
                      <span className="text-cyber-magenta">!</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Loading bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: 0.5,
                duration: (displayDuration - 500) / 1000,
                ease: 'linear',
              }}
              className="mx-auto mt-6 h-px w-48 origin-left bg-cyber-green/50"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
