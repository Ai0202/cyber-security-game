'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/contexts/GameContext';
import SessionReport from '@/components/result/SessionReport';

export default function ResultPage() {
  const router = useRouter();
  const { session } = useGame();

  useEffect(() => {
    if (!session || session.status !== 'completed') {
      router.replace('/');
    }
  }, [session, router]);

  if (!session || session.status !== 'completed') {
    return null;
  }

  return <SessionReport />;
}
