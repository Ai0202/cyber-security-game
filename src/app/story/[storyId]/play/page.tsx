'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import GameContainer from '@/components/game/GameContainer';

export default function PlayPage() {
  const router = useRouter();
  const params = useParams<{ storyId: string }>();
  const { session } = useGame();

  useEffect(() => {
    if (!session || session.storyId !== params.storyId) {
      router.replace(`/story/${params.storyId}`);
    }
  }, [session, params.storyId, router]);

  if (!session || session.storyId !== params.storyId) {
    return null;
  }

  return <GameContainer />;
}
