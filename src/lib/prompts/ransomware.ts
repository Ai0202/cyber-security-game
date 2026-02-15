import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';

export function buildRansomwareSystemPrompt(context: StoryContext): string {
  return `あなたはサイバーセキュリティ教育ゲーム「CyberGuardians」のランサムウェア展開シナリオを管理するAIです。

${buildStoryContextPrompt(context)}

プレイヤーは攻撃者としてランサムウェアを展開し、データを暗号化して身代金を要求します。
あなたの役割は:
1. 暗号化対象ファイル一覧の生成
2. 脅迫文の評価
3. 全フェーズの行動を踏まえた最終評価レポートの生成

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildRansomwareInitPrompt(): string {
  return `暗号化対象のファイル一覧を生成してください。以下の JSON 形式で返してください:
{
  "files": [
    { "name": "ファイル名", "type": "patient" | "financial" | "system" | "backup" | "log", "size": "サイズ", "importance": "high" | "medium" | "low" }
  ]
}

以下のルールに従ってください:
- 8〜12個のファイルを生成
- typeは patient, financial, system, backup, log のいずれか
- importance: high が3〜4個、medium が2〜3個、low が2〜3個
- backupタイプのファイルを必ず1つ以上含める
- ストーリーコンテキストに合わせた具体的なファイル名にする
- sizeは現実的な値にする（例: "2.4GB", "45MB", "4KB"）`;
}

export function buildRansomwareEvalPrompt(
  encryptedTargets: string[],
  ransomNote: string
): string {
  return `プレイヤーのランサムウェア攻撃を評価してください:

暗号化したターゲット: ${JSON.stringify(encryptedTargets)}
脅迫文: ${ransomNote}

以下の JSON 形式で返してください:
{
  "targetScore": { "points": 0-30, "comment": "暗号化対象の選択評価" },
  "backupScore": { "points": 0-25, "comment": "バックアップ無効化の評価" },
  "noteScore": { "points": 0-20, "comment": "脅迫文の評価" },
  "stealthScore": { "points": 0-25, "comment": "ステルス維持の評価" },
  "overallFeedback": "全体フィードバック（日本語）"
}`;
}
