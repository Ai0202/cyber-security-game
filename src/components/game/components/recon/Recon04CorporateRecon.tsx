'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';
import CyberButton from '@/components/ui/CyberButton';

interface InfoItem { id: string; text: string; category: 'tech' | 'personnel' | 'system'; collected: boolean }
interface TabData { id: string; label: string; content: string; items: InfoItem[] }

function fallbackTabs(targetOrg: string): TabData[] {
  return [
    { id: 'about', label: '会社概要', content: `${targetOrg}は地域医療を支える中核病院です。最新のIT技術を活用し、電子カルテシステムを全面導入しています。`, items: [
      { id: 'a1', text: 'Windows Server 2019で電子カルテを運用', category: 'tech', collected: false },
      { id: 'a2', text: '情報システム部長: 山田一郎', category: 'personnel', collected: false },
    ]},
    { id: 'recruit', label: '採用情報', content: '情報システム部でインフラエンジニアを募集中。Oracle DBの運用経験者歓迎。AWS経験も可。', items: [
      { id: 'r1', text: 'Oracle DB を使用中', category: 'tech', collected: false },
      { id: 'r2', text: 'AWS環境も併用', category: 'system', collected: false },
    ]},
    { id: 'press', label: 'プレスリリース', content: '2024年10月: VPN機器の脆弱性に対応するため、全社的なセキュリティパッチを適用。新システム移行を2025年度に予定。', items: [
      { id: 'p1', text: 'VPN機器に脆弱性があった（対応済み報告）', category: 'system', collected: false },
      { id: 'p2', text: 'システム管理者: 鈴木健太（プレスリリース署名）', category: 'personnel', collected: false },
    ]},
  ];
}

export default function Recon04CorporateRecon({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'done'>('loading');
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState('about');

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
        if (data.tabs?.length) {
          setTabs(data.tabs.map((t: TabData) => ({ ...t, items: t.items.map((it: InfoItem) => ({ ...it, collected: false })) })));
        } else {
          setTabs(fallbackTabs(storyContext.targetOrg));
        }
        setPhase('intro');
      } catch {
        if (cancelled) return;
        setTabs(fallbackTabs(storyContext.targetOrg));
        setPhase('intro');
      }
    }
    fetchScenario();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const allItems = tabs.flatMap((t) => t.items);
  const collectedCount = allItems.filter((i) => i.collected).length;

  const finishGame = useCallback(() => {
    const found = allItems.filter((i) => i.collected);
    const pts = Math.min(90, found.length * 15);
    const coverageBonus = new Set(found.map((i) => i.category)).size >= 3 ? 10 : 0;
    const score = Math.max(0, Math.min(100, pts + coverageBonus));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D' as const;
    onComplete({
      score, rank,
      breakdown: [
        { category: '情報収集', points: pts, maxPoints: 90, comment: `${found.length}件の情報を収集` },
        { category: 'カバレッジボーナス', points: coverageBonus, maxPoints: 10, comment: coverageBonus > 0 ? '全カテゴリの情報を収集' : '一部カテゴリが未収集' },
      ],
      contextOutput: {
        techStack: found.filter((i) => i.category === 'tech').map((i) => i.text),
        keyPersonnel: found.filter((i) => i.category === 'personnel').map((i) => i.text),
        systemInfo: found.filter((i) => i.category === 'system').map((i) => i.text),
      },
    });
  }, [allItems, onComplete]);

  const handleCollect = (tabId: string, itemId: string) => {
    setTabs((prev) => prev.map((t) => t.id === tabId ? { ...t, items: t.items.map((i) => i.id === itemId ? { ...i, collected: true } : i) } : t));
  };

  const handleFinish = () => setPhase('done');
  useEffect(() => { if (phase === 'done') finishGame(); }, [phase, finishGame]);

  const currentTab = tabs.find((t) => t.id === activeTab);
  const catColor = (c: string) => c === 'tech' ? 'cyan' : c === 'personnel' ? 'magenta' : 'green';
  const catLabel = (c: string) => c === 'tech' ? 'TECH' : c === 'personnel' ? 'PERSON' : 'SYSTEM';

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
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">CORPORATE WEBSITE RECON</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}の公式サイトと求人情報から技術情報・人物情報を収集せよ。</p>
            <p className="mb-4 text-xs text-cyber-green/70">各タブを閲覧し、有用な情報をクリックして収集する。</p>
            <p className="mb-6 text-xs text-gray-500">全{allItems.length}件の情報が隠されている</p>
            <CyberButton onClick={() => setPhase('playing')}>START</CyberButton>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color="cyan">RECON</NeonBadge>
              <span className="font-mono text-xs text-gray-500">COLLECTED: {collectedCount}/{allItems.length}</span>
            </div>

            {/* Tab nav */}
            <div className="mb-3 flex gap-1 rounded-lg border border-white/10 bg-black p-1">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 rounded px-2 py-1.5 font-mono text-[10px] transition-colors ${activeTab === t.id ? 'bg-cyber-card text-cyber-cyan' : 'text-gray-500 hover:text-gray-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {currentTab && (
              <motion.div key={currentTab.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-white/10 bg-cyber-card p-4">
                <p className="mb-4 text-xs leading-relaxed text-gray-400">{currentTab.content}</p>
                <div className="space-y-2">
                  {currentTab.items.map((item) => (
                    <motion.button key={item.id} onClick={() => handleCollect(currentTab.id, item.id)}
                      disabled={item.collected || phase === 'done'}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      animate={!item.collected ? { boxShadow: ['0 0 0px #00d4ff', '0 0 6px #00d4ff', '0 0 0px #00d4ff'] } : {}}
                      transition={!item.collected ? { duration: 1.5, repeat: Infinity } : {}}
                      className={`w-full rounded border px-3 py-2 text-left text-xs ${item.collected ? 'border-cyber-green/40 bg-cyber-green/10' : 'border-white/10 bg-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <NeonBadge color={catColor(item.category) as 'cyan' | 'magenta' | 'green'}>{catLabel(item.category)}</NeonBadge>
                        <span className={item.collected ? 'text-cyber-green' : 'text-gray-300'}>{item.text}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'playing' && (
              <div className="mt-4 text-center">
                <CyberButton onClick={handleFinish} variant="secondary">調査完了</CyberButton>
              </div>
            )}
            {phase === 'done' && (
              <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
