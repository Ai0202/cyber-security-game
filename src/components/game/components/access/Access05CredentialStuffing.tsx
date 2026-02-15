'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface Profile {
  name: string; birthday: string; petName: string;
  hobby: string; favoriteTeam: string;
}
type AttackMode = 'manual' | 'dictionary' | 'bruteforce';
type Phase = 'loading' | 'profile' | 'attack' | 'cracking' | 'done';

const fallbackProfile: Profile = {
  name: '佐藤花子', birthday: '1990-03-15', petName: 'モモ',
  hobby: 'ヨガ', favoriteTeam: '横浜DeNA',
};
const fallbackPasswords = ['momo0315', 'hanako1990', 'yokohama315'];
const dummyList = ['password123', '123456', 'qwerty', 'admin', 'letmein', 'welcome1', 'abc123'];

export default function Access05CredentialStuffing({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [profile, setProfile] = useState<Profile>(fallbackProfile);
  const [correctPws, setCorrectPws] = useState<string[]>(fallbackPasswords);
  const [dictList, setDictList] = useState<string[]>([]);
  const [mode, setMode] = useState<AttackMode>('manual');
  const [input, setInput] = useState('');
  const [attempts, setAttempts] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>([]);
  const termRef = useRef<HTMLDivElement>(null);

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
        if (!cancelled && data.profile) setProfile({ ...fallbackProfile, ...data.profile });
        if (!cancelled && data.passwords) {
          const pws = data.passwords.map((p: { password: string }) => p.password);
          setCorrectPws(pws);
          setDictList([...dummyList, ...pws].sort(() => Math.random() - 0.5));
        } else if (!cancelled) {
          setDictList([...dummyList, ...fallbackPasswords].sort(() => Math.random() - 0.5));
        }
      } catch {
        if (!cancelled) setDictList([...dummyList, ...fallbackPasswords].sort(() => Math.random() - 0.5));
      }
      if (!cancelled) setPhase('profile');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => { termRef.current?.scrollTo(0, termRef.current.scrollHeight); }, [lines]);

  const addLine = (l: string) => setLines(prev => [...prev, l]);
  const check = (pw: string) => correctPws.some(c => c.toLowerCase() === pw.toLowerCase());

  const finish = (count: number, m: AttackMode) => {
    const score = m === 'manual' ? (count === 1 ? 100 : count <= 3 ? 70 : 40) : m === 'dictionary' ? 20 : 10;
    const clamped = Math.min(100, Math.max(0, score));
    const rank = clamped >= 90 ? 'S' : clamped >= 70 ? 'A' : clamped >= 50 ? 'B' : clamped >= 30 ? 'C' : 'D';
    const ml = m === 'manual' ? '手動推測' : m === 'dictionary' ? '辞書攻撃' : '総当たり';
    onComplete({ score: clamped, rank, breakdown: [
      { category: '攻撃手法', points: m === 'manual' ? 30 : m === 'dictionary' ? 15 : 5, maxPoints: 30, comment: `${ml}を使用` },
      { category: '試行回数', points: Math.max(0, 40 - (count - 1) * 10), maxPoints: 40, comment: `${count}回で突破` },
      { category: '推測精度', points: clamped >= 70 ? 30 : clamped >= 40 ? 20 : 10, maxPoints: 30, comment: clamped >= 70 ? 'プロフィールからの的確な推測' : '改善の余地あり' },
    ], contextOutput: { crackedPassword: correctPws[0], accountAccess: true } });
  };

  const handleManual = () => {
    if (!input.trim()) return;
    const pw = input.trim();
    const newAttempts = [...attempts, pw];
    setAttempts(newAttempts); setInput('');
    addLine(`$ crack --password "${pw}"`);
    if (check(pw)) { addLine('[SUCCESS] パスワード一致!'); setPhase('done'); finish(newAttempts.length, 'manual'); }
    else { addLine(`[FAILED] "${pw}" 不一致`); if (newAttempts.length >= 5) addLine('[INFO] 試行上限。辞書攻撃に切替を。'); }
  };

  const handleDict = () => {
    setMode('dictionary'); setPhase('cracking');
    let i = 0;
    const iv = setInterval(() => {
      if (i >= dictList.length) { clearInterval(iv); addLine('[COMPLETE] 辞書攻撃完了'); setPhase('done'); finish(dictList.length, 'dictionary'); return; }
      const pw = dictList[i];
      addLine(`$ dict: "${pw}"...`);
      if (check(pw)) { addLine(`[SUCCESS] "${pw}" で成功!`); clearInterval(iv); setPhase('done'); finish(i + 1, 'dictionary'); return; }
      addLine('  -> FAILED'); i++;
    }, 400);
  };

  const handleBrute = () => {
    setMode('bruteforce'); setPhase('cracking');
    addLine('$ bruteforce --charset=alphanumeric');
    let c = 0;
    const iv = setInterval(() => {
      c++; addLine(`  [${c * 12847}] ${Math.random().toString(36).slice(2, 10)}`);
      if (c >= 6) { clearInterval(iv); addLine(`[SUCCESS] "${correctPws[0]}" で成功!`); setPhase('done'); finish(c * 12847, 'bruteforce'); }
    }, 500);
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
        {phase === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-cyan">CREDENTIAL STUFFING</h2>
            <p className="mb-4 text-sm text-gray-400">ターゲットのSNSプロフィールからパスワードを推測し、アカウントを乗っ取れ</p>
            <div className="mb-6 rounded-lg border border-white/10 bg-cyber-card p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyber-magenta/20 font-mono text-lg text-cyber-magenta">{profile.name.charAt(0)}</div>
                <div><p className="font-bold text-white">{profile.name}</p></div>
              </div>
              <dl className="space-y-1.5 text-sm">
                {([['誕生日', profile.birthday], ['ペット', profile.petName], ['趣味', profile.hobby], ['推しチーム', profile.favoriteTeam]] as const).map(([l, v]) => (
                  <div key={l} className="flex gap-2"><dt className="text-gray-500">{l}:</dt><dd className="text-gray-300">{v}</dd></div>
                ))}
              </dl>
            </div>
            <CyberButton onClick={() => setPhase('attack')} className="w-full">攻撃開始</CyberButton>
          </motion.div>
        )}
        {(phase === 'attack' || phase === 'cracking' || phase === 'done') && (
          <motion.div key="attack" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {phase === 'attack' && (
              <div className="mb-4 flex gap-2">
                {([['manual', '手動推測'], ['dictionary', '辞書攻撃'], ['bruteforce', '総当たり']] as const).map(([m, label]) => (
                  <button key={m} onClick={() => setMode(m)} className={`rounded border px-3 py-1 font-mono text-xs ${mode === m ? 'border-cyber-green text-cyber-green' : 'border-gray-700 text-gray-500'}`}>{label}</button>
                ))}
              </div>
            )}
            <div ref={termRef} className="mb-4 h-56 overflow-y-auto rounded-lg border border-white/10 bg-black p-3 font-mono text-xs">
              <p className="text-cyber-green">$ target: {storyContext.targetOrg}</p>
              {lines.map((l, i) => <p key={i} className={l.includes('SUCCESS') ? 'text-cyber-green' : l.includes('FAILED') ? 'text-red-400' : 'text-gray-400'}>{l}</p>)}
            </div>
            {phase === 'attack' && mode === 'manual' && (
              <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleManual()}
                  placeholder="パスワードを入力..." className="flex-1 rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none" />
                <CyberButton onClick={handleManual} disabled={attempts.length >= 5}>CRACK</CyberButton>
              </div>
            )}
            {phase === 'attack' && mode === 'dictionary' && <CyberButton onClick={handleDict} className="w-full" variant="danger">辞書攻撃を実行</CyberButton>}
            {phase === 'attack' && mode === 'bruteforce' && <CyberButton onClick={handleBrute} className="w-full" variant="danger">総当たり実行</CyberButton>}
            {attempts.length > 0 && <p className="mt-2 text-right font-mono text-xs text-gray-500">試行: {attempts.length}/5</p>}
            {phase === 'done' && <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
