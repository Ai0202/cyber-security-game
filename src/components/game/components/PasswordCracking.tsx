'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';
import ScenarioLoading from './ScenarioLoading';

interface TargetProfile {
  name: string;
  birthday: string;
  petName: string;
  hobby: string;
  favoriteTeam: string;
  partnerName: string;
  hometown: string;
}

type AttackMode = 'manual' | 'dictionary' | 'bruteforce';
type Phase = 'loading' | 'profile' | 'attack' | 'cracking' | 'done';

const fallbackProfile: TargetProfile = {
  name: '佐藤花子',
  birthday: '1990-03-15',
  petName: 'モモ',
  hobby: 'ヨガ',
  favoriteTeam: '横浜DeNAベイスターズ',
  partnerName: 'ケンジ',
  hometown: '横浜',
};

const fallbackPasswords = ['momo0315', 'hanako1990', 'yokohama315'];

const defaultDummyList = [
  'password123',
  '123456',
  'qwerty',
  'admin',
  'letmein',
  'welcome1',
  'abc123',
];

export default function PasswordCracking({
  storyContext,
  phaseId,
  componentId,
  previousResults,
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [profile, setProfile] = useState<TargetProfile>(fallbackProfile);
  const [correctPasswords, setCorrectPasswords] = useState<string[]>(fallbackPasswords);
  const [dictionaryList, setDictionaryList] = useState<string[]>([]);
  const [mode, setMode] = useState<AttackMode>('manual');
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

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

        if (data.profile) {
          setProfile({
            name: data.profile.name || fallbackProfile.name,
            birthday: data.profile.birthday || fallbackProfile.birthday,
            petName: data.profile.petName || fallbackProfile.petName,
            hobby: data.profile.hobby || fallbackProfile.hobby,
            favoriteTeam: data.profile.favoriteTeam || fallbackProfile.favoriteTeam,
            partnerName: data.profile.partnerName || fallbackProfile.partnerName,
            hometown: data.profile.hometown || fallbackProfile.hometown,
          });
        }

        if (data.passwords && Array.isArray(data.passwords)) {
          const pws = data.passwords.map(
            (p: { password: string }) => p.password
          );
          setCorrectPasswords(pws);
          // Build dictionary: correct passwords mixed into dummy list
          const shuffled = [...defaultDummyList, ...pws].sort(
            () => Math.random() - 0.5
          );
          setDictionaryList(shuffled);
        } else {
          setDictionaryList([...defaultDummyList, ...fallbackPasswords].sort(() => Math.random() - 0.5));
        }

        setPhase('profile');
      } catch {
        if (cancelled) return;
        setDictionaryList([...defaultDummyList, ...fallbackPasswords].sort(() => Math.random() - 0.5));
        setPhase('profile');
      }
    }

    fetchScenario();
    return () => {
      cancelled = true;
    };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addTerminalLine = (line: string) => {
    setTerminalLines((prev) => [...prev, line]);
  };

  const checkPassword = (pw: string): boolean => {
    return correctPasswords.some(
      (cp) => cp.toLowerCase() === pw.toLowerCase()
    );
  };

  const finishGame = (attemptCount: number, usedMode: AttackMode) => {
    setTimeout(() => {
      let score: number;
      if (usedMode === 'manual') {
        if (attemptCount === 1) score = 100;
        else if (attemptCount <= 3) score = 70;
        else score = 40;
      } else if (usedMode === 'dictionary') {
        score = 20;
      } else {
        score = 10;
      }

      const modeLabel =
        usedMode === 'manual'
          ? '手動推測'
          : usedMode === 'dictionary'
            ? '辞書攻撃'
            : '総当たり';

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
            category: '攻撃手法',
            points: usedMode === 'manual' ? 30 : usedMode === 'dictionary' ? 15 : 5,
            maxPoints: 30,
            comment: `${modeLabel}を使用`,
          },
          {
            category: '試行回数',
            points: Math.max(0, 40 - (attemptCount - 1) * 10),
            maxPoints: 40,
            comment: `${attemptCount}回で突破`,
          },
          {
            category: '推測精度',
            points: score >= 70 ? 30 : score >= 40 ? 20 : 10,
            maxPoints: 30,
            comment:
              score >= 70
                ? 'プロフィールからの的確な推測'
                : '改善の余地あり',
          },
        ],
        contextOutput: {
          crackedPassword: correctPasswords[0],
          accountAccess: true,
        },
      });
    }, 3000);
  };

  const handleManualAttempt = () => {
    if (!input.trim()) return;
    const pw = input.trim();
    const newAttempts = [...attempts, pw];
    setAttempts(newAttempts);
    setInput('');

    addTerminalLine(`$ crack --password "${pw}"`);

    if (checkPassword(pw)) {
      addTerminalLine('[SUCCESS] パスワードが一致しました！');
      setPhase('done');
      finishGame(newAttempts.length, 'manual');
    } else {
      addTerminalLine(`[FAILED] パスワード "${pw}" は不一致`);
      if (newAttempts.length >= 5) {
        addTerminalLine('[INFO] 試行回数上限。辞書攻撃に切り替えてください。');
      }
    }
  };

  const handleDictionaryAttack = () => {
    setMode('dictionary');
    setPhase('cracking');
    let index = 0;

    const interval = setInterval(() => {
      if (index >= dictionaryList.length) {
        clearInterval(interval);
        addTerminalLine('[COMPLETE] 辞書攻撃完了');
        setPhase('done');
        finishGame(dictionaryList.length, 'dictionary');
        return;
      }
      const pw = dictionaryList[index];
      addTerminalLine(`$ dict-attack: trying "${pw}"...`);
      if (checkPassword(pw)) {
        addTerminalLine(`[SUCCESS] "${pw}" でログイン成功！`);
        clearInterval(interval);
        setPhase('done');
        finishGame(index + 1, 'dictionary');
        return;
      }
      addTerminalLine(`  -> FAILED`);
      index++;
    }, 400);
  };

  const handleBruteForce = () => {
    setMode('bruteforce');
    setPhase('cracking');
    addTerminalLine('$ bruteforce --charset=alphanumeric --length=6-10');
    addTerminalLine('[INFO] 推定所要時間: 約3時間45分...');

    let count = 0;
    const interval = setInterval(() => {
      count++;
      addTerminalLine(
        `  [${count * 12847}] 試行中... ${Math.random().toString(36).slice(2, 10)}`
      );
      if (count >= 6) {
        clearInterval(interval);
        addTerminalLine(`[SUCCESS] "${correctPasswords[0]}" でログイン成功！`);
        setPhase('done');
        finishGame(count * 12847, 'bruteforce');
      }
    }, 500);
  };

  if (phase === 'loading') {
    return <ScenarioLoading />;
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {/* Profile Phase */}
        {phase === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-cyan">
              TARGET SNS PROFILE
            </h2>
            <p className="mb-2 text-sm text-gray-400">
              ターゲットのSNSプロフィールを入手した。
              <br />
              個人情報からパスワードを推測し、アカウントを乗っ取れ。
            </p>
            <p className="mb-4 text-xs text-cyber-green/70">
              突破したアカウントで、{storyContext.targetOrg}の内部ネットワークにログインできるようになる。
            </p>

            <div className="mb-6 rounded-lg border border-white/10 bg-cyber-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyber-magenta/20 font-mono text-lg text-cyber-magenta">
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-white">{profile.name}</p>
                  <p className="text-xs text-gray-500">
                    @{profile.name.toLowerCase().replace(/\s/g, '')}
                  </p>
                </div>
              </div>
              <dl className="space-y-1.5 text-sm">
                {[
                  ['誕生日', profile.birthday],
                  ['ペット', profile.petName],
                  ['趣味', profile.hobby],
                  ['推しチーム', profile.favoriteTeam],
                  ['パートナー', profile.partnerName],
                  ['出身', profile.hometown],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt className="text-gray-500">{label}:</dt>
                    <dd className="text-gray-300">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mb-2 text-xs text-gray-500">
              TARGET: {storyContext.targetOrg}
            </p>

            <CyberButton
              onClick={() => setPhase('attack')}
              className="w-full"
            >
              攻撃開始
            </CyberButton>
          </motion.div>
        )}

        {/* Attack Phase */}
        {(phase === 'attack' || phase === 'cracking' || phase === 'done') && (
          <motion.div
            key="attack"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Mode selector */}
            {phase === 'attack' && (
              <div className="mb-4 flex gap-2">
                {(
                  [
                    ['manual', '手動推測'],
                    ['dictionary', '辞書攻撃'],
                    ['bruteforce', '総当たり'],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`rounded border px-3 py-1 font-mono text-xs ${
                      mode === m
                        ? 'border-cyber-green text-cyber-green'
                        : 'border-gray-700 text-gray-500'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Terminal */}
            <div
              ref={terminalRef}
              className="mb-4 h-64 overflow-y-auto rounded-lg border border-white/10 bg-black p-3 font-mono text-xs"
            >
              <p className="text-cyber-green">
                $ target: {storyContext.targetOrg}
              </p>
              <p className="text-gray-500">
                Password Cracker v2.4 initialized...
              </p>
              {terminalLines.map((line, i) => (
                <p
                  key={i}
                  className={
                    line.includes('SUCCESS')
                      ? 'text-cyber-green'
                      : line.includes('FAILED')
                        ? 'text-red-400'
                        : 'text-gray-400'
                  }
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Manual input */}
            {phase === 'attack' && mode === 'manual' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualAttempt()}
                  placeholder="パスワードを入力..."
                  className="flex-1 rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                />
                <CyberButton onClick={handleManualAttempt}>CRACK</CyberButton>
              </div>
            )}

            {/* Dictionary / Bruteforce buttons */}
            {phase === 'attack' && mode === 'dictionary' && (
              <CyberButton onClick={handleDictionaryAttack} className="w-full" variant="danger">
                辞書攻撃を実行
              </CyberButton>
            )}
            {phase === 'attack' && mode === 'bruteforce' && (
              <CyberButton onClick={handleBruteForce} className="w-full" variant="danger">
                総当たり攻撃を実行
              </CyberButton>
            )}

            {/* Attempt counter */}
            {attempts.length > 0 && (
              <p className="mt-2 text-right font-mono text-xs text-gray-500">
                試行回数: {attempts.length}
              </p>
            )}

            {phase === 'done' && (
              <div className="mt-4 text-center">
                <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
