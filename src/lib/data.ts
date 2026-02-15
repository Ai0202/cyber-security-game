import storiesData from '@/data/stories.json';
import componentsData from '@/data/components.json';
import phasesData from '@/data/phases.json';
import connectionsData from '@/data/connections.json';
import type {
  StoryDefinition,
  ComponentDefinition,
  PhaseInfo,
  ConnectionTemplate,
} from '@/types';

export const stories: StoryDefinition[] = storiesData as StoryDefinition[];
export const components: ComponentDefinition[] =
  componentsData as ComponentDefinition[];
export const phases: PhaseInfo[] = phasesData as PhaseInfo[];
export const connections: ConnectionTemplate[] =
  connectionsData as ConnectionTemplate[];

export function getStory(id: string): StoryDefinition | undefined {
  return stories.find((s) => s.id === id);
}

export function getComponent(id: string): ComponentDefinition | undefined {
  return components.find((c) => c.id === id);
}

export function getComponentsByPhase(phaseId: string): ComponentDefinition[] {
  return components.filter((c) => c.phaseId === phaseId);
}

export function getPhase(id: string): PhaseInfo | undefined {
  return phases.find((p) => p.id === id);
}

export function getConnection(
  fromId: string,
  toId: string
): ConnectionTemplate | undefined {
  return connections.find((c) => c.from === fromId && c.to === toId);
}
