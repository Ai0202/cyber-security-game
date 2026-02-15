'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';
import CyberButton from '@/components/ui/CyberButton';

interface InfoPiece {
  id: string;
  label: string;
  value: string;
  key: string;
  points: number;
  found: boolean;
}

const TIME_LIMIT = 30;

function fallbackProfile(targetOrg: string): { name: string; bio: string; items: InfoPiece[] } {
  return {
    name: '佐藤花子',
    bio: `${targetOrg}勤務 / ヨガとカフェ巡りが趣味 / 愛猫モモと暮らしてます`,
    items: [
      { id: '1', label: '誕生日', value: '3月15日', key: 'birthday', points: 20, found: false },
      { id: '2', label: 'ペット名', value: 'モモ', key: 'petName', points: 20, found: false },
      { id: '3', label: '趣味', value: 'ヨガ', key: 'hobby', points: 15, found: false },
      { id: '4', label: '勤務先', value: targetOrg, key: 'company', points: 20, found: false },
      { id: '5', label: 'メール', value: 'h.sato@example.co.jp', key: 'email', points: 25, found: false },
    ],
  };
}

export default function Recon01SnsRecon({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'done'>('loading');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [profile, setProfile] = useState(fallbackProfile(storyContext.targetOrg));
  const [items, setItems] = useState<InfoPiece[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchScenario() {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentId, action: 'init', storyContext, previousResults }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (cancelled) return;
        if (data.profile?.items?.length) {
          setProfile({ name: data.profile.name, bio: data.profile.bio, items: data.profile.items.map((it: InfoPiece, i: number) => ({ ...it, id: String(i + 1), found: false })) });
          setItems(data.profile.items.map((it: InfoPiece, i: number) => ({ ...it, id: String(i + 1), found: false })));
        } else {
          const fb = fallbackProfile(storyContext.targetOrg);
          setItems(fb.items);
        }
        setPhase('intro');
      } catch {
        if (cancelled) return;
        const fb = fallbackProfile(storyContext.targetOrg);
        setProfile(fb);
        setItems(fb.items);
        setPhase('intro');
      }
    }
    fetchScenario();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); setPhase('done'); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const finishGame = useCallback(() => {
    const found = items.filter((i) => i.found);
    const pts = found.reduce((s, i) => s + i.points, 0);
    const timeBonus = timeLeft > 0 ? 10 : 0;
    const score = Math.max(0, Math.min(100, pts + timeBonus));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D' as const;
    const discovered: Record<string, string> = {};
    found.forEach((i) => { discovered[i.key] = i.value; });
    onComplete({
      score, rank,
      breakdown: [
        { category: '情報収集', points: pts, maxPoints: 100, comment: `${found.length}/${items.length}件の情報を発見` },
        { category: '時間ボーナス', points: timeBonus, maxPoints: 10, comment: timeBonus > 0 ? `残り${timeLeft}秒` : 'タイムアップ' },
      ],
      contextOutput: { discoveredInfo: discovered },
    });
  }, [items, timeLeft, onComplete]);

  useEffect(() => { if (phase === 'done') finishGame(); }, [phase, finishGame]);

  const handleTap = (id: string) => {
    if (phase !== 'playing') return;
    setItems((prev) => {
      const next = prev.map((it) => it.id === id && !it.found ? { ...it, found: true } : it);
      if (next.every((it) => it.found)) setPhase('done');
      return next;
    });
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">SOCIAL MEDIA RECON</h2>
            <p className="mb-2 text-sm text-gray-400">ターゲットのSNSプロフィールから個人情報を収集せよ。</p>
            <p className="mb-4 text-xs text-cyber-green/70">発見した情報はパスワード推測の手がかりになる。</p>
            <p className="mb-6 text-xs text-gray-500">制限時間: {TIME_LIMIT}秒 / 光っている情報をタップして収集</p>
            <CyberButton onClick={() => setPhase('playing')}>START</CyberButton>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 10 ? 'red' : 'cyan'}>{timeLeft}s</NeonBadge>
              <span className="font-mono text-xs text-gray-500">FOUND: {items.filter((i) => i.found).length}/{items.length}</span>
            </div>

            {/* SNS Profile Card */}
            <div className="mb-4 rounded-lg border border-white/10 bg-cyber-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyber-magenta to-cyber-cyan text-lg font-bold text-white">{profile.name.charAt(0)}</div>
                <div>
                  <p className="font-bold text-white">{profile.name}</p>
                  <p className="text-xs text-gray-500">@{profile.name.replace(/\s/g, '_').toLowerCase()}</p>
                </div>
              </div>
              <p className="mb-3 text-xs text-gray-400">{profile.bio}</p>

              {/* Info hotspots as "posts" */}
              <div className="space-y-2">
                {items.map((item) => (
                  <motion.button key={item.id} onClick={() => handleTap(item.id)} disabled={item.found || phase === 'done'}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    animate={item.found ? { opacity: 0.6 } : { boxShadow: ['0 0 0px #00d4ff', '0 0 8px #00d4ff', '0 0 0px #00d4ff'] }}
                    transition={item.found ? {} : { duration: 1.5, repeat: Infinity }}
                    className={`w-full rounded border px-3 py-2 text-left text-xs ${item.found ? 'border-cyber-green/40 bg-cyber-green/10' : 'border-white/10 bg-white/5'}`}>
                    <span className="text-gray-500">{item.label}: </span>
                    <span className={item.found ? 'font-mono text-cyber-green' : 'text-gray-300'}>{item.value}</span>
                    {item.found && <span className="ml-2 text-cyber-green">+{item.points}</span>}
                  </motion.button>
                ))}
              </div>
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
