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

const componentMap: Record<string, ComponentType<GameComponentProps>> = {
  // Components will be registered here as they are implemented
  // 'shoulder-hacking': ShoulderHacking,
  // 'password-cracking': PasswordCracking,
  // 'phishing': Phishing,
  // 'network-intrusion': NetworkIntrusion,
  // 'ransomware': Ransomware,
};

export function getGameComponent(
  componentId: string
): ComponentType<GameComponentProps> {
  return componentMap[componentId] ?? PlaceholderComponent;
}
