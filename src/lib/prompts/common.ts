import type { StoryContext, PhaseResult } from '@/types';

export function buildStoryContextPrompt(context: StoryContext): string {
  return `
## ストーリーコンテキスト
- 業界: ${context.industry}
- ターゲット組織: ${context.targetOrg}
- 組織の概要: ${context.targetDescription}
- 攻撃の最終目的: ${context.objective}
`.trim();
}

export function buildPhaseContextPrompt(previousResults: PhaseResult[]): string {
  if (previousResults.length === 0) {
    return '前フェーズの情報はありません（最初のフェーズです）。';
  }

  const entries = previousResults.map((r, i) => {
    const contextEntries = Object.entries(r.contextOutput)
      .map(([k, v]) => `  - ${k}: ${JSON.stringify(v)}`)
      .join('\n');
    return `### Phase ${i + 1} (${r.componentId}) - スコア: ${r.score}/100
発見した情報:
${contextEntries || '  （なし）'}`;
  });

  return `
## 前フェーズの成果
${entries.join('\n\n')}
`.trim();
}
