import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateContent, parseJsonResponse } from '@/lib/gemini';
import {
  buildStoryContextPrompt,
  buildPhaseContextPrompt,
} from '@/lib/prompts/common';
import {
  buildShoulderHackingSystemPrompt,
  buildShoulderHackingInitPrompt,
} from '@/lib/prompts/shoulder-hacking';
import {
  buildPasswordCrackingSystemPrompt,
  buildPasswordCrackingInitPrompt,
} from '@/lib/prompts/password-cracking';
import {
  buildPhishingSystemPrompt,
  buildPhishingInitPrompt,
} from '@/lib/prompts/phishing';
import {
  buildNetworkIntrusionSystemPrompt,
  buildNetworkIntrusionInitPrompt,
} from '@/lib/prompts/network-intrusion';
import {
  buildRansomwareSystemPrompt,
  buildRansomwareInitPrompt,
} from '@/lib/prompts/ransomware';
import {
  buildGenericSystemPrompt,
  buildGenericInitPrompt,
} from '@/lib/prompts/generic';
import type { StoryContext, PhaseResult } from '@/types';

const storyContextSchema = z.object({
  industry: z.string(),
  targetOrg: z.string(),
  targetDescription: z.string(),
  objective: z.string(),
});

const requestSchema = z.object({
  componentId: z.string(),
  action: z.union([z.literal('init'), z.record(z.unknown())]),
  storyContext: storyContextSchema,
  previousResults: z.array(z.unknown()).optional(),
});

type InitPromptBuilder = {
  system: (ctx: StoryContext) => string;
  user: () => string;
};

// Map new component IDs to specific prompt builders (adapted from old components)
const initPromptBuilders: Record<string, InitPromptBuilder> = {
  access_03: {
    system: buildShoulderHackingSystemPrompt,
    user: buildShoulderHackingInitPrompt,
  },
  access_05: {
    system: buildPasswordCrackingSystemPrompt,
    user: buildPasswordCrackingInitPrompt,
  },
  access_01: {
    system: buildPhishingSystemPrompt,
    user: buildPhishingInitPrompt,
  },
  lateral_01: {
    system: buildNetworkIntrusionSystemPrompt,
    user: buildNetworkIntrusionInitPrompt,
  },
  objective_01: {
    system: buildRansomwareSystemPrompt,
    user: buildRansomwareInitPrompt,
  },
};

async function handleInitAction(
  componentId: string,
  storyContext: StoryContext,
) {
  const builder = initPromptBuilders[componentId];

  // Use specific prompts if available, otherwise use generic
  const systemPrompt = builder
    ? builder.system(storyContext)
    : buildGenericSystemPrompt(componentId, storyContext);
  const userPrompt = builder
    ? builder.user()
    : buildGenericInitPrompt(componentId);

  const response = await generateContent(systemPrompt, userPrompt);
  const result = parseJsonResponse(response);

  return NextResponse.json(result);
}

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

    // Handle init action for scenario generation
    if (parsed.action === 'init') {
      return await handleInitAction(parsed.componentId, storyContext);
    }

    // Handle regular game actions
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
