'use client';

import { motion } from 'framer-motion';

export default function ScenarioLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent"
        />
        <p className="font-mono text-sm text-cyber-cyan">
          LOADING...
        </p>
      </div>
    </div>
  );
}
