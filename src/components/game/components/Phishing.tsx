'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface TargetInfo {
  name: string;
  position: string;
  department: string;
  email: string;
  recentActivity: string;
  personality: string;
}

type Phase = 'briefing' | 'compose' | 'sending' | 'result';

const defaultTarget: TargetInfo = {
  name: '田中太郎',
  position: '経理部長',
  department: '経理部',
  email: 'tanaka@example-corp.co.jp',
  recentActivity: '来月の予算会議の準備中',
  personality: '忙しく、メールを素早く処理する傾向がある',
};

export default function Phishing({
  storyContext,
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [target] = useState<TargetInfo>(defaultTarget);

  // Email form state
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const [showPreview, setShowPreview] = useState(false);

  const handleSend = () => {
    setPhase('sending');

    // Simulate evaluation
    setTimeout(() => {
      let totalScore = 0;
      const breakdown = [];

      // Sender disguise (0-25)
      const senderScore =
        senderEmail.includes(storyContext.targetOrg.charAt(0).toLowerCase()) ||
        senderName.includes('IT') ||
        senderName.includes('管理')
          ? 20
          : 10;
      totalScore += senderScore;
      breakdown.push({
        category: '送信者偽装',
        points: senderScore,
        maxPoints: 25,
        comment:
          senderScore >= 20
            ? '組織に関連した偽装名を使用'
            : '偽装が不十分',
      });

      // Subject (0-25)
      const urgentWords = ['緊急', '至急', '重要', '期限', 'セキュリティ'];
      const subjectScore = urgentWords.some((w) => subject.includes(w))
        ? 22
        : subject.length > 5
          ? 15
          : 8;
      totalScore += subjectScore;
      breakdown.push({
        category: '件名の緊急性',
        points: subjectScore,
        maxPoints: 25,
        comment:
          subjectScore >= 20
            ? '緊急性を感じさせる件名'
            : '件名にもう少し工夫が必要',
      });

      // Body (0-30)
      const bodyScore = body.length > 50 ? 25 : body.length > 20 ? 18 : 10;
      totalScore += bodyScore;
      breakdown.push({
        category: '本文の説得力',
        points: bodyScore,
        maxPoints: 30,
        comment:
          bodyScore >= 25
            ? '具体的で説得力のある本文'
            : '本文をもう少し具体的に',
      });

      // Link (0-20)
      const linkScore =
        linkUrl.includes(storyContext.targetOrg.charAt(0).toLowerCase()) ||
        linkUrl.includes('.co.jp')
          ? 18
          : linkUrl.length > 10
            ? 12
            : 5;
      totalScore += linkScore;
      breakdown.push({
        category: 'URL偽装',
        points: linkScore,
        maxPoints: 20,
        comment:
          linkScore >= 15
            ? '本物に似せたURL'
            : 'URLの偽装が不十分',
      });

      setPhase('result');

      onComplete({
        score: totalScore,
        rank:
          totalScore >= 90
            ? 'S'
            : totalScore >= 70
              ? 'A'
              : totalScore >= 50
                ? 'B'
                : totalScore >= 30
                  ? 'C'
                  : 'D',
        breakdown,
        contextOutput: {
          phishingSuccess: totalScore >= 50,
          stolenCredentials:
            totalScore >= 50
              ? { email: target.email, password: 'P@ssw0rd123' }
              : null,
        },
      });
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {/* Briefing Phase */}
        {phase === 'briefing' && (
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">
              MISSION BRIEFING
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              ターゲットにフィッシングメールを送信し、認証情報を窃取せよ
            </p>

            <div className="mb-6 rounded-lg border border-white/10 bg-cyber-card p-4">
              <h3 className="mb-3 font-mono text-xs text-cyber-cyan">
                TARGET PROFILE
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <dt className="text-gray-500">名前:</dt>
                  <dd className="text-white">{target.name}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">役職:</dt>
                  <dd className="text-white">
                    {target.department} {target.position}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">メール:</dt>
                  <dd className="font-mono text-cyber-green">{target.email}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">最近の行動:</dt>
                  <dd className="text-gray-300">{target.recentActivity}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500">性格:</dt>
                  <dd className="text-gray-300">{target.personality}</dd>
                </div>
              </dl>
            </div>

            <div className="mb-6 rounded-lg border border-cyber-green/20 bg-cyber-card p-4">
              <p className="text-xs text-gray-500">
                TARGET ORG: {storyContext.targetOrg}
              </p>
            </div>

            <CyberButton onClick={() => setPhase('compose')} className="w-full">
              START COMPOSING
            </CyberButton>
          </motion.div>
        )}

        {/* Compose Phase */}
        {phase === 'compose' && (
          <motion.div
            key="compose"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-widest text-cyber-magenta">
                COMPOSE PHISHING EMAIL
              </h2>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="font-mono text-xs text-cyber-cyan hover:text-cyber-cyan/80"
              >
                {showPreview ? 'EDIT' : 'PREVIEW'}
              </button>
            </div>

            {!showPreview ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block font-mono text-xs text-gray-500">
                    送信者名
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="例: IT管理部"
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-gray-500">
                    送信者メールアドレス
                  </label>
                  <input
                    type="text"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="例: it-support@example-corp.co.jp"
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-gray-500">
                    件名
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="例: 【緊急】パスワード変更のお願い"
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-gray-500">
                    本文
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    placeholder="メール本文を入力..."
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-xs text-gray-500">
                    罠リンクURL
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="例: https://examp1e-corp.co.jp/login"
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              /* Preview */
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-3 border-b border-white/10 pb-3 text-sm">
                  <p className="text-gray-500">
                    From: {senderName} &lt;{senderEmail}&gt;
                  </p>
                  <p className="text-gray-500">To: {target.email}</p>
                  <p className="mt-1 font-bold text-white">{subject}</p>
                </div>
                <div className="whitespace-pre-wrap text-sm text-gray-300">
                  {body}
                </div>
                {linkUrl && (
                  <p className="mt-3 font-mono text-xs text-cyber-cyan underline">
                    {linkUrl}
                  </p>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-3">
              <CyberButton
                onClick={() => setPhase('briefing')}
                variant="secondary"
                className="flex-1"
              >
                BACK
              </CyberButton>
              <CyberButton
                onClick={handleSend}
                variant="danger"
                className="flex-1"
                disabled={!senderName || !subject || !body}
              >
                SEND EMAIL
              </CyberButton>
            </div>
          </motion.div>
        )}

        {/* Sending animation */}
        {phase === 'sending' && (
          <motion.div
            key="sending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[60vh] items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-magenta border-t-transparent"
              />
              <p className="font-mono text-sm text-cyber-magenta">
                SENDING EMAIL...
              </p>
              <p className="mt-2 text-xs text-gray-500">
                ターゲットの反応を分析中
              </p>
            </div>
          </motion.div>
        )}

        {/* Result phase is handled by parent */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-[40vh] items-center justify-center"
          >
            <div className="text-center">
              <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
              <p className="mt-4 text-sm text-gray-400">
                結果を集計しています...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
