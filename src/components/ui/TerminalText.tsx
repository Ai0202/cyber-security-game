'use client';

import { motion } from 'framer-motion';

interface TerminalTextProps {
  text: string;
  className?: string;
  speed?: number;
}

export default function TerminalText({
  text,
  className = '',
  speed = 0.03,
}: TerminalTextProps) {
  const characters = text.split('');

  return (
    <span className={`font-mono ${className}`}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * speed, duration: 0.01 }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          delay: characters.length * speed,
          duration: 0.8,
          repeat: Infinity,
        }}
        className="text-cyber-green"
      >
        _
      </motion.span>
    </span>
  );
}
