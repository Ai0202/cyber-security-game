'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';

interface HiddenInfo {
  id: string;
  type: 'password' | 'email' | 'personal' | 'business';
  label: string;
  value: string;
  points: number;
  x: number;
  y: number;
  found: boolean;
}

const TIME_LIMIT = 30;

export default function ShoulderHacking({
  storyContext,
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [items, setItems] = useState<HiddenInfo[]>([]);
  const [foundCount, setFoundCount] = useState(0);

  // Generate hidden items based on story context
  useEffect(() => {
    const generated: HiddenInfo[] = [
      {
        id: '1',
        type: 'password',
        label: 'パスワード付箋',
        value: 'Pass1234!',
        points: 30,
        x: 15,
        y: 25,
        found: false,
      },
      {
        id: '2',
        type: 'email',
        label: 'メールアドレス',
        value: `admin@${storyContext.targetOrg.charAt(0).toLowerCase()}hospital.jp`,
        points: 20,
        x: 60,
        y: 40,
        found: false,
      },
      {
        id: '3',
        type: 'personal',
        label: '患者リスト',
        value: '個人情報一覧が画面に表示',
        points: 20,
        x: 35,
        y: 65,
        found: false,
      },
      {
        id: '4',
        type: 'business',
        label: '内部システムURL',
        value: 'https://intra.hospital-local/admin',
        points: 25,
        x: 75,
        y: 20,
        found: false,
      },
    ];
    setItems(generated);
  }, [storyContext]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Finish game when phase changes to done
  useEffect(() => {
    if (phase !== 'done') return;

    const foundItems = items.filter((i) => i.found);
    const totalPoints = foundItems.reduce((sum, i) => sum + i.points, 0);
    const timeBonus = timeLeft > 0 ? 10 : 0;
    const score = Math.min(100, totalPoints + timeBonus);

    const contextOutput: Record<string, unknown> = {};
    foundItems.forEach((item) => {
      if (item.type === 'email') contextOutput['discoveredEmail'] = item.value;
      if (item.type === 'password')
        contextOutput['passwordHint'] = item.value;
      if (item.type === 'business')
        contextOutput['internalUrl'] = item.value;
    });

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
          category: 'パスワード発見',
          points: foundItems.find((i) => i.type === 'password') ? 30 : 0,
          maxPoints: 30,
          comment: foundItems.find((i) => i.type === 'password')
            ? '付箋のパスワードを発見'
            : '見逃し',
        },
        {
          category: '個人情報発見',
          points: foundItems.find((i) => i.type === 'personal') ? 20 : 0,
          maxPoints: 20,
          comment: foundItems.find((i) => i.type === 'personal')
            ? '患者リストを発見'
            : '見逃し',
        },
        {
          category: '業務機密発見',
          points: foundItems.filter((i) =>
            ['email', 'business'].includes(i.type)
          ).length * 20,
          maxPoints: 45,
          comment: `${foundItems.filter((i) => ['email', 'business'].includes(i.type)).length}件の業務情報を発見`,
        },
        {
          category: '時間ボーナス',
          points: timeBonus,
          maxPoints: 10,
          comment:
            timeBonus > 0
              ? `残り${timeLeft}秒でクリア`
              : 'タイムアップ',
        },
      ],
      contextOutput,
    });
  }, [phase, items, timeLeft, onComplete]);

  const handleItemClick = useCallback(
    (id: string) => {
      if (phase !== 'playing') return;
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id && !item.found) {
            setFoundCount((c) => c + 1);
            return { ...item, found: true };
          }
          return item;
        })
      );
    },
    [phase]
  );

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">
              SHOULDER HACKING
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              {storyContext.targetOrg}の待合室。
              <br />
              ターゲットのPC画面から機密情報を見つけ出せ。
            </p>
            <p className="mb-6 text-xs text-gray-500">
              制限時間: {TIME_LIMIT}秒 / 画面上の光るポイントをタップして情報を収集
            </p>
            <button
              onClick={() => setPhase('playing')}
              className="rounded border border-cyber-green px-8 py-3 font-mono text-cyber-green transition-colors hover:bg-cyber-green/10"
            >
              START
            </button>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Timer + Found counter */}
            <div className="mb-4 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 10 ? 'red' : 'cyan'}>
                {timeLeft}s
              </NeonBadge>
              <span className="font-mono text-xs text-gray-500">
                FOUND: {foundCount}/{items.length}
              </span>
            </div>

            {/* Scene area */}
            <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg border border-white/10 bg-cyber-card">
              {/* Scene background elements */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-cyber-card">
                {/* Desk mockup */}
                <div className="absolute bottom-[20%] left-[10%] h-[40%] w-[45%] rounded border border-white/5 bg-gray-800/50 p-2">
                  <div className="h-full rounded bg-blue-900/30">
                    <p className="p-1 font-mono text-[8px] text-gray-500">
                      電子カルテシステム v3.2
                    </p>
                  </div>
                </div>
                {/* Phone mockup */}
                <div className="absolute bottom-[25%] right-[15%] h-[30%] w-[15%] rounded border border-white/5 bg-gray-800/50">
                  <div className="h-full rounded bg-green-900/20 p-1">
                    <p className="font-mono text-[6px] text-gray-500">LINE</p>
                  </div>
                </div>
              </div>

              {/* Clickable items */}
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.found || phase === 'done'}
                  animate={
                    item.found
                      ? { scale: 1.2, opacity: 0.5 }
                      : { scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }
                  }
                  transition={
                    item.found
                      ? {}
                      : { duration: 2, repeat: Infinity }
                  }
                  className={`absolute h-8 w-8 rounded-full border-2 ${
                    item.found
                      ? 'border-cyber-green bg-cyber-green/20'
                      : 'border-cyber-cyan/50 bg-cyber-cyan/10'
                  }`}
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                >
                  {item.found && (
                    <span className="text-xs text-cyber-green">✓</span>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Found items list */}
            <div className="space-y-1">
              {items
                .filter((i) => i.found)
                .map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 rounded bg-cyber-card/50 px-3 py-1.5 text-xs"
                  >
                    <NeonBadge
                      color={
                        item.type === 'password'
                          ? 'red'
                          : item.type === 'email'
                            ? 'cyan'
                            : 'green'
                      }
                    >
                      +{item.points}
                    </NeonBadge>
                    <span className="text-gray-400">{item.label}:</span>
                    <span className="font-mono text-white">{item.value}</span>
                  </motion.div>
                ))}
            </div>

            {phase === 'done' && (
              <div className="mt-4 text-center">
                <NeonBadge color="green">TIME UP - PHASE COMPLETE</NeonBadge>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
