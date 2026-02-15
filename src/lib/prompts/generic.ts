import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';
import { getComponent } from '@/lib/data';

export function buildGenericSystemPrompt(
  componentId: string,
  context: StoryContext
): string {
  const comp = getComponent(componentId);
  const name = comp?.displayName ?? componentId;
  const desc = comp?.description ?? '';
  const attackerAction = comp?.attacker_action ?? '';
  const vulnerability = comp?.vulnerability ?? '';

  return `あなたはサイバーセキュリティ教育ゲーム「CyberGuardians」の「${name}」シナリオを管理するAIです。

${buildStoryContextPrompt(context)}

コンポーネント概要: ${desc}
攻撃者の行動: ${attackerAction}
脆弱性: ${vulnerability}

プレイヤーは攻撃者としてこの攻撃手法を体験します。
あなたの役割はストーリーコンテキストに合わせたリアルなシナリオデータを生成することです。

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildGenericInitPrompt(componentId: string): string {
  const comp = getComponent(componentId);
  const phaseId = comp?.phaseId ?? 'recon';

  const prompts: Record<string, string> = {
    recon: `偵察フェーズのシナリオデータを生成してください。以下の JSON 形式で返してください:
{
  "scenario": {
    "description": "シチュエーションの説明（日本語、2-3文）",
    "target": "ターゲットの情報"
  },
  "items": [
    { "id": "item1", "label": "アイテム名", "value": "内容", "type": "useful" | "noise" | "trap", "points": number }
  ],
  "hints": ["ヒント1", "ヒント2"]
}`,
    access: `初期侵入フェーズのシナリオデータを生成してください。以下の JSON 形式で返してください:
{
  "target": {
    "name": "ターゲットのフルネーム",
    "position": "役職",
    "department": "部署",
    "email": "メールアドレス",
    "traits": ["特徴1", "特徴2"]
  },
  "scenario": {
    "description": "シチュエーションの説明（日本語、2-3文）"
  },
  "hints": ["ヒント1", "ヒント2"]
}`,
    lateral: `横展開フェーズのシナリオデータを生成してください。以下の JSON 形式で返してください:
{
  "network": {
    "description": "ネットワーク構成の説明",
    "nodes": [
      { "id": "node1", "name": "ノード名", "type": "workstation" | "server" | "admin", "services": ["サービス名"] }
    ]
  },
  "scenario": {
    "description": "シチュエーションの説明（日本語、2-3文）"
  }
}`,
    objective: `目的実行フェーズのシナリオデータを生成してください。以下の JSON 形式で返してください:
{
  "files": ["ファイル名1", "ファイル名2"],
  "scenario": {
    "description": "シチュエーションの説明（日本語、2-3文）",
    "criticalAssets": ["重要資産1", "重要資産2"]
  }
}`,
  };

  return prompts[phaseId] ?? prompts.recon;
}
