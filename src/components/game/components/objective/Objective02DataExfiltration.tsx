'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface DataFile { id: string; name: string; size: string; value: 'high' | 'medium'; selected: boolean; }
interface ExfilMethod { id: string; name: string; speed: string; risk: string; riskLevel: number; }

type Phase = 'loading' | 'intro' | 'select-data' | 'select-method' | 'exfiltrating' | 'done';

const fallbackFiles: DataFile[] = [
  { id: '1', name: '患者情報DB', size: '2.4GB', value: 'high', selected: false },
  { id: '2', name: '給与データ', size: '500MB', value: 'high', selected: false },
  { id: '3', name: '新規事業計画', size: '50MB', value: 'medium', selected: false },
  { id: '4', name: 'パスワード一覧', size: '1MB', value: 'high', selected: false },
  { id: '5', name: '会計データ', size: '800MB', value: 'medium', selected: false },
];

const methods: ExfilMethod[] = [
  { id: 'cloud', name: 'クラウドストレージ', speed: '高速', risk: '検知リスク: 高', riskLevel: 80 },
  { id: 'usb', name: 'USB持ち出し', speed: '低速', risk: '検知リスク: 中', riskLevel: 50 },
  { id: 'email', name: '暗号化メール送信', speed: '中速', risk: '検知リスク: 低', riskLevel: 25 },
  { id: 'dns', name: 'DNS tunneling', speed: '超低速', risk: '検知リスク: 極低', riskLevel: 10 },
];

function toRank(s: number) { return s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const; }

export default function Objective02DataExfiltration({ storyContext, previousContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [files, setFiles] = useState<DataFile[]>(fallbackFiles);
  const [method, setMethod] = useState<ExfilMethod | null>(null);
  const [transferPct, setTransferPct] = useState(0);
  const [detectionLevel, setDetectionLevel] = useState(0);
  const [detected, setDetected] = useState(false);

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
        if (!cancelled && data.files?.length) {
          setFiles(data.files.map((f: { name: string; size: string; value: string }, i: number) => ({
            id: String(i + 1), name: f.name, size: f.size || '100MB',
            value: f.value === 'high' ? 'high' : 'medium', selected: false,
          })));
        }
      } catch { /* fallback */ }
      if (!cancelled) setPhase('intro');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const selected = files.filter(f => f.selected);

  // Transfer animation
  useEffect(() => {
    if (phase !== 'exfiltrating' || !method) return;
    let pct = 0;
    const risk = method.riskLevel;
    const iv = setInterval(() => {
      pct += 5;
      setTransferPct(pct);
      const noise = Math.random() * 15;
      const dl = Math.min(100, (pct / 100) * risk + noise);
      setDetectionLevel(dl);
      if (dl > 90) setDetected(true);
      if (pct >= 100) { clearInterval(iv); setPhase('done'); }
    }, 300);
    return () => clearInterval(iv);
  }, [phase, method]);

  // Submit on done
  useEffect(() => {
    if (phase !== 'done') return;
    const highCount = selected.filter(f => f.value === 'high').length;
    const dataVal = Math.min(35, highCount * 12 + selected.filter(f => f.value === 'medium').length * 7);
    const methodScore = method ? ({ dns: 25, email: 20, usb: 15, cloud: 8 }[method.id] ?? 10) : 5;
    const avoidance = detected ? 5 : detectionLevel < 30 ? 25 : detectionLevel < 60 ? 15 : 8;
    const volEff = selected.length >= 3 ? 15 : selected.length >= 2 ? 10 : 5;
    const score = Math.max(0, Math.min(100, dataVal + methodScore + avoidance + volEff));
    onComplete({ score, rank: toRank(score), breakdown: [
      { category: 'データの価値', points: dataVal, maxPoints: 35, comment: `高価値: ${highCount}件選択` },
      { category: '手法の適切さ', points: methodScore, maxPoints: 25, comment: method?.name ?? '不明' },
      { category: '検知回避', points: avoidance, maxPoints: 25, comment: detected ? '検知された' : '検知を回避' },
      { category: '持ち出し効率', points: volEff, maxPoints: 15, comment: `${selected.length}件を持ち出し` },
    ], contextOutput: { exfiltratedData: selected.map(f => f.name), exfilMethod: method?.id ?? '', detected } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'loading') return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">DATA EXFILTRATION</h2>
            <p className="mb-2 text-sm text-gray-400">侵入先から機密データを持ち出せ。</p>
            <p className="mb-6 text-xs text-cyber-green/70">検知されないよう、手法とデータ量を慎重に選べ。</p>
            <CyberButton onClick={() => setPhase('select-data')}>START OPERATION</CyberButton>
          </motion.div>
        )}
        {phase === 'select-data' && (
          <motion.div key="select-data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-cyan">SELECT TARGET DATA</h2>
            <p className="mb-4 text-sm text-gray-400">持ち出すデータを選択せよ</p>
            <div className="mb-4 space-y-2">
              {files.map(file => (
                <motion.button key={file.id} onClick={() => setFiles(prev => prev.map(f => f.id === file.id ? { ...f, selected: !f.selected } : f))}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded border p-3 text-left ${file.selected ? 'border-cyber-cyan/50 bg-cyber-cyan/10' : 'border-white/5 bg-cyber-card/50'}`}>
                  <span className="text-lg">{file.value === 'high' ? '\u{1F4CB}' : '\u{1F4C4}'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <NeonBadge color={file.value === 'high' ? 'red' : 'yellow'}>{file.value.toUpperCase()}</NeonBadge>
                </motion.button>
              ))}
            </div>
            <CyberButton onClick={() => setPhase('select-method')} className="w-full" disabled={selected.length === 0}>NEXT: 手法を選択</CyberButton>
          </motion.div>
        )}
        {phase === 'select-method' && (
          <motion.div key="select-method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-cyan">SELECT METHOD</h2>
            <p className="mb-4 text-sm text-gray-400">持ち出し手法を選択せよ</p>
            <div className="mb-4 space-y-2">
              {methods.map(m => (
                <motion.button key={m.id} onClick={() => setMethod(m)} whileTap={{ scale: 0.98 }}
                  className={`w-full rounded border p-3 text-left ${method?.id === m.id ? 'border-cyber-green/50 bg-cyber-green/10' : 'border-white/5 bg-cyber-card/50'}`}>
                  <p className="font-mono text-sm text-white">{m.name}</p>
                  <div className="mt-1 flex gap-3 text-xs">
                    <span className="text-gray-500">速度: {m.speed}</span>
                    <span className={m.riskLevel > 50 ? 'text-red-400' : 'text-cyber-green'}>{m.risk}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            <div className="flex gap-3">
              <CyberButton onClick={() => setPhase('select-data')} variant="secondary" className="flex-1">BACK</CyberButton>
              <CyberButton onClick={() => setPhase('exfiltrating')} variant="danger" className="flex-1" disabled={!method}>EXECUTE</CyberButton>
            </div>
          </motion.div>
        )}
        {phase === 'exfiltrating' && (
          <motion.div key="exfiltrating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <h2 className="mb-6 text-center font-mono text-xs tracking-widest text-cyber-cyan">EXFILTRATING DATA...</h2>
            <div className="mb-4">
              <p className="mb-1 font-mono text-xs text-gray-500">転送進捗</p>
              <div className="h-2 overflow-hidden rounded bg-gray-700">
                <motion.div className="h-full bg-cyber-cyan" animate={{ width: `${transferPct}%` }} />
              </div>
              <p className="mt-1 text-right font-mono text-xs text-cyber-cyan">{transferPct}%</p>
            </div>
            <div className="mb-4">
              <p className="mb-1 font-mono text-xs text-gray-500">検知リスク</p>
              <div className="h-2 overflow-hidden rounded bg-gray-700">
                <motion.div className={`h-full ${detectionLevel > 70 ? 'bg-red-400' : detectionLevel > 40 ? 'bg-yellow-400' : 'bg-cyber-green'}`}
                  animate={{ width: `${detectionLevel}%` }} />
              </div>
              {detected && <p className="mt-1 font-mono text-xs text-red-400">ALERT: 検知されました!</p>}
            </div>
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
            <NeonBadge color={detected ? 'red' : 'green'}>{detected ? 'DETECTED' : 'EXFILTRATION COMPLETE'}</NeonBadge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
