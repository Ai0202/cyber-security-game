// ========== キャラクター ==========
export interface Character {
  name: string;
  role: string;
  emoji: string;
  color: string;
  desc: string;
}

export type CharacterMap = Record<string, Character>;

// ========== ステージ ==========
export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  mode: "attack" | "defense";
  color: string;
}

// ========== パスワードデモ ==========
export interface PasswordEntry {
  value: string;
  time: string;
  strength: number;
  label: string;
}

// ========== ゲームセッション ==========
export interface GameSession {
  id: string;
  currentPhase: 1 | 2 | 3 | 4;
  stealth: number;
  collectedClues: Clue[];
  discoveredNodes: string[];
  compromisedNodes: string[];
  hasAdmin: boolean;
  backupDisabled: boolean;
  passwordAttempts: number;
  detectionLevel: number;
  actionLog: ActionLogEntry[];
  phaseResults: Partial<Record<number, PhaseResult>>;
}

export interface Clue {
  id: string;
  type: string;
  description: string;
}

export interface ActionLogEntry {
  phase: number;
  action: string;
  detail: string;
  timestamp: number;
  stealth: number;
}

export interface PhaseResult {
  completed: boolean;
  score: number;
  details: Record<string, unknown>;
}

// ========== API リクエスト/レスポンス ==========
export interface ActionRequest {
  actionType: string;
  targetId?: string;
  inputValue?: string;
}

export interface CharacterReaction {
  character: string;
  reactionType: string;
  message: string;
  emoji: string;
}

export interface CollectClueRequest {
  sessionId: string;
  postId: string;
}

export interface CollectClueResponse {
  success: boolean;
  clueType: string;
  clueDescription: string;
  totalClues: number;
}

export interface PhishingEmailRequest {
  sessionId: string;
  subject: string;
  body: string;
  sender: string;
}

export interface PhishingEmailResponse {
  score: number;
  feedback: string;
  isSuccess: boolean;
  victimReaction: string;
  stealth: number;
}

export interface PasswordAttemptRequest {
  sessionId: string;
  password: string;
}

export interface PasswordAttemptResponse {
  success: boolean;
  message: string;
  attemptsRemaining: number;
  stealth: number;
  hint?: string;
  lockedOut: boolean;
}

export interface NetworkActionRequest {
  sessionId: string;
  action: "scan" | "access" | "exploit";
  nodeId: string;
}

export interface NetworkActionResponse {
  success: boolean;
  message: string;
  discoveredNodes: string[];
  filesFound: string[];
  stealth: number;
  defenderReaction?: string;
}

export interface RansomwareActionRequest {
  sessionId: string;
  action: "encrypt" | "ransom" | "exfiltrate";
  targetNodes?: string[];
  speed?: "fast" | "stealth";
  ransomMessage?: string;
}

export interface RansomwareActionResponse {
  success: boolean;
  message: string;
  encryptedNodes: string[];
  stealth: number;
  defenderReaction?: string;
  backupStatus: string;
}

export interface GameStartResponse {
  sessionId: string;
  phase: number;
  stealth: number;
  targetProfile: TargetProfile;
}

export interface TargetProfile {
  name: string;
  department: string;
  company: string;
  snsPosts: SnsPost[];
}

export interface SnsPost {
  id: string;
  content: string;
  image?: string;
  hasClue: boolean;
}

export interface FinalReport {
  rank: "S" | "A" | "B" | "C" | "D";
  summary: string;
  phaseFeedback: PhaseFeedback[];
  keyLearning: string[];
  stealth: number;
}

export interface PhaseFeedback {
  phase: number;
  title: string;
  score: number;
  feedback: string;
}
