import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateContent, parseJsonResponse } from '@/lib/gemini';
import {
  buildStoryContextPrompt,
  buildPhaseContextPrompt,
} from '@/lib/prompts/common';
import type { StoryContext, PhaseResult } from '@/types';

const requestSchema = z.object({
  componentId: z.string(),
  action: z.record(z.unknown()),
  storyContext: z.object({
    industry: z.string(),
    targetOrg: z.string(),
    targetDescription: z.string(),
    objective: z.string(),
  }),
  previousResults: z.array(z.unknown()).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  const { phaseId } = await params;

  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const storyContext = parsed.storyContext as StoryContext;
    const previousResults = (parsed.previousResults ?? []) as PhaseResult[];

    const systemPrompt = `あなたはサイバーセキュリティ教育ゲーム「CyberGuardians」のゲームマスターです。
プレイヤーは攻撃者側を体験して防御を学びます。
フェーズ: ${phaseId}
コンポーネント: ${parsed.componentId}

${buildStoryContextPrompt(storyContext)}

${buildPhaseContextPrompt(previousResults)}

レスポンスは必ず JSON 形式で返してください。`;

    const userPrompt = `プレイヤーのアクション: ${JSON.stringify(parsed.action)}

上記のアクションに対する結果を以下の JSON 形式で返してください:
{
  "success": boolean,
  "narrative": "ストーリー形式での結果説明（日本語）",
  "discoveredInfo": { "key": "value" },
  "score": number (0-100),
  "feedback": "プレイヤーへのフィードバック（日本語）"
}`;

    const response = await generateContent(systemPrompt, userPrompt);
    const result = parseJsonResponse(response);

    return NextResponse.json(result);
  } catch (error) {
    // Gemini API が利用できない場合のフォールバック
    if (
      error instanceof Error &&
      (error.message.includes('GEMINI_API_KEY') ||
        error.message.includes('fetch'))
    ) {
      return NextResponse.json({
        success: true,
        narrative:
          'システムへのアクセスに成功しました。（フォールバックレスポンス）',
        discoveredInfo: {},
        score: 50,
        feedback: 'Gemini API が設定されていないため、デフォルトの結果を返しています。',
      });
    }

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
