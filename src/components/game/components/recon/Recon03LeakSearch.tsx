'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';
import CyberButton from '@/components/ui/CyberButton';

interface LeakEntry { email: string; password: string; service: string; year: number }

const TIME_LIMIT = 60;

function fallbackDb(targetOrg: string): LeakEntry[] {
  const domain = `${targetOrg.charAt(0).toLowerCase()}hospital.jp`;
  return [
    { email: `admin@${domain}`, password: 'adm!n2022', service: 'SocialApp', year: 2022 },
    { email: `admin@${domain}`, password: 'P@ssw0rd', service: 'CloudStorage', year: 2021 },
    { email: `tanaka@${domain}`, password: 'tanaka1985', service: 'ShoppingSite', year: 2023 },
    { email: `nurse01@${domain}`, password: 'nurse#01!', service: 'ForumSite', year: 2022 },
    { email: `yamada@${domain}`, password: 'yamada_pass', service: 'EmailService', year: 2020 },
  ];
}

export default function Recon03LeakSearch({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'done'>('loading');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [db, setDb] = useState<LeakEntry[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LeakEntry[]>([]);
  const [collected, setCollected] = useState<LeakEntry[]>([]);
  const [searchCount, setSearchCount] = useState(0);
  const [termLines, setTermLines] = useState<string[]>(['[SYSTEM] DarkLeaks DB v3.1 - 漏洩情報検索エンジン', '> 検索クエリを入力してください...']);

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
        if (data.leakDb?.length) { setDb(data.leakDb); } else { setDb(fallbackDb(storyContext.targetOrg)); }
        setPhase('intro');
      } catch {
        if (cancelled) return;
        setDb(fallbackDb(storyContext.targetOrg));
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
    const credPts = Math.min(80, collected.length * 20);
    const strategyBonus = searchCount >= 3 ? 20 : searchCount >= 2 ? 10 : 0;
    const score = Math.max(0, Math.min(100, credPts + strategyBonus));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D' as const;
    onComplete({
      score, rank,
      breakdown: [
        { category: '漏洩認証情報の発見', points: credPts, maxPoints: 80, comment: `${collected.length}件の認証情報を収集` },
        { category: '検索戦略ボーナス', points: strategyBonus, maxPoints: 20, comment: `${searchCount}種類のクエリを使用` },
      ],
      contextOutput: {
        leakedPasswords: collected.map((c) => c.password),
        leakedServices: collected.map((c) => c.service),
      },
    });
  }, [collected, searchCount, onComplete]);

  useEffect(() => { if (phase === 'done') finishGame(); }, [phase, finishGame]);

  const handleSearch = () => {
    if (!query.trim() || phase !== 'playing') return;
    setSearchCount((c) => c + 1);
    const q = query.trim().toLowerCase();
    const hits = db.filter((e) => e.email.toLowerCase().includes(q));
    setTermLines((prev) => [...prev, `> search "${query}"`, `[QUERY] 検索中...`, `[RESULT] ${hits.length}件ヒット`]);
    setResults(hits);
    setQuery('');
  };

  const handleCollect = (entry: LeakEntry) => {
    if (collected.some((c) => c.email === entry.email && c.service === entry.service)) return;
    setCollected((prev) => [...prev, entry]);
    setTermLines((prev) => [...prev, `[COLLECT] ${entry.email} / ${entry.service} を保存`]);
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
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-magenta">CREDENTIAL LEAK SEARCH</h2>
            <p className="mb-2 text-sm text-gray-400">ダークウェブの漏洩DBからターゲットの認証情報を検索せよ。</p>
            <p className="mb-4 text-xs text-cyber-green/70">メールアドレスを入力して漏洩パスワードを収集する。</p>
            <p className="mb-6 text-xs text-gray-500">制限時間: {TIME_LIMIT}秒 / 複数のクエリを試すとボーナス</p>
            <CyberButton variant="danger" onClick={() => setPhase('playing')}>START</CyberButton>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 15 ? 'red' : 'magenta'}>{timeLeft}s</NeonBadge>
              <span className="font-mono text-xs text-gray-500">COLLECTED: {collected.length}</span>
            </div>

            {/* Terminal */}
            <div className="mb-3 h-32 overflow-y-auto rounded-lg border border-white/10 bg-black p-2 font-mono text-[10px]">
              {termLines.map((line, i) => (
                <p key={i} className={line.includes('RESULT') ? 'text-cyber-green' : line.includes('COLLECT') ? 'text-cyber-cyan' : 'text-gray-500'}>{line}</p>
              ))}
            </div>

            {/* Search bar */}
            <div className="mb-3 flex gap-2">
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="メールアドレスを入力..."
                disabled={phase === 'done'}
                className="flex-1 rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-xs text-white placeholder-gray-600 focus:border-cyber-magenta/50 focus:outline-none" />
              <CyberButton onClick={handleSearch} variant="danger" disabled={phase === 'done'} className="px-4 py-2 text-xs">検索</CyberButton>
            </div>

            {/* Results */}
            <div className="space-y-2">
              {results.map((entry, i) => {
                const already = collected.some((c) => c.email === entry.email && c.service === entry.service);
                return (
                  <motion.div key={`${entry.email}-${entry.service}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded border border-white/10 bg-cyber-card px-3 py-2 text-xs">
                    <div>
                      <p className="font-mono text-cyber-green">{entry.email}</p>
                      <p className="text-gray-500">{entry.service} ({entry.year}) - {entry.password.slice(0, 3)}{'*'.repeat(5)}</p>
                    </div>
                    <button onClick={() => handleCollect(entry)} disabled={already || phase === 'done'}
                      className={`rounded px-2 py-1 font-mono text-[10px] ${already ? 'bg-gray-700 text-gray-500' : 'bg-cyber-magenta/20 text-cyber-magenta'}`}>
                      {already ? '保存済' : '収集'}
                    </button>
                  </motion.div>
                );
              })}
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
