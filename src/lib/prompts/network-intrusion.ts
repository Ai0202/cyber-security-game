import type { StoryContext } from '@/types';
import { buildStoryContextPrompt } from './common';

export function buildNetworkIntrusionSystemPrompt(
  context: StoryContext
): string {
  return `あなたはサイバーセキュリティ教育ゲーム「CyberGuardians」のネットワーク侵入シナリオを管理するAIです。

${buildStoryContextPrompt(context)}

プレイヤーは攻撃者として企業ネットワークに侵入し、内部偵察・権限昇格を行います。
あなたの役割は:
1. ネットワーク構成の生成
2. 探索行動に対する結果の生成

レスポンスは必ず JSON 形式で返してください。`;
}

export function buildNetworkIntrusionInitPrompt(): string {
  return `企業ネットワーク構成を生成してください:
{
  "nodes": [
    {
      "id": "string",
      "name": "ノード名",
      "type": "workstation" | "server" | "firewall" | "router" | "admin",
      "os": "OS名",
      "services": ["サービス名"],
      "vulnerability": "脆弱性の説明（存在する場合）",
      "accessLevel": "user" | "admin" | "none"
    }
  ],
  "connections": [
    { "from": "nodeId", "to": "nodeId" }
  ]
}`;
}
