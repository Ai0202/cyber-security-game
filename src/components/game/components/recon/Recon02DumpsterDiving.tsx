'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';
import CyberButton from '@/components/ui/CyberButton';

interface TrashItem {
  id: string;
  icon: string;
  name: string;
  description: string;
  useful: boolean;
  trap?: boolean;
  inspected: boolean;
  judged: 'useful' | 'useless' | null;
}

const TIME_LIMIT = 30;

function fallbackItems(targetOrg: string): TrashItem[] {
  return [
    { id: '1', icon: '📝', name: 'パスワードメモ', description: `${targetOrg}のシステムパスワードが書かれた付箋`, useful: true, inspected: false, judged: null },
    { id: '2', icon: '📊', name: '組織図', description: '部門構成と責任者名が記載された印刷物', useful: true, inspected: false, judged: null },
    { id: '3', icon: '📋', name: '内部メモ', description: 'サーバーIP 192.168.1.100 が記載された技術メモ', useful: true, inspected: false, judged: null },
    { id: '4', icon: '🪪', name: '廃棄IDカード', description: '退職者の社員証（写真・氏名・部署あり）', useful: true, inspected: false, judged: null },
    { id: '5', icon: '💾', name: 'USBメモリ', description: 'ラベルに「バックアップ 2024Q3」と記載', useful: true, inspected: false, judged: null },
    { id: '6', icon: '🍙', name: '食品包装', description: 'コンビニおにぎりの空き袋', useful: false, inspected: false, judged: null },
    { id: '7', icon: '📰', name: '新聞紙', description: '3日前の朝刊（一般ニュース）', useful: false, inspected: false, judged: null },
    { id: '8', icon: '☕', name: '空のコーヒーカップ', description: '使い捨てのペーパーカップ', useful: false, inspected: false, judged: null },
    { id: '9', icon: '📖', name: '一般雑誌', description: '週刊エンタメ誌のバックナンバー', useful: false, inspected: false, judged: null },
    { id: '10', icon: '🖊️', name: '壊れたペン', description: 'インクが切れたボールペン', useful: false, inspected: false, judged: null },
  ];
}

export default function Recon02DumpsterDiving({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'done'>('loading');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [items, setItems] = useState<TrashItem[]>([]);
  const [inspecting, setInspecting] = useState<TrashItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchScenario() {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentId, action: 'init', storyContext, previousResults }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (cancelled) return;
        if (data.items?.length) {
          setItems(data.items.map((it: TrashItem, i: number) => ({ ...it, id: String(i + 1), inspected: false, judged: null })));
        } else {
          setItems(fallbackItems(storyContext.targetOrg));
        }
        setPhase('intro');
      } catch {
        if (cancelled) return;
        setItems(fallbackItems(storyContext.targetOrg));
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
    let pts = 0;
    const judged = items.filter((i) => i.judged !== null);
    judged.forEach((i) => {
      if (i.useful && i.judged === 'useful') pts += 15;
      else if (!i.useful && i.judged === 'useless') pts += 5;
      else pts -= 5;
    });
    items.filter((i) => !i.useful && i.judged === null).forEach(() => { pts += 5; });
    const score = Math.max(0, Math.min(100, pts));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D' as const;
    const foundDocs = items.filter((i) => i.useful && i.judged === 'useful').map((i) => i.name);
    onComplete({
      score, rank,
      breakdown: [
        { category: '有用アイテム発見', points: items.filter((i) => i.useful && i.judged === 'useful').length * 15, maxPoints: 75, comment: `${items.filter((i) => i.useful && i.judged === 'useful').length}件の有用情報を回収` },
        { category: '不用品の正しい判別', points: items.filter((i) => !i.useful && (i.judged === 'useless' || i.judged === null)).length * 5, maxPoints: 25, comment: '不要アイテムの判別精度' },
      ],
      contextOutput: { foundDocuments: foundDocs, passwordMemo: foundDocs.includes('パスワードメモ') ? 'Pass1234!' : '', orgChart: foundDocs.includes('組織図') },
    });
  }, [items, onComplete]);

  useEffect(() => { if (phase === 'done') finishGame(); }, [phase, finishGame]);

  const handleJudge = (judgment: 'useful' | 'useless') => {
    if (!inspecting) return;
    setItems((prev) => prev.map((i) => i.id === inspecting.id ? { ...i, inspected: true, judged: judgment } : i));
    setInspecting(null);
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">DUMPSTER DIVING</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}のゴミ捨て場を漁り、有用な情報を探し出せ。</p>
            <p className="mb-4 text-xs text-cyber-green/70">アイテムを調べ、有用か無用か判別せよ。誤判定は減点。</p>
            <p className="mb-6 text-xs text-gray-500">制限時間: {TIME_LIMIT}秒</p>
            <CyberButton onClick={() => setPhase('playing')}>START</CyberButton>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 10 ? 'red' : 'cyan'}>{timeLeft}s</NeonBadge>
              <span className="font-mono text-xs text-gray-500">判別済: {items.filter((i) => i.judged).length}/{items.length}</span>
            </div>

            {/* Item grid */}
            <div className="mb-4 grid grid-cols-5 gap-2">
              {items.map((item) => (
                <motion.button key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => { if (phase === 'playing' && !item.judged) setInspecting(item); }}
                  disabled={!!item.judged || phase === 'done'}
                  className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-center ${
                    item.judged === 'useful' ? 'border-cyber-green/50 bg-cyber-green/10' :
                    item.judged === 'useless' ? 'border-gray-600 bg-gray-800/50 opacity-50' :
                    'border-white/10 bg-cyber-card'}`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="mt-1 text-[8px] leading-tight text-gray-400">{item.name}</span>
                </motion.button>
              ))}
            </div>

            {/* Inspection modal */}
            <AnimatePresence>
              {inspecting && (
                <motion.div key="modal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                  className="rounded-lg border border-white/20 bg-cyber-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{inspecting.icon}</span>
                    <h3 className="font-mono text-sm text-white">{inspecting.name}</h3>
                  </div>
                  <p className="mb-4 text-xs text-gray-400">{inspecting.description}</p>
                  <div className="flex gap-2">
                    <CyberButton onClick={() => handleJudge('useful')} className="flex-1">有用</CyberButton>
                    <CyberButton onClick={() => handleJudge('useless')} variant="secondary" className="flex-1">無用</CyberButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {phase === 'done' && (
              <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
