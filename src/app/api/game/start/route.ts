import { NextResponse } from "next/server";
import { createSession } from "@/lib/game-session";
import { TARGET_PROFILE } from "@/lib/scenarios";

export async function POST() {
  const session = createSession();
  return NextResponse.json({
    sessionId: session.id,
    phase: session.currentPhase,
    stealth: session.stealth,
    targetProfile: TARGET_PROFILE,
  });
}
