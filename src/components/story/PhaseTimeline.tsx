'use client';

import { motion } from 'framer-motion';
import NeonBadge from '@/components/ui/NeonBadge';
import { getPhase, getComponent } from '@/lib/data';

interface PhaseTimelineProps {
  selectedComponents: string[];
  currentPhaseIndex?: number;
  compact?: boolean;
}

export default function PhaseTimeline({
  selectedComponents,
  currentPhaseIndex,
  compact = false,
}: PhaseTimelineProps) {
  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-3'}>
      {selectedComponents.map((componentId, index) => {
        const component = getComponent(componentId);
        const phase = component ? getPhase(component.phaseId) : null;
        const isActive = currentPhaseIndex === index;
        const isCompleted =
          currentPhaseIndex !== undefined && index < currentPhaseIndex;

        if (compact) {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-1"
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  isActive
                    ? 'bg-cyber-green shadow-[0_0_8px_rgba(0,255,136,0.5)]'
                    : isCompleted
                      ? 'bg-cyber-green/50'
                      : 'bg-gray-600'
                }`}
              />
              {index < selectedComponents.length - 1 && (
                <div
                  className={`h-px w-4 ${isCompleted ? 'bg-cyber-green/50' : 'bg-gray-700'}`}
                />
              )}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`flex items-center gap-4 rounded-lg border p-4 ${
              isActive
                ? 'border-cyber-green/50 bg-cyber-green/5'
                : isCompleted
                  ? 'border-cyber-green/20 bg-cyber-card/50 opacity-60'
                  : 'border-white/5 bg-cyber-card/30'
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                isActive
                  ? 'border-cyber-green text-cyber-green'
                  : isCompleted
                    ? 'border-cyber-green/50 text-cyber-green/50'
                    : 'border-gray-600 text-gray-600'
              }`}
            >
              {isCompleted ? '✓' : index + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs text-gray-500">
                {phase?.displayName}
              </p>
              <p
                className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}
              >
                {component?.name}
              </p>
            </div>
            {component && (
              <NeonBadge
                color={
                  component.difficulty === 'easy'
                    ? 'green'
                    : component.difficulty === 'normal'
                      ? 'yellow'
                      : 'red'
                }
              >
                {component.difficulty.toUpperCase()}
              </NeonBadge>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
