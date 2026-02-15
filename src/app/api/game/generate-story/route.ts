import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateContent, parseJsonResponse } from '@/lib/gemini';
import { getComponent } from '@/lib/data';
import {
  buildStoryGenerationSystemPrompt,
  buildStoryGenerationUserPrompt,
} from '@/lib/prompts/story-generation';

const requestSchema = z.object({
  componentChain: z.array(z.string()).length(4),
});

const fallbackContexts = [
  {
    industry: '金融',
    targetOrg: 'みらい銀行',
    targetDescription: '地方銀行。オンラインバンキングを5年前に導入。情報システム部は5名体制。',
    objective: '顧客の口座情報を窃取し、不正送金を実行する',
  },
  {
    industry: '製造',
    targetOrg: '東洋精密工業',
    targetDescription: '精密機器メーカー。工場のIoT化を推進中。ITセキュリティ専任者なし。',
    objective: '製品設計データを盗み出し、競合に売却する',
  },
  {
    industry: '教育',
    targetOrg: 'さくら大学',
    targetDescription: '私立大学。学生数8000名。学務システムをクラウド移行中。',
    objective: '学生・教職員の個人情報データベースを暗号化し身代金を要求する',
  },
  {
    industry: '小売',
    targetOrg: 'フレッシュマート',
    targetDescription: '全国展開のスーパーマーケットチェーン。ECサイトも運営。POSシステム2000台。',
    objective: '顧客のクレジットカード情報を大量に窃取する',
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { componentChain } = requestSchema.parse(body);

    const components = componentChain.map((id) => getComponent(id));
    if (components.some((c) => !c)) {
      return NextResponse.json(
        { error: 'Invalid component ID in chain' },
        { status: 400 }
      );
    }

    try {
      const systemPrompt = buildStoryGenerationSystemPrompt();
      const userPrompt = buildStoryGenerationUserPrompt(
        components.map((c) => ({
          id: c!.id,
          name: c!.name,
          description: c!.description,
          phaseId: c!.phaseId,
        }))
      );

      const response = await generateContent(systemPrompt, userPrompt);
      const context = parseJsonResponse<{
        industry: string;
        targetOrg: string;
        targetDescription: string;
        objective: string;
      }>(response);

      return NextResponse.json({ context });
    } catch {
      // Fallback to random preset context
      const fallback =
        fallbackContexts[Math.floor(Math.random() * fallbackContexts.length)];
      return NextResponse.json({ context: fallback });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
