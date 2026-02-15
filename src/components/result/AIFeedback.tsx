'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AIFeedbackProps {
  feedback: string;
}

export default function AIFeedback({ feedback }: AIFeedbackProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!feedback) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < feedback.length) {
        setDisplayedText(feedback.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [feedback]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="rounded-lg border border-cyber-cyan/20 bg-cyber-card p-5"
    >
      <h3 className="mb-3 font-mono text-xs tracking-widest text-cyber-cyan">
        AI FEEDBACK
      </h3>
      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
        {displayedText}
        {!isComplete && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-cyber-cyan"
          >
            |
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
