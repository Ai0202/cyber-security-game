'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import GameContainer from '@/components/game/GameContainer';

export default function RandomPlayPage() {
  const router = useRouter();
  const { session } = useGame();

  useEffect(() => {
    if (!session || session.storyId !== 'random-mission') {
      router.replace('/');
    }
  }, [session, router]);

  if (!session || session.storyId !== 'random-mission') {
    return null;
  }

  return <GameContainer />;
}
