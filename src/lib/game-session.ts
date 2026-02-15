import { v4 as uuidv4 } from "uuid";
import { GameSession, Clue, ActionLogEntry } from "@/lib/types";

const sessions = new Map<string, GameSession>();

export function createSession(): GameSession {
  const session: GameSession = {
    id: uuidv4(),
    currentPhase: 1,
    stealth: 100,
    collectedClues: [],
    discoveredNodes: ["pc_tanaka", "file_server", "mail_server", "firewall"],
    compromisedNodes: [],
    hasAdmin: false,
    backupDisabled: false,
    passwordAttempts: 0,
    detectionLevel: 0,
    actionLog: [],
    phaseResults: {},
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<GameSession>): GameSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

export function addClue(sessionId: string, clue: Clue): GameSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  if (!session.collectedClues.find((c) => c.id === clue.id)) {
    session.collectedClues.push(clue);
  }
  sessions.set(sessionId, session);
  return session;
}

export function addActionLog(sessionId: string, entry: Omit<ActionLogEntry, "timestamp" | "stealth">): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.actionLog.push({ ...entry, timestamp: Date.now(), stealth: session.stealth });
  sessions.set(sessionId, session);
}

export function decreaseStealth(sessionId: string, amount: number): number {
  const session = sessions.get(sessionId);
  if (!session) return 0;
  session.stealth = Math.max(0, session.stealth - amount);
  sessions.set(sessionId, session);
  return session.stealth;
}
