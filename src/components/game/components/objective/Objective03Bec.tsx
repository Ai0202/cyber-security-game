'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface CeoEmail { from: string; to: string; subject: string; body: string; }
type Phase = 'loading' | 'briefing' | 'study' | 'compose' | 'sending' | 'done';

const fallbackEmails: CeoEmail[] = [
  { from: '山本社長', to: '佐藤部長', subject: '来期の予算について', body: '佐藤\n来期予算の件、例の案で進めてくれ。\n詳細は後日話す。\nよろしく頼む。\n山本' },
  { from: '山本社長', to: '鈴木', subject: '振込の件', body: '鈴木\n先日の取引先への支払い、確認した。\n問題ない。処理を進めてくれ。\nよろしく頼む。\n山本' },
  { from: '山本社長', to: '田中課長', subject: '人事案件', body: '田中\n例の人事の件、内密に進めてくれ。\n来週月曜に報告を頼む。\nよろしく頼む。\n山本' },
];

function toRank(s: number) { return s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const; }

export default function Objective03Bec({ storyContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [emails, setEmails] = useState<CeoEmail[]>(fallbackEmails);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [amount, setAmount] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
        if (!cancelled && data.emails?.length) setEmails(data.emails);
      } catch { /* fallback */ }
      if (!cancelled) setPhase('briefing');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const handleSend = () => {
    setPhase('sending');
    setTimeout(() => {
      // Style mimicry scoring
      const ceoPatterns = ['よろしく頼む', '山本', '鈴木', '件', '処理', '進めてくれ'];
      const styleHits = ceoPatterns.filter(p => body.includes(p)).length;
      const styleScore = Math.min(30, styleHits * 6);

      // Urgency & plausibility
      const urgentWords = ['至急', '緊急', '本日中', '今日中', '急ぎ', '内密'];
      const hasUrgency = urgentWords.some(w => body.includes(w) || subject.includes(w));
      const urgencyScore = hasUrgency ? 22 : body.length > 30 ? 15 : 8;

      // Amount reasonableness (100万-5000万 is reasonable)
      const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;
      const amountScore = numAmount >= 1000000 && numAmount <= 50000000 ? 20 : numAmount > 0 && numAmount < 100000000 ? 12 : 5;

      // Detail accuracy
      const detailWords = ['振込', '口座', '取引先', '支払い', '請求'];
      const detailHits = detailWords.filter(w => body.includes(w)).length;
      const detailScore = Math.min(25, detailHits * 6 + (subject.length > 5 ? 5 : 0));

      const score = Math.max(0, Math.min(100, styleScore + urgencyScore + amountScore + detailScore));
      const transferSuccess = score >= 50;
      setPhase('done');
      onComplete({ score, rank: toRank(score), breakdown: [
        { category: 'スタイル模倣', points: styleScore, maxPoints: 30, comment: `CEO表現: ${styleHits}/${ceoPatterns.length}個使用` },
        { category: '緊急性・信憑性', points: urgencyScore, maxPoints: 25, comment: hasUrgency ? '緊急性を演出' : '緊急性が不足' },
        { category: '金額の妥当性', points: amountScore, maxPoints: 20, comment: numAmount > 0 ? `${(numAmount / 10000).toFixed(0)}万円` : '金額未設定' },
        { category: '詳細の正確性', points: detailScore, maxPoints: 25, comment: `${detailHits}個の業務用語を使用` },
      ], contextOutput: { transferAmount: amount, transferSuccess, detectionRisk: 100 - score } });
    }, 2000);
  };

  if (phase === 'loading') return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
    </div>
  );

  const inputCls = 'w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-magenta/50 focus:outline-none';

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'briefing' && (
          <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-magenta">BUSINESS EMAIL COMPROMISE</h2>
            <p className="mb-2 text-sm text-gray-400">山本社長のメールアカウントを掌握した。</p>
            <p className="mb-2 text-sm text-gray-400">経理部 鈴木に偽の振込指示メールを送信せよ。</p>
            <p className="mb-6 text-xs text-cyber-green/70">まずはCEOのメール履歴から文体を学習する。</p>
            <CyberButton onClick={() => setPhase('study')}>CEOメールを確認</CyberButton>
          </motion.div>
        )}
        {phase === 'study' && (
          <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">CEO EMAIL HISTORY</h2>
            <p className="mb-4 text-sm text-gray-400">山本社長の文体パターンを分析せよ</p>
            <div className="mb-4 space-y-2">
              {emails.map((email, idx) => (
                <motion.button key={idx} onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded border border-white/10 bg-cyber-card p-3 text-left">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs text-white">{email.subject}</p>
                    <span className="text-xs text-gray-500">To: {email.to}</span>
                  </div>
                  <AnimatePresence>
                    {expandedIdx === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="mt-2 overflow-hidden border-t border-white/5 pt-2">
                        <pre className="whitespace-pre-wrap font-mono text-xs text-gray-400">{email.body}</pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
            <NeonBadge color="yellow" className="mb-4">HINT: 「よろしく頼む」「姓のみ」「簡潔」がCEOの特徴</NeonBadge>
            <CyberButton onClick={() => setPhase('compose')} className="mt-3 w-full">メールを作成</CyberButton>
          </motion.div>
        )}
        {phase === 'compose' && (
          <motion.div key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">COMPOSE AS CEO</h2>
            <p className="mb-4 text-xs text-gray-500">From: 山本社長 &lt;yamamoto@{storyContext.targetOrg}.co.jp&gt; / To: 経理部 鈴木</p>
            <div className="space-y-3">
              <div><label className="mb-1 block font-mono text-xs text-gray-500">件名</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="例: 振込の件" className={inputCls} /></div>
              <div><label className="mb-1 block font-mono text-xs text-gray-500">本文</label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="鈴木&#10;..." className={inputCls} /></div>
              <div><label className="mb-1 block font-mono text-xs text-gray-500">振込金額</label>
                <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例: 3000万円" className={inputCls} /></div>
            </div>
            <div className="mt-4 flex gap-3">
              <CyberButton onClick={() => setPhase('study')} variant="secondary" className="flex-1">BACK</CyberButton>
              <CyberButton onClick={handleSend} variant="danger" className="flex-1" disabled={!subject || !body || !amount}>SEND</CyberButton>
            </div>
          </motion.div>
        )}
        {phase === 'sending' && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-magenta border-t-transparent" />
              <p className="font-mono text-sm text-cyber-magenta">SENDING AS CEO...</p>
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
