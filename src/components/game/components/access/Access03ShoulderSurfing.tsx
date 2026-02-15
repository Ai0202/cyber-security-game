'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface HiddenItem {
  id: string; label: string; value: string; points: number;
  x: number; y: number; found: boolean; type: 'password' | 'email' | 'personal' | 'business';
}

type Phase = 'loading' | 'intro' | 'playing' | 'done';
const TIME_LIMIT = 30;

const fallbackItems: HiddenItem[] = [
  { id: '1', type: 'password', label: 'パスワード付箋', value: 'Pass1234!', points: 30, x: 15, y: 25, found: false },
  { id: '2', type: 'email', label: 'メールアドレス', value: 'admin@sakura-hospital.jp', points: 20, x: 62, y: 38, found: false },
  { id: '3', type: 'personal', label: '患者リスト', value: '個人情報一覧が画面に表示', points: 20, x: 38, y: 65, found: false },
  { id: '4', type: 'business', label: '内部システムURL', value: 'https://intra.hospital-local/admin', points: 25, x: 78, y: 20, found: false },
];

export default function Access03ShoulderSurfing({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [items, setItems] = useState<HiddenItem[]>(fallbackItems);
  const [foundCount, setFoundCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentId, action: 'init', storyContext, previousResults }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled && data.items && Array.isArray(data.items)) {
          setItems(data.items.map((it: Partial<HiddenItem>, i: number) => ({
            ...fallbackItems[i % fallbackItems.length], ...it, id: String(i + 1), found: false,
          })));
        }
      } catch { /* use fallback */ }
      if (!cancelled) setPhase('intro');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); setPhase('done'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'done') return;
    const found = items.filter(i => i.found);
    const totalPoints = found.reduce((s, i) => s + i.points, 0);
    const timeBonus = timeLeft > 0 ? 10 : 0;
    const score = Math.min(100, Math.max(0, totalPoints + timeBonus));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';
    const ctx: Record<string, unknown> = {};
    found.forEach(i => {
      if (i.type === 'email') ctx.discoveredEmail = i.value;
      if (i.type === 'password') ctx.passwordHint = i.value;
      if (i.type === 'business') ctx.internalUrl = i.value;
    });
    onComplete({ score, rank, breakdown: [
      { category: 'パスワード発見', points: found.find(i => i.type === 'password') ? 30 : 0, maxPoints: 30, comment: found.find(i => i.type === 'password') ? '付箋のパスワードを発見' : '見逃し' },
      { category: 'メール発見', points: found.find(i => i.type === 'email') ? 20 : 0, maxPoints: 20, comment: found.find(i => i.type === 'email') ? 'メールアドレスを発見' : '見逃し' },
      { category: '機密情報発見', points: found.filter(i => ['personal', 'business'].includes(i.type)).length * 20, maxPoints: 45, comment: `${found.filter(i => ['personal', 'business'].includes(i.type)).length}件発見` },
      { category: '時間ボーナス', points: timeBonus, maxPoints: 10, comment: timeBonus > 0 ? `残り${timeLeft}秒` : 'タイムアップ' },
    ], contextOutput: ctx });
  }, [phase, items, timeLeft, onComplete]);

  const handleClick = useCallback((id: string) => {
    if (phase !== 'playing') return;
    setItems(prev => {
      const next = prev.map(i => i.id === id && !i.found ? { ...i, found: true } : i);
      const fc = next.filter(i => i.found).length;
      setFoundCount(fc);
      if (fc === next.length) setPhase('done');
      return next;
    });
  }, [phase]);

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">SHOULDER SURFING</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}のオフィスに潜入した。職員のPC画面やデスク周りから情報を盗み見ろ。</p>
            <p className="mb-6 text-xs text-gray-500">制限時間: {TIME_LIMIT}秒 / 光るポイントをタップして情報を収集</p>
            <CyberButton onClick={() => setPhase('playing')}>START</CyberButton>
          </motion.div>
        )}
        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 10 ? 'red' : 'cyan'}>{timeLeft}s</NeonBadge>
              <span className="font-mono text-xs text-gray-500">FOUND: {foundCount}/{items.length}</span>
            </div>
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-cyber-card">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-cyber-card">
                <div className="absolute bottom-[20%] left-[10%] h-[40%] w-[45%] rounded border border-white/5 bg-gray-800/50 p-2">
                  <div className="h-full rounded bg-blue-900/30"><p className="p-1 font-mono text-[8px] text-gray-500">電子カルテシステム</p></div>
                </div>
                <div className="absolute bottom-[25%] right-[15%] h-[30%] w-[15%] rounded border border-white/5 bg-gray-800/50" />
              </div>
              {items.map(item => (
                <motion.button key={item.id} onClick={() => handleClick(item.id)} disabled={item.found || phase === 'done'}
                  animate={item.found ? { scale: 1.2, opacity: 0.5 } : { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={item.found ? {} : { duration: 2, repeat: Infinity }}
                  className={`absolute h-8 w-8 rounded-full border-2 ${item.found ? 'border-cyber-green bg-cyber-green/20' : 'border-cyber-cyan/50 bg-cyber-cyan/10'}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}>
                  {item.found && <span className="text-xs text-cyber-green">&#10003;</span>}
                </motion.button>
              ))}
            </div>
            <div className="space-y-1">
              {items.filter(i => i.found).map(item => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 rounded bg-cyber-card/50 px-3 py-1.5 text-xs">
                  <NeonBadge color={item.type === 'password' ? 'red' : item.type === 'email' ? 'cyan' : 'green'}>+{item.points}</NeonBadge>
                  <span className="text-gray-400">{item.label}:</span>
                  <span className="font-mono text-white">{item.value}</span>
                </motion.div>
              ))}
            </div>
            {phase === 'done' && (
              <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
