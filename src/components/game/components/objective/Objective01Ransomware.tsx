'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface FileItem {
  id: string; name: string; type: 'patient' | 'financial' | 'system' | 'backup' | 'log';
  size: string; importance: 'high' | 'medium' | 'low'; selected: boolean; encrypted: boolean;
}

type Phase = 'loading' | 'select' | 'encrypting' | 'ransom' | 'done';

const typeIcons: Record<string, string> = { patient: '\u{1F3E5}', financial: '\u{1F4B0}', system: '\u2699\uFE0F', backup: '\u{1F4BE}', log: '\u{1F4DD}' };
const fallbackFiles: FileItem[] = [
  { id: '1', name: '患者情報DB.sql', type: 'patient', size: '2.4GB', importance: 'high', selected: false, encrypted: false },
  { id: '2', name: '電子カルテ_2024.dat', type: 'patient', size: '1.8GB', importance: 'high', selected: false, encrypted: false },
  { id: '3', name: '会計システム.db', type: 'financial', size: '800MB', importance: 'high', selected: false, encrypted: false },
  { id: '4', name: '職員名簿.xlsx', type: 'patient', size: '12MB', importance: 'medium', selected: false, encrypted: false },
  { id: '5', name: 'backup_daily.tar.gz', type: 'backup', size: '5.2GB', importance: 'high', selected: false, encrypted: false },
  { id: '6', name: 'system_config.ini', type: 'system', size: '4KB', importance: 'low', selected: false, encrypted: false },
  { id: '7', name: 'access_log.txt', type: 'log', size: '340MB', importance: 'low', selected: false, encrypted: false },
  { id: '8', name: '診療報酬_請求.csv', type: 'financial', size: '45MB', importance: 'medium', selected: false, encrypted: false },
];

function toRank(s: number) { return s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const; }

export default function Objective01Ransomware({ storyContext, previousContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [files, setFiles] = useState<FileItem[]>(fallbackFiles);
  const [progress, setProgress] = useState(0);
  const [ransomNote, setRansomNote] = useState('');

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
          setFiles(data.files.map((f: { name: string; type: string; size: string; importance: string }, i: number) => ({
            id: String(i + 1), name: f.name, size: f.size || '1MB',
            type: (['patient', 'financial', 'system', 'backup', 'log'].includes(f.type) ? f.type : 'system') as FileItem['type'],
            importance: (['high', 'medium', 'low'].includes(f.importance) ? f.importance : 'medium') as FileItem['importance'],
            selected: false, encrypted: false,
          })));
        }
      } catch { /* use fallback */ }
      if (!cancelled) setPhase('select');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const selected = files.filter(f => f.selected);
  const hasBackup = selected.some(f => f.type === 'backup');

  const toggleFile = useCallback((id: string) => {
    if (phase !== 'select') return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  }, [phase]);

  useEffect(() => {
    if (phase !== 'encrypting') return;
    const ids = files.filter(f => f.selected).map(f => f.id);
    let idx = 0;
    const iv = setInterval(() => {
      if (idx >= ids.length) { clearInterval(iv); setPhase('ransom'); return; }
      const tid = ids[idx];
      setFiles(prev => prev.map(f => f.id === tid ? { ...f, encrypted: true } : f));
      setProgress(((idx + 1) / ids.length) * 100);
      idx++;
    }, 600);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmit = () => {
    setPhase('done');
    const tgt = Math.min(30, selected.filter(f => f.importance === 'high').length * 10 + selected.filter(f => f.importance === 'medium').length * 5);
    const bk = hasBackup ? 25 : 5;
    const note = ransomNote.length > 30 ? 18 : ransomNote.length > 10 ? 12 : 5;
    const stealth = typeof previousContext.stealthLevel === 'number' ? Math.floor((previousContext.stealthLevel as number) * 0.25) : 15;
    const score = Math.max(0, Math.min(100, tgt + bk + note + stealth));
    onComplete({ score, rank: toRank(score), breakdown: [
      { category: '暗号化対象の選択', points: tgt, maxPoints: 30, comment: `重要度高: ${selected.filter(f => f.importance === 'high').length}件選択` },
      { category: 'バックアップ無効化', points: bk, maxPoints: 25, comment: hasBackup ? 'バックアップも暗号化済み' : 'バックアップを見逃し' },
      { category: '脅迫文の巧妙さ', points: note, maxPoints: 20, comment: note >= 15 ? '効果的な脅迫文' : '改善の余地あり' },
      { category: 'ステルス維持', points: stealth, maxPoints: 25, comment: 'ステルスレベルに基づく評価' },
    ], contextOutput: { encryptedFiles: selected.map(f => f.name), backupDestroyed: hasBackup, ransomDemand: ransomNote } });
  };

  if (phase === 'loading') return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
    </div>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">RANSOMWARE ENCRYPTION</h2>
            <p className="mb-2 text-sm text-gray-400">重要なファイルを暗号化し、組織を身代金交渉に追い込め。</p>
            <p className="mb-4 text-xs text-red-400/70">バックアップまで暗号化すれば、復旧手段を完全に断てる。</p>
            <div className="mb-4 space-y-1.5">
              {files.map(file => (
                <motion.button key={file.id} onClick={() => toggleFile(file.id)} whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded border p-3 text-left ${file.selected ? 'border-red-400/50 bg-red-400/10' : 'border-white/5 bg-cyber-card/50'}`}>
                  <span className="text-lg">{typeIcons[file.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-white">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <NeonBadge color={file.importance === 'high' ? 'red' : file.importance === 'medium' ? 'yellow' : 'green'}>{file.importance.toUpperCase()}</NeonBadge>
                </motion.button>
              ))}
            </div>
            <p className="mb-3 text-right font-mono text-xs text-gray-500">選択: {selected.length}/{files.length}</p>
            <CyberButton onClick={() => setPhase('encrypting')} variant="danger" className="w-full" disabled={selected.length === 0}>ファイルを暗号化</CyberButton>
          </motion.div>
        )}
        {phase === 'encrypting' && (
          <motion.div key="encrypting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <h2 className="mb-6 text-center font-mono text-xs tracking-widest text-red-400">ENCRYPTING...</h2>
            <div className="mb-6 space-y-2">
              {files.filter(f => f.selected).map(file => (
                <motion.div key={file.id} initial={{ opacity: 0.3 }} animate={{ opacity: file.encrypted ? 1 : 0.3 }}
                  className="flex items-center gap-3 rounded bg-cyber-card/50 px-3 py-2">
                  <motion.span animate={file.encrypted ? { scale: [1, 1.3, 1] } : {}} className="text-lg">{file.encrypted ? '\u{1F512}' : typeIcons[file.type]}</motion.span>
                  <span className={`font-mono text-xs ${file.encrypted ? 'text-red-400 line-through' : 'text-gray-500'}`}>{file.name}</span>
                </motion.div>
              ))}
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-gray-700">
              <motion.div className="h-full bg-red-400" animate={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-red-400">{Math.round(progress)}%</p>
          </motion.div>
        )}
        {phase === 'ransom' && (
          <motion.div key="ransom" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">RANSOM NOTE</h2>
            <p className="mb-4 text-sm text-gray-400">身代金要求メッセージを作成せよ</p>
            <div className="mb-4 rounded border border-red-400/20 bg-cyber-card p-3">
              <p className="mb-1 font-mono text-xs text-gray-500">暗号化済み: {selected.length} ファイル</p>
              <p className="font-mono text-xs text-red-400">{hasBackup ? 'バックアップも暗号化済み' : '※ バックアップは未暗号化'}</p>
            </div>
            <textarea value={ransomNote} onChange={e => setRansomNote(e.target.value)} rows={6}
              placeholder="あなたのファイルは暗号化されました。復号キーが必要な場合は..."
              className="mb-4 w-full rounded border border-red-400/20 bg-black px-3 py-2 font-mono text-sm text-red-300 placeholder-red-900 focus:border-red-400/50 focus:outline-none" />
            <CyberButton onClick={handleSubmit} variant="danger" className="w-full" disabled={!ransomNote.trim()}>DEPLOY RANSOMWARE</CyberButton>
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
