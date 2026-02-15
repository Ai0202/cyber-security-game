'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '@/contexts/GameContext';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

import type { StoryDefinition } from '@/types';

interface StoryDetailProps {
  story: StoryDefinition;
}

export default function StoryDetail({ story }: StoryDetailProps) {
  const router = useRouter();
  const { startStory, session } = useGame();

  const handleStart = () => {
    startStory(story.id);
    router.push(`/story/${story.id}/play`);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <NeonBadge color="cyan">{story.context.industry}</NeonBadge>
            <NeonBadge
              color={
                story.difficulty === 'easy'
                  ? 'green'
                  : story.difficulty === 'normal'
                    ? 'yellow'
                    : 'red'
              }
            >
              {story.difficulty.toUpperCase()}
            </NeonBadge>
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-wider text-cyber-green">
            {story.title}
          </h1>
          <p className="mt-2 text-gray-400">{story.description}</p>
        </div>

        {/* Target Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-lg border border-white/10 bg-cyber-card p-5"
        >
          <h2 className="mb-3 font-mono text-xs tracking-widest text-cyber-cyan">
            TARGET INFORMATION
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-gray-500">組織:</dt>
              <dd className="text-white">{story.context.targetOrg}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-gray-500">業界:</dt>
              <dd className="text-white">{story.context.industry}</dd>
            </div>
            <div>
              <dt className="text-gray-500">概要:</dt>
              <dd className="mt-1 text-gray-300">
                {story.context.targetDescription}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">目的:</dt>
              <dd className="mt-1 text-cyber-magenta">
                {story.context.objective}
              </dd>
            </div>
          </dl>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <CyberButton onClick={handleStart} variant="primary" className="w-full">
            ミッションをはじめる
          </CyberButton>
        </motion.div>
      </motion.div>
    </div>
  );
}
