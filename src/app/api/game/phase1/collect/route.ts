import { NextResponse } from "next/server";
import { getSession, addClue, addActionLog } from "@/lib/game-session";
import { TARGET_PROFILE } from "@/lib/scenarios";
import { CollectClueRequest } from "@/lib/types";

const CLUE_MAP: Record<string, { type: string; description: string }> = {
  post1: { type: "pet_name", description: "ペットの名前: ポチ" },
  post2: { type: "birth_year", description: "生年: 1985年" },
  post3: { type: "email_domain", description: "メールドメイン: mail.cyberco.jp" },
  post4: { type: "password_habit", description: "覚えやすいパスワードを好む" },
  post5: { type: "boss_name", description: "上司: 鈴木部長" },
};

export async function POST(request: Request) {
  const body: CollectClueRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  const post = TARGET_PROFILE.snsPosts.find((p) => p.id === body.postId);
  if (!post || !post.hasClue) {
    return NextResponse.json({ success: false, clueType: "", clueDescription: "手がかりは見つかりませんでした", totalClues: session.collectedClues.length });
  }

  const clueInfo = CLUE_MAP[body.postId];
  if (!clueInfo) {
    return NextResponse.json({ success: false, clueType: "", clueDescription: "手がかりは見つかりませんでした", totalClues: session.collectedClues.length });
  }

  addClue(body.sessionId, { id: body.postId, ...clueInfo });
  addActionLog(body.sessionId, { phase: 1, action: "collect", detail: clueInfo.description });

  const updated = getSession(body.sessionId)!;
  return NextResponse.json({ success: true, clueType: clueInfo.type, clueDescription: clueInfo.description, totalClues: updated.collectedClues.length });
}
