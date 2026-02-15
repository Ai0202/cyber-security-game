const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface CharacterReactionResult { message: string; emoji: string; type: string; }
interface PhishingEvalResult { score: number; feedback: string; isSuccess: boolean; victimReaction: string; }
interface PasswordHintResult { hint: string; closeness: number; }
interface DefenderReactionResult { message: string; action: string; detectionIncrease: number; }
interface FinalReportResult {
  rank: "S" | "A" | "B" | "C" | "D";
  summary: string;
  phaseFeedback: { phase: number; title: string; score: number; feedback: string }[];
  keyLearning: string[];
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function getCharacterReaction(character: string, _action: string): Promise<CharacterReactionResult> {
  const reactions: Record<string, CharacterReactionResult> = {
    mamoru: { message: "不審な通信を検知しました。アクセスログを確認します。", emoji: "🛡️", type: "alert" },
    passuwa: { message: "うぐぐ…そのパスワードは…強力すぎる…！", emoji: "🔑", type: "panicked" },
    mailer: { message: "わあ！素敵なメールが届いたよ！開いちゃおうかな？", emoji: "📧", type: "excited" },
  };
  return reactions[character] ?? { message: "...", emoji: "😐", type: "normal" };
}

export async function evaluatePhishing(subject: string, body: string, sender: string): Promise<PhishingEvalResult> {
  try {
    const response = await callGemini(
      `あなたはサイバーセキュリティの専門家です。以下のフィッシングメールを評価してください。
ターゲット: 田中太郎（経理部、サイバーコーポレーション）
件名: ${subject}
本文: ${body}
送信者: ${sender}
JSON形式で返してください: {"score": 0-100, "feedback": "フィードバック", "isSuccess": true/false, "victimReaction": "被害者の反応"}`
    );
    if (response) return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
  } catch { /* fallback */ }

  let score = 0;
  let feedback = "";
  if (subject.includes("緊急") || subject.includes("重要")) { score += 30; feedback += "緊急性を煽る件名は効果的です。 "; }
  if (body.includes("リンク") || body.includes("http")) { score += 40; feedback += "リンクへの誘導が自然です。 "; }
  return {
    score: Math.min(score, 100),
    feedback: feedback || "もう少し騙す要素を入れましょう。",
    isSuccess: score > 60,
    victimReaction: score > 60 ? "メーラがリンクをクリックしてしまいました..." : "メーラは怪しんでメールを閉じました。",
  };
}

export async function generatePasswordHint(attempts: string[], _correctPasswords: string[], clues: string[]): Promise<PasswordHintResult> {
  try {
    const response = await callGemini(
      `あなたはパスワードのヒントを出すAIです。正解は教えないでください。
過去の試行: ${attempts.join(", ")}
収集済みの手がかり: ${clues.join(", ")}
ヒントを1つ、JSON形式で: {"hint": "ヒント文", "closeness": 0-100}`
    );
    if (response) return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
  } catch { /* fallback */ }
  return { hint: "ペットの名前と数字の組み合わせを試してみては？", closeness: 30 };
}

export async function getDefenderReaction(_defender: string, _action: string, detectionLevel: number): Promise<DefenderReactionResult> {
  if (detectionLevel < 30) return { message: "...異常なし。", action: "none", detectionIncrease: 5 };
  if (detectionLevel < 60) return { message: "何か怪しい動きを感知しました。監視を強化します。", action: "alert", detectionIncrease: 10 };
  return { message: "侵入者を検知！セキュリティチームに通報します！", action: "lockdown", detectionIncrease: 20 };
}

export async function generateFinalReport(
  actionLog: { phase: number; action: string; detail: string }[],
  stealth: number,
  phaseResults: Record<string, unknown>,
): Promise<FinalReportResult> {
  try {
    const response = await callGemini(
      `あなたはサイバーセキュリティ教育の専門家です。以下のゲームプレイを分析してレポートを作成してください。
ステルス度: ${stealth}
アクションログ: ${JSON.stringify(actionLog)}
フェーズ結果: ${JSON.stringify(phaseResults)}
JSON形式で: {"rank": "S/A/B/C/D", "summary": "要約", "phaseFeedback": [{"phase": 1, "title": "偵察", "score": 0-100, "feedback": "..."}], "keyLearning": ["学び1", "学び2"]}`
    );
    if (response) return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
  } catch { /* fallback */ }

  const rank = stealth > 70 ? "A" : stealth > 40 ? "B" : "C";
  return {
    rank: rank as "A" | "B" | "C",
    summary: `ステルス度${stealth}%で攻撃を完了しました。`,
    phaseFeedback: [
      { phase: 1, title: "偵察 & フィッシング", score: 70, feedback: "情報収集は適切でした。" },
      { phase: 2, title: "パスワード突破", score: 60, feedback: "推測力が試されました。" },
      { phase: 3, title: "ネットワーク侵入", score: 65, feedback: "慎重な動きが求められます。" },
      { phase: 4, title: "ランサムウェア展開", score: 55, feedback: "バックアップの脅威を理解しましょう。" },
    ],
    keyLearning: [
      "SNSの個人情報は攻撃に悪用される",
      "強固なパスワードは最初の防御線",
      "ネットワーク監視は侵入検知に重要",
      "定期バックアップがランサムウェアの最大の対策",
    ],
  };
}
