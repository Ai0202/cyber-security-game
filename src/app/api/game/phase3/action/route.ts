import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { getDefenderReaction } from "@/lib/ai-service";
import { NETWORK_NODES } from "@/lib/scenarios";
import { NetworkActionRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: NetworkActionRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  addActionLog(body.sessionId, { phase: 3, action: body.action, detail: `Node: ${body.nodeId}` });

  const node = NETWORK_NODES[body.nodeId as keyof typeof NETWORK_NODES];
  if (!node) return NextResponse.json({ success: false, message: "ノードが見つかりません", discoveredNodes: [], filesFound: [], stealth: session.stealth });
  if (node.hidden && !session.discoveredNodes.includes(body.nodeId)) return NextResponse.json({ success: false, message: "まだ発見されていないノードです", discoveredNodes: [], filesFound: [], stealth: session.stealth });

  let newDiscovered: string[] = [];
  let filesFound: string[] = [];

  if (body.action === "scan") {
    decreaseStealth(body.sessionId, 3);
    if (body.nodeId === "pc_tanaka" && !session.discoveredNodes.includes("admin_pc")) {
      newDiscovered = ["admin_pc"];
      const u = getSession(body.sessionId)!;
      updateSession(body.sessionId, { discoveredNodes: [...u.discoveredNodes, "admin_pc"] });
    }
  } else if (body.action === "access") {
    decreaseStealth(body.sessionId, 5);
    filesFound = node.files;
    if (body.nodeId === "admin_pc" && !session.discoveredNodes.includes("backup_server")) {
      newDiscovered = ["backup_server"];
      const u = getSession(body.sessionId)!;
      updateSession(body.sessionId, { discoveredNodes: [...u.discoveredNodes, "backup_server"], hasAdmin: true });
    }
  } else if (body.action === "exploit") {
    decreaseStealth(body.sessionId, 10);
    if (!session.compromisedNodes.includes(body.nodeId)) {
      const u = getSession(body.sessionId)!;
      updateSession(body.sessionId, { compromisedNodes: [...u.compromisedNodes, body.nodeId] });
    }
    if (session.compromisedNodes.length >= 3) {
      updateSession(body.sessionId, { currentPhase: 4, phaseResults: { ...session.phaseResults, 3: { completed: true, score: 70, details: {} } } });
    }
  }

  const defenderReaction = await getDefenderReaction("mamoru", body.action, session.detectionLevel);
  const finalSession = getSession(body.sessionId)!;
  return NextResponse.json({ success: true, message: `${body.action}を実行しました`, discoveredNodes: newDiscovered, filesFound, stealth: finalSession.stealth, defenderReaction: defenderReaction.message });
}
