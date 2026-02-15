export function buildStoryGenerationSystemPrompt(): string {
  return `あなたはサイバーセキュリティ教育ゲームのシナリオライターです。
プレイヤーが攻撃者側を体験することで、実践的なセキュリティリテラシーを身につけるゲームです。

与えられた攻撃コンポーネントの組み合わせに合った、リアルで教育的なストーリーコンテキストを生成してください。

以下の制約を守ってください:
- 実在の組織名は使わない
- 日本の組織を想定する
- 業界は多様に（医療、金融、製造、小売、教育、自治体、IT企業など）
- ターゲット組織の規模やIT体制も具体的に設定する
- 目的は攻撃コンポーネントの内容と整合させる

レスポンスは必ずJSON形式で返してください。`;
}

export function buildStoryGenerationUserPrompt(
  components: Array<{
    id: string;
    name: string;
    description: string;
    phaseId: string;
  }>
): string {
  const componentList = components
    .map(
      (c) =>
        `- [${c.phaseId}] ${c.name} (${c.id}): ${c.description}`
    )
    .join('\n');

  return `以下の攻撃コンポーネントの組み合わせに合ったストーリーコンテキストを生成してください。

攻撃チェーン:
${componentList}

以下のJSON形式で回答してください:
{
  "industry": "業界名（例: 医療、金融、製造）",
  "targetOrg": "架空の組織名（日本語）",
  "targetDescription": "組織の説明（規模、IT体制、特徴を含む。2-3文）",
  "objective": "攻撃の最終目的（1文）"
}`;
}
