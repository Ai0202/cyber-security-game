'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface Target { name: string; age: string; trait: string; }
type Phase = 'loading' | 'briefing' | 'compose' | 'sending' | 'result';

const senderOptions = ['宅配業者', '銀行', 'キャリア通知', '通販サイト', '公的機関'];
const urlOptions = ['https://re-delivery.jp/track', 'https://mybank-secure.jp/verify', 'https://career-update.jp/login', 'https://shop-point.jp/claim'];

const fallbackTarget: Target = { name: '山田一郎', age: '50代男性', trait: 'よくネットショッピングを利用' };

export default function Access02Smishing({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [target, setTarget] = useState<Target>(fallbackTarget);
  const [message, setMessage] = useState('');
  const [senderType, setSenderType] = useState(senderOptions[0]);
  const [selectedUrl, setSelectedUrl] = useState(urlOptions[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [useCustomUrl, setUseCustomUrl] = useState(false);

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
        if (!cancelled && data.target) setTarget({ ...fallbackTarget, ...data.target });
      } catch { /* use fallback */ }
      if (!cancelled) setPhase('briefing');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const finalUrl = useCustomUrl ? customUrl : selectedUrl;

  const handleSend = () => {
    setPhase('sending');
    setTimeout(() => {
      const breakdown = [];
      // Message credibility (0-30)
      const hasUrgency = ['確認', '至急', '届', '停止', '不正', '期限'].some(w => message.includes(w));
      const s1 = hasUrgency && message.length > 20 ? 27 : message.length > 10 ? 18 : 8;
      breakdown.push({ category: 'メッセージの信頼性', points: s1, maxPoints: 30, comment: s1 >= 25 ? '緊迫感のある文面' : '信頼性をもう少し高く' });
      // URL disguise (0-25)
      const urlLooksReal = finalUrl.includes('.jp') || finalUrl.includes(senderType.charAt(0));
      const s2 = urlLooksReal ? 22 : finalUrl.length > 15 ? 14 : 6;
      breakdown.push({ category: 'URL偽装品質', points: s2, maxPoints: 25, comment: s2 >= 20 ? '本物に見えるURL' : 'URL偽装が不十分' });
      // Sender match (0-25)
      const traitMatch = (target.trait.includes('ショッピング') && (senderType === '宅配業者' || senderType === '通販サイト')) ||
        (target.trait.includes('銀行') && senderType === '銀行') || senderType === 'キャリア通知';
      const s3 = traitMatch ? 23 : 12;
      breakdown.push({ category: '送信者とシナリオの一致', points: s3, maxPoints: 25, comment: s3 >= 20 ? 'ターゲットに最適な送信者' : 'ターゲット分析が不足' });
      // Character efficiency (0-20)
      const len = message.length;
      const s4 = len > 0 && len <= 70 ? 20 : len <= 100 ? 15 : len <= 160 ? 10 : 5;
      breakdown.push({ category: '文字数効率', points: s4, maxPoints: 20, comment: `${len}文字使用（160文字制限）` });
      const score = Math.min(100, Math.max(0, s1 + s2 + s3 + s4));
      const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';
      setPhase('result');
      onComplete({ score, rank, breakdown, contextOutput: {
        smishingSuccess: score >= 50, stolenCredentials: score >= 50 ? { phone: '080-xxxx-xxxx', pin: '1234' } : null,
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

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'briefing' && (
          <motion.div key="briefing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">SMISHING</h2>
            <p className="mb-4 text-sm text-gray-400">ターゲットに偽SMSを送信し、フィッシングサイトに誘導せよ</p>
            <div className="mb-6 rounded-lg border border-white/10 bg-cyber-card p-4">
              <h3 className="mb-2 font-mono text-xs text-cyber-cyan">TARGET INFO</h3>
              <p className="text-sm text-white">{target.name}</p>
              <p className="text-xs text-gray-400">{target.age} / {target.trait}</p>
            </div>
            <CyberButton onClick={() => setPhase('compose')} className="w-full">START COMPOSING</CyberButton>
          </motion.div>
        )}
        {phase === 'compose' && (
          <motion.div key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-4 font-mono text-xs tracking-widest text-cyber-magenta">COMPOSE SMS</h2>
            {/* iPhone-style SMS mockup */}
            <div className="mb-4 rounded-2xl border border-white/10 bg-cyber-card p-4">
              <div className="mb-3 border-b border-white/10 pb-2 text-center font-mono text-xs text-gray-500">{senderType}</div>
              <div className="min-h-[120px] rounded-lg bg-black/30 p-3">
                {message && (
                  <div className="inline-block max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-700 px-3 py-2 text-sm text-white">
                    {message}{finalUrl && <span className="block mt-1 text-cyber-cyan text-xs underline">{finalUrl}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">送信者偽装</label>
                <div className="flex flex-wrap gap-2">
                  {senderOptions.map(s => (
                    <button key={s} onClick={() => setSenderType(s)}
                      className={`rounded border px-3 py-1 font-mono text-xs ${senderType === s ? 'border-cyber-green text-cyber-green' : 'border-gray-700 text-gray-500'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">SMS本文 ({message.length}/160)</label>
                <textarea value={message} onChange={e => setMessage(e.target.value.slice(0, 160))} rows={3}
                  placeholder="お届け物のお届けに伺いましたが..." className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">偽URL</label>
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setUseCustomUrl(false)} className={`font-mono text-xs ${!useCustomUrl ? 'text-cyber-green' : 'text-gray-500'}`}>候補から選択</button>
                  <span className="text-gray-600">|</span>
                  <button onClick={() => setUseCustomUrl(true)} className={`font-mono text-xs ${useCustomUrl ? 'text-cyber-green' : 'text-gray-500'}`}>カスタム</button>
                </div>
                {!useCustomUrl ? (
                  <div className="space-y-1">
                    {urlOptions.map(u => (
                      <button key={u} onClick={() => setSelectedUrl(u)}
                        className={`block w-full rounded border px-3 py-1.5 text-left font-mono text-xs ${selectedUrl === u ? 'border-cyber-green text-cyber-green' : 'border-gray-700 text-gray-500'}`}>
                        {u}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input type="text" value={customUrl} onChange={e => setCustomUrl(e.target.value)} placeholder="https://..."
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none" />
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <CyberButton onClick={() => setPhase('briefing')} variant="secondary" className="flex-1">BACK</CyberButton>
              <CyberButton onClick={handleSend} variant="danger" className="flex-1" disabled={!message}>SEND SMS</CyberButton>
            </div>
          </motion.div>
        )}
        {phase === 'sending' && (
          <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-magenta border-t-transparent" />
              <p className="font-mono text-sm text-cyber-magenta">SENDING SMS...</p>
            </div>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[40vh] items-center justify-center">
            <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
