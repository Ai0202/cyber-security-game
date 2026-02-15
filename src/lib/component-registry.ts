import type { ComponentType } from 'react';
import type { StoryContext, PhaseResult } from '@/types';
import dynamic from 'next/dynamic';

export interface GameComponentProps {
  storyContext: StoryContext;
  previousContext: Record<string, unknown>;
  onComplete: (
    result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>
  ) => void;
}

const PlaceholderComponent = dynamic(
  () => import('@/components/game/components/PlaceholderComponent')
);

const Phishing = dynamic(
  () => import('@/components/game/components/Phishing')
);

const PasswordCracking = dynamic(
  () => import('@/components/game/components/PasswordCracking')
);

const ShoulderHacking = dynamic(
  () => import('@/components/game/components/ShoulderHacking')
);

const componentMap: Record<string, ComponentType<GameComponentProps>> = {
  phishing: Phishing,
  'password-cracking': PasswordCracking,
  'shoulder-hacking': ShoulderHacking,
};

export function getGameComponent(
  componentId: string
): ComponentType<GameComponentProps> {
  return componentMap[componentId] ?? PlaceholderComponent;
}
