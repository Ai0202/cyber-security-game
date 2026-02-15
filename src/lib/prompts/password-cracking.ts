import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';

export function buildPasswordCrackingSystemPrompt(
  context: StoryContext
): string {
  return `あなたはサイバーセキュリティ教育ゲーム「せきゅトレ」のパスワードクラッキングシナリオを管理するAIです。

${buildStoryContextPrompt(context)}

プレイヤーは攻撃者としてターゲットのパスワードを推測します。
あなたの役割は:
1. ターゲットのSNSプロフィール情報の生成
2. パスワード候補の生成（プロフィールから推測可能なもの）

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildPasswordCrackingInitPrompt(): string {
  return `ターゲットのSNSプロフィールと正解パスワードを生成してください:
{
  "profile": {
    "name": "ターゲットの名前",
    "birthday": "YYYY-MM-DD",
    "petName": "ペットの名前",
    "hobby": "趣味",
    "favoriteTeam": "好きなスポーツチーム",
    "partnerName": "パートナーの名前",
    "hometown": "出身地"
  },
  "passwords": [
    { "password": "正解パスワード1", "reason": "推測理由", "difficulty": "easy" },
    { "password": "正解パスワード2", "reason": "推測理由", "difficulty": "medium" },
    { "password": "正解パスワード3", "reason": "推測理由", "difficulty": "hard" }
  ]
}`;
}
