'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import NeonBadge from '@/components/ui/NeonBadge';
import CyberButton from '@/components/ui/CyberButton';

interface Choice { text: string; suspicion: number; info: string; infoKey: string }
interface DialogRound { prompt: string; choices: Choice[] }

function fallbackDialog(targetOrg: string): DialogRound[] {
  return [
    { prompt: `こちら${targetOrg}のIT管理部です。システム更新の件でお電話しました。お名前をお伺いしてもよろしいですか？`, choices: [
      { text: 'IT管理部の田中と申します。セキュリティ監査の一環です', suspicion: 0, info: '看護師 佐藤さん', infoKey: 'targetName' },
      { text: '名前は言えません。とにかく急ぎです', suspicion: 15, info: '', infoKey: '' },
      { text: '外部の委託業者です。担当者名は控えます', suspicion: 5, info: '看護師 佐藤さん', infoKey: 'targetName' },
    ]},
    { prompt: 'あ、はい。3F病棟の佐藤です。何のシステムの件でしょうか？', choices: [
      { text: '電子カルテシステムのパスワードリセットが必要です。現在のIDを教えてください', suspicion: 5, info: 'ID: sato_nurse03', infoKey: 'userId' },
      { text: '全社的なVPN設定変更です。お使いのPCのOSバージョンを教えてください', suspicion: 0, info: 'Windows 10 Pro', infoKey: 'osVersion' },
      { text: '今すぐパスワードを変更してください！さもないとアカウントが停止されます', suspicion: 20, info: '', infoKey: '' },
    ]},
    { prompt: 'そうなんですね。何か必要な情報はありますか？', choices: [
      { text: '普段ログインに使っているパスワードの最初の3文字だけ確認させてください', suspicion: 10, info: 'パスワード先頭: sat', infoKey: 'passwordHint' },
      { text: 'リモートアクセスで使っているVPNの接続先を教えていただけますか', suspicion: 0, info: 'VPN: vpn.hospital-internal.jp', infoKey: 'vpnEndpoint' },
      { text: 'パスワードを全部教えてください', suspicion: 25, info: '', infoKey: '' },
    ]},
    { prompt: 'ほかに何かありますか？少し忙しいのですが...', choices: [
      { text: 'あと1点だけ。部署のメーリングリストのアドレスを教えていただけますか', suspicion: 0, info: 'ML: 3f-ward@hospital.jp', infoKey: 'mailingList' },
      { text: '上司の山田部長にも同じ案内が必要なのですが、内線番号は分かりますか', suspicion: 5, info: '内線: 3201', infoKey: 'extensionNumber' },
      { text: '患者データベースのアクセス権限を一時的にこちらに移してください', suspicion: 20, info: '', infoKey: '' },
    ]},
    { prompt: '分かりました。他に何かあれば...', choices: [
      { text: 'ご協力ありがとうございます。作業が完了したらメールでご報告します', suspicion: -5, info: '', infoKey: 'goodEnding' },
      { text: 'では失礼します', suspicion: 0, info: '', infoKey: '' },
      { text: 'あ、もう一つ。サーバールームの入室コードを教えてもらえますか', suspicion: 15, info: '', infoKey: '' },
    ]},
  ];
}

export default function Recon05Pretexting({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<'loading' | 'intro' | 'playing' | 'done'>('loading');
  const [dialog, setDialog] = useState<DialogRound[]>([]);
  const [round, setRound] = useState(0);
  const [suspicion, setSuspicion] = useState(0);
  const [extractedInfo, setExtractedInfo] = useState<Record<string, string>>({});
  const [chatLog, setChatLog] = useState<{ role: 'target' | 'player'; text: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchScenario() {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ componentId, action: 'init', storyContext, previousResults }),
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (cancelled) return;
        if (data.dialog?.length) { setDialog(data.dialog); } else { setDialog(fallbackDialog(storyContext.targetOrg)); }
        setPhase('intro');
      } catch {
        if (cancelled) return;
        setDialog(fallbackDialog(storyContext.targetOrg));
        setPhase('intro');
      }
    }
    fetchScenario();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const startPlaying = () => {
    setPhase('playing');
    if (dialog.length > 0) setChatLog([{ role: 'target', text: dialog[0].prompt }]);
  };

  const finishGame = useCallback(() => {
    const infoCount = Object.keys(extractedInfo).filter((k) => k !== 'goodEnding').length;
    const infoPts = Math.min(40, infoCount * 10);
    const suspicionPts = suspicion <= 5 ? 30 : suspicion <= 15 ? 20 : suspicion <= 30 ? 10 : 0;
    const convincePts = infoCount >= 3 && suspicion <= 10 ? 30 : infoCount >= 2 ? 20 : 10;
    const score = Math.max(0, Math.min(100, infoPts + suspicionPts + convincePts));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D' as const;
    onComplete({
      score, rank,
      breakdown: [
        { category: '情報抽出', points: infoPts, maxPoints: 40, comment: `${infoCount}件の情報を取得` },
        { category: '低疑惑ボーナス', points: suspicionPts, maxPoints: 30, comment: `疑惑レベル: ${suspicion}` },
        { category: 'なりすまし説得力', points: convincePts, maxPoints: 30, comment: convincePts >= 30 ? '非常に自然な会話' : '改善の余地あり' },
      ],
      contextOutput: { extractedInfo, targetSuspicionLevel: suspicion },
    });
  }, [extractedInfo, suspicion, onComplete]);

  useEffect(() => { if (phase === 'done') finishGame(); }, [phase, finishGame]);

  const handleChoice = (choice: Choice) => {
    setChatLog((prev) => [...prev, { role: 'player', text: choice.text }]);
    setSuspicion((s) => Math.max(0, s + choice.suspicion));
    if (choice.info && choice.infoKey) setExtractedInfo((prev) => ({ ...prev, [choice.infoKey]: choice.info }));
    const nextRound = round + 1;
    if (nextRound >= dialog.length) {
      setTimeout(() => setPhase('done'), 500);
    } else {
      setRound(nextRound);
      setTimeout(() => { setChatLog((prev) => [...prev, { role: 'target', text: dialog[nextRound].prompt }]); }, 600);
    }
  };

  const suspicionColor = suspicion <= 10 ? 'green' : suspicion <= 25 ? 'yellow' : 'red';

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-magenta">PRETEXTING CALL</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}の職員になりすまし、電話で情報を聞き出せ。</p>
            <p className="mb-4 text-xs text-cyber-green/70">疑惑レベルを上げずに、できるだけ多くの情報を引き出す。</p>
            <p className="mb-6 text-xs text-gray-500">全{dialog.length}ラウンド / 選択肢によって疑惑と情報量が変化</p>
            <CyberButton variant="danger" onClick={startPlaying}>CALL START</CyberButton>
          </motion.div>
        )}

        {(phase === 'playing' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="font-mono text-xs text-red-400">通話中</span>
              </div>
              <NeonBadge color={suspicionColor as 'green' | 'yellow' | 'red'}>疑惑: {suspicion}</NeonBadge>
            </div>

            {/* Chat log */}
            <div className="mb-3 h-56 overflow-y-auto rounded-lg border border-white/10 bg-black p-3 space-y-2">
              {chatLog.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                    msg.role === 'player' ? 'bg-cyber-green/20 text-cyber-green' : 'bg-white/10 text-gray-300'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Choices */}
            {phase === 'playing' && round < dialog.length && (
              <div className="space-y-2">
                {dialog[round].choices.map((choice, i) => (
                  <motion.button key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    onClick={() => handleChoice(choice)}
                    className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 text-left text-xs text-gray-300 transition-colors hover:border-cyber-cyan/50 hover:bg-cyber-card/80">
                    {choice.text}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Extracted info bar */}
            {Object.keys(extractedInfo).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {Object.entries(extractedInfo).filter(([k]) => k !== 'goodEnding').map(([key, val]) => (
                  <NeonBadge key={key} color="cyan">{val}</NeonBadge>
                ))}
              </div>
            )}

            {phase === 'done' && (
              <div className="mt-4 text-center"><NeonBadge color="green">CALL ENDED - PHASE COMPLETE</NeonBadge></div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
