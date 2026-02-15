import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';

export function buildPhishingSystemPrompt(context: StoryContext): string {
  return `あなたはサイバーセキュリティ教育ゲーム「せきゅトレ」のフィッシング攻撃シナリオを管理するAIです。

${buildStoryContextPrompt(context)}

プレイヤーは攻撃者としてフィッシングメールを作成します。
あなたの役割は:
1. ターゲット情報の生成（初期化時）
2. プレイヤーが作成したフィッシングメールの評価

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildPhishingInitPrompt(): string {
  return `ターゲット情報を生成してください。以下の JSON 形式で返してください:
{
  "target": {
    "name": "ターゲットのフルネーム",
    "position": "役職",
    "department": "部署",
    "email": "ターゲットのメールアドレス",
    "recentActivity": "最近の行動（出張、プロジェクト等）",
    "personality": "性格の特徴（慎重、忙しい等）"
  },
  "hints": ["ヒント1", "ヒント2", "ヒント3"]
}`;
}

export function buildPhishingEvalPrompt(email: {
  senderName: string;
  senderEmail: string;
  subject: string;
  body: string;
  linkUrl: string;
}): string {
  return `プレイヤーが作成したフィッシングメールを評価してください:

送信者名: ${email.senderName}
送信者アドレス: ${email.senderEmail}
件名: ${email.subject}
本文: ${email.body}
リンクURL: ${email.linkUrl}

以下の JSON 形式で評価を返してください:
{
  "reaction": "ターゲットの反応をストーリー形式で記述（日本語、2-3文）",
  "clicked": true/false（リンクをクリックしたか）,
  "scores": {
    "senderDisguise": { "points": 0-25, "comment": "送信者偽装の評価コメント" },
    "subjectUrgency": { "points": 0-25, "comment": "件名の評価コメント" },
    "bodyPersuasion": { "points": 0-30, "comment": "本文の評価コメント" },
    "linkDeception": { "points": 0-20, "comment": "URLの評価コメント" }
  },
  "defenseAdvice": "この攻撃に対する防御のアドバイス（日本語）"
}`;
}
