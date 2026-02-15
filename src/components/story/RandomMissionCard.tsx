'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import NeonBadge from '@/components/ui/NeonBadge';

export default function RandomMissionCard() {
  const router = useRouter();
  const { startRandomMission, isLoading } = useGame();

  const handleStart = async () => {
    await startRandomMission();
    router.push('/play/random');
  };

  return (
    <motion.button
      onClick={handleStart}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full overflow-hidden rounded-xl border border-cyber-magenta/30 bg-gradient-to-br from-cyber-card to-cyber-magenta/5 p-5 text-left transition-colors hover:border-cyber-magenta/50"
    >
      <div className="absolute right-3 top-3">
        <NeonBadge color="magenta">RANDOM</NeonBadge>
      </div>

      <p className="font-mono text-lg font-bold tracking-wider text-cyber-magenta">
        RANDOM MISSION
      </p>
      <p className="mt-1 text-sm text-gray-400">
        ランダムな攻撃チェーンでミッションに挑戦
      </p>
      <p className="mt-2 text-xs text-gray-500">
        19コンポーネントからランダムに4つが選出され、AIがストーリーを生成します
      </p>

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-cyber-bg/80"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mx-auto mb-2 h-6 w-6 rounded-full border-2 border-cyber-magenta border-t-transparent"
            />
            <p className="font-mono text-xs text-cyber-magenta">
              GENERATING MISSION...
            </p>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}
