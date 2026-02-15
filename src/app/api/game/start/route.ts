import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getStory } from '@/lib/data';
import { createSession } from '@/lib/session';

const requestSchema = z.object({
  storyId: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { storyId } = requestSchema.parse(body);

    const story = getStory(storyId);
    if (!story) {
      return NextResponse.json(
        { error: `Story not found: ${storyId}` },
        { status: 404 }
      );
    }

    const session = createSession(storyId);

    return NextResponse.json({
      sessionId: session.id,
      selectedComponents: session.selectedComponents,
      storyContext: session.storyContext,
    });
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
