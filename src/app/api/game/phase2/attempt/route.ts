import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { generatePasswordHint } from "@/lib/ai-service";
import { CORRECT_PASSWORDS } from "@/lib/scenarios";
import { PasswordAttemptRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: PasswordAttemptRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const maxAttempts = 5;
  const attempts = session.passwordAttempts + 1;
  updateSession(body.sessionId, { passwordAttempts: attempts });

  const isCorrect = CORRECT_PASSWORDS.includes(body.password);
  addActionLog(body.sessionId, { phase: 2, action: "password_attempt", detail: `Attempt: ${body.password}, Correct: ${isCorrect}` });

  if (isCorrect) {
    updateSession(body.sessionId, { currentPhase: 3, phaseResults: { ...session.phaseResults, 2: { completed: true, score: Math.max(100 - (attempts - 1) * 20, 20), details: {} } } });
    return NextResponse.json({ success: true, message: "パスワード突破成功！システムにアクセスしました。", attemptsRemaining: maxAttempts - attempts, stealth: session.stealth, lockedOut: false });
  }

  decreaseStealth(body.sessionId, 5);
  const updated = getSession(body.sessionId)!;

  if (attempts >= maxAttempts) {
    return NextResponse.json({ success: false, message: "アカウントがロックされました。", attemptsRemaining: 0, stealth: updated.stealth, lockedOut: true });
  }

  const clueDescriptions = session.collectedClues.map((c) => c.description);
  const hint = await generatePasswordHint([body.password], CORRECT_PASSWORDS, clueDescriptions);
  return NextResponse.json({ success: false, message: "パスワードが違います。", attemptsRemaining: maxAttempts - attempts, stealth: updated.stealth, hint: hint.hint, lockedOut: false });
}
