'use client';

import Link from 'next/link';
import GlowCard from '@/components/ui/GlowCard';
import NeonBadge from '@/components/ui/NeonBadge';
import type { StoryDefinition } from '@/types';

interface StoryCardProps {
  story: StoryDefinition;
}

const difficultyConfig = {
  easy: { label: 'EASY', color: 'green' as const },
  normal: { label: 'NORMAL', color: 'yellow' as const },
  hard: { label: 'HARD', color: 'red' as const },
};

export default function StoryCard({ story }: StoryCardProps) {
  const diff = difficultyConfig[story.difficulty];

  return (
    <Link href={`/story/${story.id}`}>
      <GlowCard glowColor="green">
        <div className="flex items-start justify-between">
          <NeonBadge color="cyan">{story.context.industry}</NeonBadge>
          <NeonBadge color={diff.color}>{diff.label}</NeonBadge>
        </div>
        <h3 className="mt-4 font-mono text-lg font-bold tracking-wider text-cyber-green">
          {story.title}
        </h3>
        <p className="mt-2 text-sm text-gray-400">{story.description}</p>
        <p className="mt-3 text-xs text-gray-500">
          TARGET: {story.context.targetOrg}
        </p>
      </GlowCard>
    </Link>
  );
}
