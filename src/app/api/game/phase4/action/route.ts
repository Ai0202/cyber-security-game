import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { getDefenderReaction } from "@/lib/ai-service";
import { RansomwareActionRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: RansomwareActionRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  addActionLog(body.sessionId, { phase: 4, action: body.action, detail: JSON.stringify(body.targetNodes ?? []) });

  if (body.action === "encrypt") {
    const stealthCost = body.speed === "fast" ? 15 : 5;
    decreaseStealth(body.sessionId, stealthCost);
    const targetNodes = body.targetNodes ?? [];
    const updated = getSession(body.sessionId)!;
    const newEncrypted = [...new Set([...updated.compromisedNodes, ...targetNodes])];
    updateSession(body.sessionId, { compromisedNodes: newEncrypted });
    const defenderReaction = await getDefenderReaction("backup", body.action, session.detectionLevel);
    return NextResponse.json({ success: true, message: `${targetNodes.length}ノードを暗号化しました`, encryptedNodes: newEncrypted, stealth: getSession(body.sessionId)!.stealth, defenderReaction: defenderReaction.message, backupStatus: session.backupDisabled ? "disabled" : "active" });
  }

  if (body.action === "ransom") {
    updateSession(body.sessionId, { phaseResults: { ...session.phaseResults, 4: { completed: true, score: session.stealth, details: {} } } });
    return NextResponse.json({ success: true, message: "ランサムウェア展開完了。ゲーム終了です。", encryptedNodes: session.compromisedNodes, stealth: session.stealth, defenderReaction: "", backupStatus: session.backupDisabled ? "disabled" : "active" });
  }

  return NextResponse.json({ success: false, message: "不明なアクション", encryptedNodes: [], stealth: session.stealth, defenderReaction: "", backupStatus: "active" });
}
