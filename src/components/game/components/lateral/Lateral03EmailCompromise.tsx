'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface Email { id: string; from: string; subject: string; body: string; important: boolean; infoKey?: string; infoValue?: string; read: boolean; }
type Phase = 'loading' | 'intro' | 'explore' | 'done';

const fallbackEmails: Email[] = [
  { id: '1', from: '\u5C71\u7530\u592A\u90CE (\u7D4C\u7406\u90E8\u9577)', subject: '\u7D44\u7E54\u56F3\u66F4\u65B0\u306E\u304A\u77E5\u3089\u305B', body: '\u5404\u4F4D\u3001\u6DFB\u4ED8\u306E\u7D44\u7E54\u56F3\u3092\u3054\u78BA\u8A8D\u304F\u3060\u3055\u3044\u3002\n\u7D4C\u55B6\u5C64: \u4F50\u85E4CEO\u3001\u7530\u4E2DCFO\u3001\u9234\u6728CTO\n\u90E8\u9577: \u5C71\u7530(\u7D4C\u7406)\u3001\u6E21\u8FBA(\u4EBA\u4E8B)\u3001\u677E\u672C(IT)', important: true, infoKey: 'orgStructure', infoValue: 'CEO:\u4F50\u85E4/CFO:\u7530\u4E2D/CTO:\u9234\u6728', read: false },
  { id: '2', from: '\u677E\u672C\u6B63 (IT\u90E8)', subject: 'Re: \u30B5\u30FC\u30D0\u30FC\u30A2\u30AF\u30BB\u30B9\u60C5\u5831', body: '\u30D5\u30A1\u30A4\u30EB\u30B5\u30FC\u30D0\u30FC: fs01.internal (admin/Fs#2024!)\nDB: db01.internal (root/DbRoot@99)\nVPN: vpn.company.co.jp', important: true, infoKey: 'serverAccess', infoValue: 'fs01:admin/Fs#2024!, db01:root/DbRoot@99', read: false },
  { id: '3', from: '\u79D8\u66F8\u5BA4', subject: 'CEO\u51FA\u5F35\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB', body: '2/20-2/25 \u4F50\u85E4CEO \u6D77\u5916\u51FA\u5F35(\u30B7\u30F3\u30AC\u30DD\u30FC\u30EB)\n\u4E0D\u5728\u4E2D\u306E\u6C7A\u88C1\u6A29\u9650: \u7530\u4E2DCFO\u306B\u59D4\u4EFB', important: true, infoKey: 'ceoSchedule', infoValue: '2/20-25\u6D77\u5916\u51FA\u5F35,\u6C7A\u88C1\u6A29\u9650CFO\u59D4\u4EFB', read: false },
  { id: '4', from: '\u5C71\u7530\u592A\u90CE', subject: '\u30E9\u30F3\u30C1\u884C\u304D\u307E\u305B\u3093\u304B\uFF1F', body: '\u4ECA\u65E5\u306E\u304A\u663C\u3001\u99C5\u524D\u306E\u65B0\u3057\u3044\u30A4\u30BF\u30EA\u30A2\u30F3\u8A66\u3057\u307E\u305B\u3093\u304B\uFF1F', important: false, read: false },
  { id: '5', from: '\u682A\u5F0F\u4F1A\u793EXYZSystems', subject: '\u30B7\u30B9\u30C6\u30E0\u79FB\u884C\u8A08\u753B\u66F8 v2', body: '\u73FE\u884C\u30B7\u30B9\u30C6\u30E0\u304B\u3089\u65B0\u57FA\u76E4\u3078\u306E\u79FB\u884C\u30B9\u30B1\u30B8\u30E5\u30FC\u30EB:\nPhase1(3\u6708): DB\u79FB\u884C\nPhase2(5\u6708): \u30A2\u30D7\u30EA\u79FB\u884C\n\u65E7\u30B7\u30B9\u30C6\u30E0\u306F6\u6708\u672B\u307E\u3067\u4E26\u884C\u7A3C\u50CD', important: true, infoKey: 'migrationPlan', infoValue: '3\u6708DB\u79FB\u884C,5\u6708\u30A2\u30D7\u30EA\u79FB\u884C,6\u6708\u672B\u65E7\u30B7\u30B9\u30C6\u30E0\u505C\u6B62', read: false },
  { id: '6', from: '\u4EBA\u4E8B\u90E8', subject: '\u4F1A\u8B70\u5BA4\u5909\u66F4\u306E\u304A\u77E5\u3089\u305B', body: '\u660E\u65E5\u306E\u5168\u4F53\u4F1A\u8B70\u306F3F\u4F1A\u8B70\u5BA4A\u306B\u5909\u66F4\u3067\u3059\u3002', important: false, read: false },
  { id: '7', from: 'newsletter@techinfo.jp', subject: '\u9031\u520A\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u30CB\u30E5\u30FC\u30B9', body: '\u4ECA\u9031\u306E\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u30C8\u30D4\u30C3\u30AF\u30B9...', important: false, read: false },
  { id: '8', from: '\u7530\u4E2D\u4E00\u90CE (CFO)', subject: 'Re: \u30D9\u30F3\u30C0\u30FC\u5951\u7D04\u66F4\u65B0', body: '\u30D9\u30F3\u30C0\u30FC\u30DD\u30FC\u30BF\u30EB: vendor.company.co.jp\nID: admin_tanaka / PW: Vendor2024!\n\u5951\u7D04\u66F4\u65B0\u671F\u9650: 3\u6708\u672B', important: true, infoKey: 'vendorCredentials', infoValue: 'vendor.company.co.jp admin_tanaka/Vendor2024!', read: false },
];

export default function Lateral03EmailCompromise({ storyContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [emails, setEmails] = useState(fallbackEmails);
  const [selected, setSelected] = useState<Email | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [alertLevel, setAlertLevel] = useState(0);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await fetch(`/api/game/phase/${phaseId}/action`, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ componentId, action:'init', storyContext, previousResults }) });
        if (!r.ok) throw new Error();
      } catch { /* fallback */ }
      if (!c) setPhase('intro');
    })();
    return () => { c = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => {
    if (phase !== 'explore') return;
    const t = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { clearInterval(t); setPhase('done'); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const finish = useCallback(() => {
    const found = emails.filter(e => e.read && e.important);
    const total = emails.filter(e => e.important).length;
    const infoPts = Math.min(50, found.length * 10);
    const qualityPts = found.length >= 4 ? 30 : found.length >= 3 ? 20 : found.length >= 2 ? 15 : found.length >= 1 ? 8 : 0;
    const stealthPts = Math.max(0, 20 - alertLevel);
    const s = Math.max(0, Math.min(100, infoPts + qualityPts + stealthPts));
    const rank = s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const;
    const data: Record<string, string> = {};
    const contacts: string[] = [];
    found.forEach(e => { if (e.infoKey && e.infoValue) data[e.infoKey] = e.infoValue; });
    if (data.orgStructure) contacts.push(...data.orgStructure.split('/'));
    onComplete({ score: s, rank, breakdown: [
      { category: '\u91CD\u8981\u30E1\u30FC\u30EB\u767A\u898B', points: infoPts, maxPoints: 50, comment: `${found.length}/${total}\u4EF6` },
      { category: '\u60C5\u5831\u54C1\u8CEA', points: qualityPts, maxPoints: 30, comment: `\u6709\u7528\u60C5\u5831${found.length}\u4EF6` },
      { category: '\u30B9\u30C6\u30EB\u30B9', points: stealthPts, maxPoints: 20, comment: `\u30A2\u30E9\u30FC\u30C8\u30EC\u30D9\u30EB: ${alertLevel}` },
    ], contextOutput: { discoveredData: data, orgStructure: data.orgStructure || '', criticalContacts: contacts } });
  }, [emails, alertLevel, onComplete]);

  useEffect(() => { if (phase === 'done') finish(); }, [phase, finish]);

  const openEmail = (email: Email) => {
    if (phase !== 'explore') return;
    setSelected(email);
    if (!email.read) {
      setEmails(p => p.map(e => e.id === email.id ? { ...e, read: true } : e));
      const readCount = emails.filter(e => e.read).length + 1;
      if (readCount > 4) setAlertLevel(p => Math.min(20, p + 4));
    }
  };

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
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">EMAIL ACCOUNT COMPROMISE</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}\u306E\u30E1\u30FC\u30EB\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4E57\u3063\u53D6\u3063\u305F\u3002\u91CD\u8981\u60C5\u5831\u3092\u63A2\u305B\u3002</p>
            <p className="mb-4 text-xs text-cyber-green/70">60\u79D2\u4EE5\u5185\u306B\u6A5F\u5BC6\u60C5\u5831\u3092\u898B\u3064\u3051\u308D\u3002\u8AAD\u307F\u3059\u304E\u308B\u3068\u691C\u77E5\u3055\u308C\u308B\u3002</p>
            <CyberButton onClick={() => setPhase('explore')}>START</CyberButton>
          </motion.div>
        )}
        {(phase === 'explore' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={timeLeft <= 15 ? 'red' : 'cyan'}>{timeLeft}s</NeonBadge>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-500">FOUND: {emails.filter(e => e.read && e.important).length}/{emails.filter(e => e.important).length}</span>
                {alertLevel > 0 && <NeonBadge color="red">ALERT {alertLevel}</NeonBadge>}
              </div>
            </div>
            <div className="flex gap-2" style={{ height: '360px' }}>
              {/* Inbox list */}
              <div className="w-2/5 overflow-y-auto rounded-l border border-white/10 bg-cyber-card">
                {emails.map(email => (
                  <motion.button key={email.id} onClick={() => openEmail(email)} whileTap={{ scale: 0.98 }}
                    className={`w-full border-b border-white/5 p-2 text-left ${selected?.id === email.id ? 'bg-cyber-cyan/10' : ''} ${email.read ? 'opacity-60' : ''}`}>
                    <p className={`truncate text-[10px] ${email.important && email.read ? 'text-cyber-green' : 'text-gray-400'}`}>{email.from}</p>
                    <p className={`truncate font-mono text-xs ${email.read ? 'text-gray-500' : 'font-bold text-white'}`}>{email.subject}</p>
                  </motion.button>
                ))}
              </div>
              {/* Reading pane */}
              <div className="w-3/5 overflow-y-auto rounded-r border border-white/10 bg-cyber-card/50 p-3">
                {selected ? (
                  <div>
                    <p className="mb-1 font-mono text-xs text-cyber-cyan">{selected.from}</p>
                    <p className="mb-2 text-sm font-bold text-white">{selected.subject}</p>
                    <div className="whitespace-pre-wrap text-xs leading-relaxed text-gray-300">{selected.body}</div>
                    {selected.important && selected.read && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded border border-cyber-green/30 bg-cyber-green/5 p-2">
                        <p className="font-mono text-[10px] text-cyber-green">[INFO EXTRACTED] {selected.infoKey}</p>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <p className="pt-10 text-center text-xs text-gray-600">\u30E1\u30FC\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044</p>
                )}
              </div>
            </div>
            {phase === 'explore' && (
              <CyberButton onClick={() => setPhase('done')} variant="secondary" className="mt-3 w-full">\u63A2\u7D22\u5B8C\u4E86</CyberButton>
            )}
            {phase === 'done' && <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
