import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';

export function buildShoulderHackingSystemPrompt(
  context: StoryContext
): string {
  return `あなたはサイバーセキュリティ教育ゲーム「CyberGuardians」のショルダーハッキングシナリオを管理するAIです。

${buildStoryContextPrompt(context)}

プレイヤーは攻撃者として、公共の場でターゲットの画面を覗き見して情報を収集します。
あなたの役割は:
1. シチュエーション（場所・画面内容）の生成
2. 発見すべき情報リストの生成

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildShoulderHackingInitPrompt(): string {
  return `以下の JSON 形式でシーンを生成してください:
{
  "scene": {
    "location": "場所の説明",
    "targetAction": "ターゲットが何をしているか",
    "timeOfDay": "時間帯"
  },
  "screens": [
    {
      "id": "screen1",
      "type": "pc" | "phone",
      "content": "画面に表示されている内容",
      "hiddenInfo": [
        { "type": "password" | "email" | "personal" | "business", "value": "情報の内容", "points": number }
      ]
    }
  ]
}`;
}
