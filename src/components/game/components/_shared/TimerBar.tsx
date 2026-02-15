'use client';

import { motion } from 'framer-motion';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
  isRunning: boolean;
}

function getTimerColor(timeLeft: number, totalTime: number): string {
  const ratio = timeLeft / totalTime;
  if (ratio <= 0.1) return 'bg-red-500';
  if (ratio <= 0.33) return 'bg-yellow-400';
  return 'bg-cyber-cyan';
}

function getTextColor(timeLeft: number, totalTime: number): string {
  const ratio = timeLeft / totalTime;
  if (ratio <= 0.1) return 'text-red-500';
  if (ratio <= 0.33) return 'text-yellow-400';
  return 'text-cyber-cyan';
}

export default function TimerBar({
  timeLeft,
  totalTime,
  isRunning,
}: TimerBarProps) {
  const percentage = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const barColor = getTimerColor(timeLeft, totalTime);
  const textColor = getTextColor(timeLeft, totalTime);

  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${barColor}`}
          animate={{ width: `${percentage}%` }}
          transition={isRunning ? { duration: 0.5, ease: 'linear' } : { duration: 0 }}
        />
      </div>
      <span className={`min-w-[3rem] text-right font-mono text-sm font-bold ${textColor}`}>
        {timeLeft}s
      </span>
    </div>
  );
}
