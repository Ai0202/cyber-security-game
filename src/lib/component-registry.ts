import type { ComponentType } from 'react';
import type { StoryContext, PhaseResult } from '@/types';
import dynamic from 'next/dynamic';

export interface GameComponentProps {
  storyContext: StoryContext;
  previousContext: Record<string, unknown>;
  previousResults: PhaseResult[];
  phaseId: string;
  componentId: string;
  onComplete: (
    result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>
  ) => void;
}

const PlaceholderComponent = dynamic(
  () => import('@/components/game/components/PlaceholderComponent')
);

// Recon components
const Recon01SnsRecon = dynamic(
  () => import('@/components/game/components/recon/Recon01SnsRecon')
);
const Recon02DumpsterDiving = dynamic(
  () => import('@/components/game/components/recon/Recon02DumpsterDiving')
);
const Recon03LeakSearch = dynamic(
  () => import('@/components/game/components/recon/Recon03LeakSearch')
);
const Recon04CorporateRecon = dynamic(
  () => import('@/components/game/components/recon/Recon04CorporateRecon')
);
const Recon05Pretexting = dynamic(
  () => import('@/components/game/components/recon/Recon05Pretexting')
);

// Access components
const Access01PhishingEmail = dynamic(
  () => import('@/components/game/components/access/Access01PhishingEmail')
);
const Access02Smishing = dynamic(
  () => import('@/components/game/components/access/Access02Smishing')
);
const Access03ShoulderSurfing = dynamic(
  () => import('@/components/game/components/access/Access03ShoulderSurfing')
);
const Access04EvilTwinWifi = dynamic(
  () => import('@/components/game/components/access/Access04EvilTwinWifi')
);
const Access05CredentialStuffing = dynamic(
  () => import('@/components/game/components/access/Access05CredentialStuffing')
);
const Access06MalwareAttachment = dynamic(
  () => import('@/components/game/components/access/Access06MalwareAttachment')
);

// Lateral components
const Lateral01PrivilegeEscalation = dynamic(
  () => import('@/components/game/components/lateral/Lateral01PrivilegeEscalation')
);
const Lateral02LateralMovement = dynamic(
  () => import('@/components/game/components/lateral/Lateral02LateralMovement')
);
const Lateral03EmailCompromise = dynamic(
  () => import('@/components/game/components/lateral/Lateral03EmailCompromise')
);
const Lateral04DataDiscovery = dynamic(
  () => import('@/components/game/components/lateral/Lateral04DataDiscovery')
);

// Objective components
const Objective01Ransomware = dynamic(
  () => import('@/components/game/components/objective/Objective01Ransomware')
);
const Objective02DataExfiltration = dynamic(
  () => import('@/components/game/components/objective/Objective02DataExfiltration')
);
const Objective03Bec = dynamic(
  () => import('@/components/game/components/objective/Objective03Bec')
);
const Objective04DoubleExtortion = dynamic(
  () => import('@/components/game/components/objective/Objective04DoubleExtortion')
);

const componentMap: Record<string, ComponentType<GameComponentProps>> = {
  // Recon phase
  recon_01: Recon01SnsRecon,
  recon_02: Recon02DumpsterDiving,
  recon_03: Recon03LeakSearch,
  recon_04: Recon04CorporateRecon,
  recon_05: Recon05Pretexting,
  // Access phase
  access_01: Access01PhishingEmail,
  access_02: Access02Smishing,
  access_03: Access03ShoulderSurfing,
  access_04: Access04EvilTwinWifi,
  access_05: Access05CredentialStuffing,
  access_06: Access06MalwareAttachment,
  // Lateral phase
  lateral_01: Lateral01PrivilegeEscalation,
  lateral_02: Lateral02LateralMovement,
  lateral_03: Lateral03EmailCompromise,
  lateral_04: Lateral04DataDiscovery,
  // Objective phase
  objective_01: Objective01Ransomware,
  objective_02: Objective02DataExfiltration,
  objective_03: Objective03Bec,
  objective_04: Objective04DoubleExtortion,
};

export function getGameComponent(
  componentId: string
): ComponentType<GameComponentProps> {
  return componentMap[componentId] ?? PlaceholderComponent;
}
