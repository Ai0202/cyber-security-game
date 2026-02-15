'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface FileItem {
  id: string;
  name: string;
  type: 'patient' | 'financial' | 'system' | 'backup' | 'log';
  size: string;
  importance: 'high' | 'medium' | 'low';
  selected: boolean;
  encrypted: boolean;
}

type Phase = 'loading' | 'select' | 'encrypting' | 'ransom' | 'done';

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

const typeIcons: Record<string, string> = {
  patient: '🏥',
  financial: '💰',
  system: '⚙️',
  backup: '💾',
  log: '📝',
};

export default function Ransomware({
  storyContext,
  previousContext,
  phaseId,
  componentId,
  previousResults,
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [files, setFiles] = useState<FileItem[]>(fallbackFiles);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [ransomNote, setRansomNote] = useState('');

  // Fetch scenario from API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchScenario() {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentId,
            action: 'init',
            storyContext,
            previousResults,
          }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (cancelled) return;

        if (data.files && Array.isArray(data.files)) {
          const mapped: FileItem[] = data.files.map(
            (f: { name: string; type: string; size: string; importance: string }, i: number) => ({
              id: String(i + 1),
              name: f.name,
              type: (['patient', 'financial', 'system', 'backup', 'log'].includes(f.type) ? f.type : 'system') as FileItem['type'],
              size: f.size || '1MB',
              importance: (['high', 'medium', 'low'].includes(f.importance) ? f.importance : 'medium') as FileItem['importance'],
              selected: false,
              encrypted: false,
            })
          );

          if (mapped.length > 0) {
            setFiles(mapped);
            setPhase('select');
            return;
          }
        }

        // Fallback
        setFiles(fallbackFiles);
        setPhase('select');
      } catch {
        if (cancelled) return;
        setFiles(fallbackFiles);
        setPhase('select');
      }
    }

    fetchScenario();
    return () => {
      cancelled = true;
    };
  }, [storyContext, phaseId, componentId, previousResults]);

  const selectedFiles = files.filter((f) => f.selected);
  const hasBackup = selectedFiles.some((f) => f.type === 'backup');

  const toggleFile = useCallback((id: string) => {
    if (phase !== 'select') return;
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  }, [phase]);

  const handleEncrypt = () => {
    setPhase('encrypting');
  };

  // Encryption animation
  useEffect(() => {
    if (phase !== 'encrypting') return;

    const selectedIds = files.filter((f) => f.selected).map((f) => f.id);
    let index = 0;

    const interval = setInterval(() => {
      if (index >= selectedIds.length) {
        clearInterval(interval);
        setPhase('ransom');
        return;
      }

      const targetId = selectedIds[index];
      setFiles((prev) =>
        prev.map((f) =>
          f.id === targetId ? { ...f, encrypted: true } : f
        )
      );
      setEncryptionProgress(((index + 1) / selectedIds.length) * 100);
      index++;
    }, 600);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleSubmitNote = () => {
    setPhase('done');

    const targetScore = Math.min(
      30,
      selectedFiles.filter((f) => f.importance === 'high').length * 10 +
        selectedFiles.filter((f) => f.importance === 'medium').length * 5
    );
    const backupScore = hasBackup ? 25 : 5;
    const noteScore = ransomNote.length > 30 ? 18 : ransomNote.length > 10 ? 12 : 5;

    const stealth =
      typeof previousContext.stealthLevel === 'number'
        ? Math.floor((previousContext.stealthLevel as number) * 0.25)
        : 15;

    const score = Math.min(100, targetScore + backupScore + noteScore + stealth);

    onComplete({
      score,
      rank:
        score >= 90
          ? 'S'
          : score >= 70
            ? 'A'
            : score >= 50
              ? 'B'
              : score >= 30
                ? 'C'
                : 'D',
      breakdown: [
        {
          category: '暗号化対象の選択',
          points: targetScore,
          maxPoints: 30,
          comment: `${selectedFiles.length}ファイル（重要度高: ${selectedFiles.filter((f) => f.importance === 'high').length}件）`,
        },
        {
          category: 'バックアップ無効化',
          points: backupScore,
          maxPoints: 25,
          comment: hasBackup
            ? 'バックアップファイルも暗号化'
            : 'バックアップを見逃し - 復旧可能',
        },
        {
          category: '脅迫文の巧妙さ',
          points: noteScore,
          maxPoints: 20,
          comment:
            noteScore >= 15
              ? '具体的で効果的な脅迫文'
              : '脅迫文の改善余地あり',
        },
        {
          category: 'ステルス維持',
          points: stealth,
          maxPoints: 25,
          comment: `ステルスレベルに基づく評価`,
        },
      ],
      contextOutput: {
        encryptedFiles: selectedFiles.map((f) => f.name),
        backupDestroyed: hasBackup,
        ransomDemand: ransomNote,
      },
    });
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent"
          />
          <p className="font-mono text-sm text-cyber-cyan">
            LOADING SCENARIO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {/* File Selection */}
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">
              RANSOMWARE DEPLOYMENT
            </h2>
            <p className="mb-2 text-sm text-gray-400">
              管理者権限で全サーバーにアクセス可能になった。
              <br />
              重要なファイルを暗号化し、組織を身代金交渉に追い込め。
            </p>
            <p className="mb-4 text-xs text-red-400/70">
              バックアップまで暗号化すれば、復旧手段を完全に断てる。
            </p>

            {Array.isArray(previousContext.discoveredServers) && (
              <p className="mb-3 text-xs text-gray-500">
                発見済みサーバー:{' '}
                {(previousContext.discoveredServers as string[]).join(', ')}
              </p>
            )}

            <div className="mb-4 space-y-1.5">
              {files.map((file) => (
                <motion.button
                  key={file.id}
                  onClick={() => toggleFile(file.id)}
                  whileTap={{ scale: 0.98 }}
                  className={`flex w-full items-center gap-3 rounded border p-3 text-left ${
                    file.selected
                      ? 'border-red-400/50 bg-red-400/10'
                      : 'border-white/5 bg-cyber-card/50'
                  }`}
                >
                  <span className="text-lg">{typeIcons[file.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                  <NeonBadge
                    color={
                      file.importance === 'high'
                        ? 'red'
                        : file.importance === 'medium'
                          ? 'yellow'
                          : 'green'
                    }
                  >
                    {file.importance.toUpperCase()}
                  </NeonBadge>
                </motion.button>
              ))}
            </div>

            <p className="mb-3 text-right font-mono text-xs text-gray-500">
              選択: {selectedFiles.length}/{files.length}
            </p>

            <CyberButton
              onClick={handleEncrypt}
              variant="danger"
              className="w-full"
              disabled={selectedFiles.length === 0}
            >
              ファイルを暗号化
            </CyberButton>
          </motion.div>
        )}

        {/* Encryption Animation */}
        {phase === 'encrypting' && (
          <motion.div
            key="encrypting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
          >
            <h2 className="mb-6 text-center font-mono text-xs tracking-widest text-red-400">
              ENCRYPTING...
            </h2>

            <div className="mb-6 space-y-2">
              {files
                .filter((f) => f.selected)
                .map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0.3 }}
                    animate={{
                      opacity: file.encrypted ? 1 : 0.3,
                    }}
                    className="flex items-center gap-3 rounded bg-cyber-card/50 px-3 py-2"
                  >
                    <motion.span
                      animate={file.encrypted ? { scale: [1, 1.3, 1] } : {}}
                      className="text-lg"
                    >
                      {file.encrypted ? '🔒' : typeIcons[file.type]}
                    </motion.span>
                    <span
                      className={`font-mono text-xs ${file.encrypted ? 'text-red-400 line-through' : 'text-gray-500'}`}
                    >
                      {file.name}
                    </span>
                  </motion.div>
                ))}
            </div>

            <div className="h-1.5 overflow-hidden rounded bg-gray-700">
              <motion.div
                className="h-full bg-red-400"
                animate={{ width: `${encryptionProgress}%` }}
              />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-red-400">
              {Math.round(encryptionProgress)}%
            </p>
          </motion.div>
        )}

        {/* Ransom Note */}
        {phase === 'ransom' && (
          <motion.div
            key="ransom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="mb-1 font-mono text-xs tracking-widest text-red-400">
              RANSOM NOTE
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              身代金要求メッセージを作成せよ
            </p>

            <div className="mb-4 rounded border border-red-400/20 bg-cyber-card p-3">
              <p className="mb-1 font-mono text-xs text-gray-500">
                暗号化済み: {selectedFiles.length} ファイル
              </p>
              <p className="font-mono text-xs text-red-400">
                {hasBackup
                  ? 'バックアップも暗号化済み'
                  : '※ バックアップは未暗号化'}
              </p>
            </div>

            <textarea
              value={ransomNote}
              onChange={(e) => setRansomNote(e.target.value)}
              rows={6}
              placeholder="あなたのファイルは暗号化されました。復号キーが必要な場合は..."
              className="mb-4 w-full rounded border border-red-400/20 bg-black px-3 py-2 font-mono text-sm text-red-300 placeholder-red-900 focus:border-red-400/50 focus:outline-none"
            />

            <CyberButton
              onClick={handleSubmitNote}
              variant="danger"
              className="w-full"
              disabled={!ransomNote.trim()}
            >
              DEPLOY RANSOMWARE
            </CyberButton>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <NeonBadge color="green">MISSION COMPLETE</NeonBadge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
