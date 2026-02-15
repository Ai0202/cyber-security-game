'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface DataSample { id: string; name: string; impact: 'critical' | 'high' | 'medium'; selected: boolean; }
type Phase = 'loading' | 'intro' | 'encrypt' | 'leak-select' | 'threat' | 'done';

const fallbackFiles = ['患者情報DB.sql', '会計システム.db', 'backup_daily.tar.gz', '電子カルテ_2024.dat'];
const fallbackSamples: DataSample[] = [
  { id: '1', name: '患者記録サンプル (500件)', impact: 'critical', selected: false },
  { id: '2', name: '財務サマリー (直近3年)', impact: 'high', selected: false },
  { id: '3', name: '従業員マイナンバー一覧', impact: 'critical', selected: false },
  { id: '4', name: 'CEO メール履歴', impact: 'high', selected: false },
  { id: '5', name: 'セキュリティ監査レポート', impact: 'medium', selected: false },
  { id: '6', name: '取引先契約書', impact: 'medium', selected: false },
];

function toRank(s: number) { return s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const; }

export default function Objective04DoubleExtortion({ storyContext, previousContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [encFiles, setEncFiles] = useState<string[]>([]);
  const [encProgress, setEncProgress] = useState(0);
  const [samples, setSamples] = useState<DataSample[]>(fallbackSamples);
  const [threat, setThreat] = useState('');
  const [ransomAmt, setRansomAmt] = useState('');
  const [deadline, setDeadline] = useState('72');

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
        if (!cancelled) {
          if (data.samples?.length) setSamples(data.samples.map((s: { name: string; impact: string }, i: number) => ({
            id: String(i + 1), name: s.name, impact: (['critical', 'high', 'medium'].includes(s.impact) ? s.impact : 'medium') as DataSample['impact'], selected: false,
          })));
          if (data.files?.length) setEncFiles(data.files);
        }
      } catch { /* fallback */ }
      if (!cancelled) {
        const prev = previousContext.encryptedFiles;
        if (Array.isArray(prev) && prev.length) setEncFiles(prev as string[]);
        else setEncFiles(fallbackFiles);
        setPhase('intro');
      }
    })();
    return () => { cancelled = true; };
  }, [storyContext, previousContext, phaseId, componentId, previousResults]);

  // Encryption auto-animation
  useEffect(() => {
    if (phase !== 'encrypt') return;
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.floor(100 / encFiles.length);
      if (pct >= 100) { pct = 100; clearInterval(iv); setTimeout(() => setPhase('leak-select'), 600); }
      setEncProgress(pct);
    }, 500);
    return () => clearInterval(iv);
  }, [phase, encFiles.length]);

  const selectedSamples = samples.filter(s => s.selected);
  const toggleSample = (id: string) => {
    setSamples(prev => {
      const target = prev.find(s => s.id === id);
      if (!target) return prev;
      const currentCount = prev.filter(s => s.selected).length;
      if (!target.selected && currentCount >= 3) return prev;
      return prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s);
    });
  };

  const handleSubmit = () => {
    setPhase('done');
    const crit = selectedSamples.filter(s => s.impact === 'critical').length;
    const high = selectedSamples.filter(s => s.impact === 'high').length;
    const sampleScore = Math.min(25, crit * 10 + high * 6 + selectedSamples.length * 2);
    const tWords = ['公開', 'リーク', '報道', 'メディア', '規制当局', '罰金', '信用', 'データ'];
    const tHits = tWords.filter(w => threat.includes(w)).length;
    const threatScore = Math.min(25, tHits * 4 + (threat.length > 50 ? 8 : threat.length > 20 ? 4 : 0));
    const numAmt = parseInt(ransomAmt.replace(/[^0-9]/g, ''), 10) || 0;
    const dlH = parseInt(deadline, 10) || 0;
    const amtOk = numAmt >= 10000000 && numAmt <= 500000000;
    const realismScore = (amtOk ? 15 : numAmt > 0 ? 8 : 3) + (dlH >= 24 && dlH <= 168 ? 10 : dlH > 0 ? 5 : 2);
    const pressureScore = Math.min(25, Math.floor((sampleScore + threatScore + realismScore) / 3) + (selectedSamples.length >= 2 ? 8 : 3));
    const score = Math.max(0, Math.min(100, sampleScore + threatScore + realismScore + pressureScore));
    onComplete({ score, rank: toRank(score), breakdown: [
      { category: 'サンプル選択戦略', points: sampleScore, maxPoints: 25, comment: `重要度高: ${crit + high}件選択` },
      { category: '脅迫文の効果', points: threatScore, maxPoints: 25, comment: `${tHits}個の威圧表現を使用` },
      { category: '金額・期限の現実性', points: realismScore, maxPoints: 25, comment: amtOk ? '現実的な金額設定' : '金額に改善余地あり' },
      { category: '総合的な圧力', points: pressureScore, maxPoints: 25, comment: score >= 70 ? '強い圧力を構築' : '圧力が不十分' },
    ], contextOutput: {
      encryptedFiles: encFiles, leakedSamples: selectedSamples.map(s => s.name),
      ransomDemand: { amount: ransomAmt, deadline: `${deadline}時間`, message: threat },
    } });
  };

  if (phase === 'loading') return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
    </div>
  );

  const impactColor = (i: string) => i === 'critical' ? 'red' : i === 'high' ? 'yellow' : 'cyan';

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-red-400">DOUBLE EXTORTION</h2>
            <p className="mb-2 text-sm text-gray-400">暗号化とデータリークの二重脅迫を実行せよ。</p>
            <p className="mb-6 text-xs text-cyber-magenta/70">ファイル暗号化に加え、盗んだデータの公開を脅しに使え。</p>
            <CyberButton onClick={() => setPhase('encrypt')} variant="danger">BEGIN ENCRYPTION</CyberButton>
          </motion.div>
        )}
        {phase === 'encrypt' && (
          <motion.div key="encrypt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-8">
            <h2 className="mb-4 text-center font-mono text-xs tracking-widest text-red-400">ENCRYPTING FILES...</h2>
            <div className="mb-4 space-y-1">
              {encFiles.map((name, i) => (
                <motion.div key={i} initial={{ opacity: 0.3 }}
                  animate={{ opacity: encProgress >= ((i + 1) / encFiles.length) * 100 ? 1 : 0.3 }}
                  className="flex items-center gap-2 rounded bg-cyber-card/50 px-3 py-1.5">
                  <span className="text-sm">{encProgress >= ((i + 1) / encFiles.length) * 100 ? '\u{1F512}' : '\u{1F4C4}'}</span>
                  <span className="font-mono text-xs text-gray-400">{name}</span>
                </motion.div>
              ))}
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-gray-700">
              <motion.div className="h-full bg-red-400" animate={{ width: `${encProgress}%` }} />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-red-400">{encProgress}%</p>
          </motion.div>
        )}
        {phase === 'leak-select' && (
          <motion.div key="leak-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">LEAK SITE SAMPLES</h2>
            <p className="mb-1 text-sm text-gray-400">リークサイトに公開するサンプルデータを選択せよ</p>
            <p className="mb-4 text-xs text-gray-500">2-3件選択可能 ({selectedSamples.length}/3)</p>
            <div className="mb-4 space-y-2">
              {samples.map(sample => (
                <motion.button key={sample.id} onClick={() => toggleSample(sample.id)} whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded border p-3 text-left ${sample.selected ? 'border-red-400/50 bg-red-400/10' : 'border-white/5 bg-cyber-card/50'}`}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-white">{sample.name}</p>
                  </div>
                  <NeonBadge color={impactColor(sample.impact)}>{sample.impact.toUpperCase()}</NeonBadge>
                </motion.button>
              ))}
            </div>
            <CyberButton onClick={() => setPhase('threat')} variant="danger" className="w-full" disabled={selectedSamples.length < 2}>脅迫文を作成</CyberButton>
          </motion.div>
        )}
        {phase === 'threat' && (
          <motion.div key="threat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">THREAT MESSAGE</h2>
            <p className="mb-4 text-sm text-gray-400">暗号化 + データリークの二重脅迫メッセージを作成せよ</p>
            <div className="mb-3 rounded border border-red-400/20 bg-cyber-card p-3">
              <p className="font-mono text-xs text-gray-500">暗号化: {encFiles.length}ファイル / 公開予定: {selectedSamples.map(s => s.name).join(', ')}</p>
            </div>
            <div className="space-y-3">
              <div><label className="mb-1 block font-mono text-xs text-gray-500">脅迫メッセージ</label>
                <textarea value={threat} onChange={e => setThreat(e.target.value)} rows={5}
                  placeholder="貴社のデータは暗号化され、機密情報のコピーを入手しました..."
                  className="w-full rounded border border-red-400/20 bg-black px-3 py-2 font-mono text-sm text-red-300 placeholder-red-900 focus:border-red-400/50 focus:outline-none" /></div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="mb-1 block font-mono text-xs text-gray-500">身代金額</label>
                  <input type="text" value={ransomAmt} onChange={e => setRansomAmt(e.target.value)} placeholder="例: 1億円"
                    className="w-full rounded border border-red-400/20 bg-black px-3 py-2 font-mono text-sm text-red-300 placeholder-red-900 focus:border-red-400/50 focus:outline-none" /></div>
                <div className="w-28"><label className="mb-1 block font-mono text-xs text-gray-500">期限(時間)</label>
                  <input type="number" value={deadline} onChange={e => setDeadline(e.target.value)} min={1}
                    className="w-full rounded border border-red-400/20 bg-black px-3 py-2 font-mono text-sm text-red-300 focus:border-red-400/50 focus:outline-none" /></div>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <CyberButton onClick={() => setPhase('leak-select')} variant="secondary" className="flex-1">BACK</CyberButton>
              <CyberButton onClick={handleSubmit} variant="danger" className="flex-1" disabled={!threat.trim() || !ransomAmt.trim()}>EXECUTE</CyberButton>
            </div>
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
            <NeonBadge color="green">MISSION COMPLETE</NeonBadge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
