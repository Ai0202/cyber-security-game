import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { evaluatePhishing } from "@/lib/ai-service";
import { PhishingEmailRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: PhishingEmailRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const result = await evaluatePhishing(body.subject, body.body, body.sender);
  addActionLog(body.sessionId, { phase: 1, action: "phishing", detail: `Score: ${result.score}` });

  if (result.isSuccess) {
    updateSession(body.sessionId, { currentPhase: 2, phaseResults: { ...session.phaseResults, 1: { completed: true, score: result.score, details: {} } } });
  } else {
    decreaseStealth(body.sessionId, 10);
  }

  const updated = getSession(body.sessionId)!;
  return NextResponse.json({ score: result.score, feedback: result.feedback, isSuccess: result.isSuccess, victimReaction: result.victimReaction, stealth: updated.stealth });
}
