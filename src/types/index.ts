// Phase IDs
export type PhaseId = 'recon' | 'credential' | 'intrusion' | 'objective';

// Difficulty levels
export type Difficulty = 'easy' | 'normal' | 'hard';

// Rank grades
export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

// Session status
export type SessionStatus = 'in_progress' | 'completed';

// --- Story definitions ---

export interface StoryContext {
  industry: string;
  targetOrg: string;
  targetDescription: string;
  objective: string;
}

export interface PhaseDefinition {
  phaseId: PhaseId;
  componentPool: string[];
  contextOverride?: Record<string, unknown>;
}

export interface StoryDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  context: StoryContext;
  phases: PhaseDefinition[];
}

// --- Component definitions ---

export interface ComponentDefinition {
  id: string;
  name: string;
  displayName: string;
  phaseId: PhaseId;
  description: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  learningPoints: string[];
}

// --- Phase metadata ---

export interface PhaseInfo {
  id: PhaseId;
  name: string;
  displayName: string;
  description: string;
  order: number;
}

// --- Game session state ---

export interface ScoreBreakdown {
  category: string;
  points: number;
  maxPoints: number;
  comment: string;
}

export interface PhaseResult {
  componentId: string;
  phaseId: PhaseId;
  score: number;
  rank: Rank;
  breakdown: ScoreBreakdown[];
  contextOutput: Record<string, unknown>;
  completedAt: Date;
}

export interface GameSession {
  id: string;
  storyId: string;
  selectedComponents: string[];
  storyContext: StoryContext;
  currentPhaseIndex: number;
  phaseResults: PhaseResult[];
  status: SessionStatus;
  startedAt: Date;
}
