import { NextResponse } from "next/server";
import { getSession } from "@/lib/game-session";
import { generateFinalReport } from "@/lib/ai-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const report = await generateFinalReport(session.actionLog, session.stealth, session.phaseResults);
  return NextResponse.json({ ...report, stealth: session.stealth });
}
