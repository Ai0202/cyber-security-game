'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface TargetInfo {
  name: string; position: string; department: string;
  email: string; recentActivity: string; personality: string;
}

type Phase = 'loading' | 'briefing' | 'compose' | 'sending' | 'result';

const fallback: TargetInfo = {
  name: '田中太郎', position: '経理部長', department: '経理部',
  email: 'tanaka@example-corp.co.jp',
  recentActivity: '来月の予算会議の準備中',
  personality: '忙しく、メールを素早く処理する傾向がある',
};

export default function Access01PhishingEmail({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [target, setTarget] = useState<TargetInfo>(fallback);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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
        if (!cancelled && data.target) {
          setTarget({ ...fallback, ...data.target });
        }
      } catch { /* use fallback */ }
      if (!cancelled) setPhase('briefing');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const handleSend = () => {
    setPhase('sending');
    setTimeout(() => {
      const breakdown = [];
      const org = storyContext.targetOrg.charAt(0).toLowerCase();
      const s1 = senderEmail.includes(org) || senderName.includes('IT') || senderName.includes('管理') ? 20 : 10;
      breakdown.push({ category: '送信者偽装', points: s1, maxPoints: 25, comment: s1 >= 20 ? '組織に関連した偽装名' : '偽装が不十分' });
      const urgentWords = ['緊急', '至急', '重要', '期限', 'セキュリティ'];
      const s2 = urgentWords.some(w => subject.includes(w)) ? 22 : subject.length > 5 ? 15 : 8;
      breakdown.push({ category: '件名の緊急性', points: s2, maxPoints: 25, comment: s2 >= 20 ? '緊急性を感じさせる件名' : '件名にもう少し工夫が必要' });
      const s3 = body.length > 50 ? 25 : body.length > 20 ? 18 : 10;
      breakdown.push({ category: '本文の説得力', points: s3, maxPoints: 30, comment: s3 >= 25 ? '具体的で説得力のある本文' : '本文をもう少し具体的に' });
      const s4 = linkUrl.includes(org) || linkUrl.includes('.co.jp') ? 18 : linkUrl.length > 10 ? 12 : 5;
      breakdown.push({ category: 'URL偽装', points: s4, maxPoints: 20, comment: s4 >= 15 ? '本物に似せたURL' : 'URLの偽装が不十分' });
      const score = Math.min(100, Math.max(0, s1 + s2 + s3 + s4));
      const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';
      setPhase('result');
      onComplete({ score, rank, breakdown, contextOutput: {
        phishingSuccess: score >= 50, stolenCredentials: score >= 50 ? { email: target.email, password: 'P@ssw0rd123' } : null,
      }});
    }, 2000);
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
      </div>
    );
  }

  const inputCls = 'w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none';

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'briefing' && (
          <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">PHISHING EMAIL</h2>
            <p className="mb-4 text-sm text-gray-400">ターゲットにフィッシングメールを送信し、認証情報を窃取せよ</p>
            <div className="mb-6 rounded-lg border border-white/10 bg-cyber-card p-4">
              <h3 className="mb-3 font-mono text-xs text-cyber-cyan">TARGET PROFILE</h3>
              <dl className="space-y-2 text-sm">
                {([['名前', target.name], ['役職', `${target.department} ${target.position}`], ['メール', target.email], ['最近の行動', target.recentActivity], ['性格', target.personality]] as const).map(([l, v]) => (
                  <div key={l} className="flex gap-2">
                    <dt className="text-gray-500">{l}:</dt>
                    <dd className={l === 'メール' ? 'font-mono text-cyber-green' : 'text-gray-300'}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <CyberButton onClick={() => setPhase('compose')} className="w-full">START COMPOSING</CyberButton>
          </motion.div>
        )}
        {phase === 'compose' && (
          <motion.div key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-widest text-cyber-magenta">COMPOSE EMAIL</h2>
              <button onClick={() => setShowPreview(!showPreview)} className="font-mono text-xs text-cyber-cyan hover:text-cyber-cyan/80">
                {showPreview ? 'EDIT' : 'PREVIEW'}
              </button>
            </div>
            {!showPreview ? (
              <div className="space-y-3">
                <div><label className="mb-1 block font-mono text-xs text-gray-500">送信者名</label>
                  <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="例: IT管理部" className={inputCls} /></div>
                <div><label className="mb-1 block font-mono text-xs text-gray-500">送信者メール</label>
                  <input type="text" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="例: it-support@example-corp.co.jp" className={inputCls} /></div>
                <div><label className="mb-1 block font-mono text-xs text-gray-500">件名</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="例: 【緊急】パスワード変更のお願い" className={inputCls} /></div>
                <div><label className="mb-1 block font-mono text-xs text-gray-500">本文</label>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="メール本文を入力..." className={inputCls} /></div>
                <div><label className="mb-1 block font-mono text-xs text-gray-500">罠リンクURL</label>
                  <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="例: https://examp1e-corp.co.jp/login" className={inputCls} /></div>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-gray-500">From: {senderName} &lt;{senderEmail}&gt;</p>
                <p className="text-xs text-gray-500">To: {target.email}</p>
                <p className="mt-1 font-bold text-white text-sm">{subject}</p>
                <div className="mt-3 whitespace-pre-wrap text-sm text-gray-300">{body}</div>
                {linkUrl && <p className="mt-3 font-mono text-xs text-cyber-cyan underline">{linkUrl}</p>}
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <CyberButton onClick={() => setPhase('briefing')} variant="secondary" className="flex-1">BACK</CyberButton>
              <CyberButton onClick={handleSend} variant="danger" className="flex-1" disabled={!senderName || !subject || !body}>SEND</CyberButton>
            </div>
          </motion.div>
        )}
        {phase === 'sending' && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-magenta border-t-transparent" />
              <p className="font-mono text-sm text-cyber-magenta">SENDING EMAIL...</p>
            </div>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
              <p className="mt-4 text-sm text-gray-400">結果を集計しています...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
