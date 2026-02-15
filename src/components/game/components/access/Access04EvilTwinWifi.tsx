'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

type Phase = 'loading' | 'briefing' | 'setup' | 'waiting' | 'capture' | 'done';
interface Device { name: string; ip: string; hasCredentials: boolean; service?: string; username?: string; }

const realSSIDs = ['Sakura-Hospital-WiFi', 'Sakura-Guest'];
const fallbackDevices: Device[] = [
  { name: 'iPhone-Nurse01', ip: '192.168.1.12', hasCredentials: true, service: '電子カルテ', username: 'nurse_tanaka' },
  { name: 'Android-Doctor', ip: '192.168.1.15', hasCredentials: true, service: 'メール', username: 'dr.suzuki' },
  { name: 'iPad-Reception', ip: '192.168.1.18', hasCredentials: false },
  { name: 'MacBook-Admin', ip: '192.168.1.22', hasCredentials: false },
];

export default function Access04EvilTwinWifi({
  storyContext, phaseId, componentId, previousResults, onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [ssid, setSsid] = useState('');
  const [encryption, setEncryption] = useState(false);
  const [devices, setDevices] = useState<Device[]>(fallbackDevices);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [connectIdx, setConnectIdx] = useState(0);

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
        if (!cancelled && data.devices) setDevices(data.devices);
      } catch { /* use fallback */ }
      if (!cancelled) setPhase('briefing');
    })();
    return () => { cancelled = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const startWaiting = () => {
    setPhase('waiting');
    setConnectedDevices([]);
    setConnectIdx(0);
  };

  useEffect(() => {
    if (phase !== 'waiting') return;
    if (connectIdx >= devices.length) {
      const timer = setTimeout(() => setPhase('capture'), 800);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setConnectedDevices(prev => [...prev, devices[connectIdx]]);
      setConnectIdx(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [phase, connectIdx, devices]);

  const finishCapture = () => {
    const ssidLower = ssid.toLowerCase();
    const realLower = realSSIDs.map(s => s.toLowerCase());
    // SSID similarity (0-30)
    const hasMatch = realLower.some(r => ssidLower.includes(r.split('-')[0]) || r.includes(ssidLower.split('-')[0]));
    const exactMatch = realLower.includes(ssidLower);
    const s1 = exactMatch ? 30 : hasMatch ? 22 : ssid.length > 3 ? 10 : 3;
    // Capture success (0-30) - no encryption = more traffic captured
    const captured = connectedDevices.filter(d => d.hasCredentials);
    const s2 = !encryption ? Math.min(30, captured.length * 15) : Math.min(15, captured.length * 8);
    // Setup choices (0-20)
    const s3 = !encryption ? 20 : 10;
    // Stealth (0-20) - similar SSID + open = stealthy
    const s4 = (hasMatch || exactMatch) && !encryption ? 18 : hasMatch ? 12 : 6;
    const score = Math.min(100, Math.max(0, s1 + s2 + s3 + s4));
    const rank = score >= 90 ? 'S' : score >= 70 ? 'A' : score >= 50 ? 'B' : score >= 30 ? 'C' : 'D';
    setPhase('done');
    onComplete({ score, rank, breakdown: [
      { category: 'SSID類似性', points: s1, maxPoints: 30, comment: exactMatch ? '完全一致' : hasMatch ? '部分一致' : '類似性低い' },
      { category: '認証情報キャプチャ', points: s2, maxPoints: 30, comment: `${captured.length}件の認証情報を取得` },
      { category: 'AP設定', points: s3, maxPoints: 20, comment: !encryption ? '暗号化なし=通信傍受可能' : '暗号化あり=傍受困難' },
      { category: 'ステルス性', points: s4, maxPoints: 20, comment: s4 >= 15 ? '検知されにくい設定' : '改善の余地あり' },
    ], contextOutput: {
      capturedCredentials: captured.map(d => ({ service: d.service || 'unknown', username: d.username || 'unknown' })),
      connectedDevices: connectedDevices.length,
    }});
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
            <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">EVIL TWIN WI-FI</h2>
            <p className="mb-4 text-sm text-gray-400">偽のWi-Fiアクセスポイントを設置し、接続してきたデバイスの認証情報を傍受せよ</p>
            <div className="mb-4 rounded-lg border border-white/10 bg-cyber-card p-4">
              <h3 className="mb-2 font-mono text-xs text-cyber-cyan">DETECTED NETWORKS</h3>
              {realSSIDs.map(s => (
                <div key={s} className="flex items-center gap-2 py-1 text-sm">
                  <span className="text-cyber-green">&#9679;</span><span className="text-gray-300">{s}</span>
                  <span className="ml-auto font-mono text-xs text-gray-500">-42dBm</span>
                </div>
              ))}
            </div>
            <CyberButton onClick={() => setPhase('setup')} className="w-full">AP設置開始</CyberButton>
          </motion.div>
        )}
        {phase === 'setup' && (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-4 font-mono text-xs tracking-widest text-cyber-magenta">SETUP ACCESS POINT</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-xs text-gray-500">SSID名</label>
                <input type="text" value={ssid} onChange={e => setSsid(e.target.value)} placeholder="例: Sakura-Hospital-WiFi"
                  className="w-full rounded border border-white/10 bg-cyber-card px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-cyber-green/50 focus:outline-none" />
                <p className="mt-1 font-mono text-xs text-gray-600">近くのSSID: {realSSIDs.join(', ')}</p>
              </div>
              <div className="flex items-center justify-between rounded border border-white/10 bg-cyber-card px-3 py-2">
                <span className="font-mono text-xs text-gray-400">暗号化 (WPA2)</span>
                <button onClick={() => setEncryption(!encryption)}
                  className={`rounded px-3 py-1 font-mono text-xs ${encryption ? 'bg-cyber-green/20 text-cyber-green' : 'bg-red-500/20 text-red-400'}`}>
                  {encryption ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
            <CyberButton onClick={startWaiting} className="mt-6 w-full" disabled={!ssid} variant="danger">AP起動</CyberButton>
          </motion.div>
        )}
        {phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-4 font-mono text-xs tracking-widest text-cyber-cyan">SSID: {ssid}</h2>
            <div className="mb-4 rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-xs">
              <p className="text-cyber-green mb-2">AP active. Waiting for connections...</p>
              {connectedDevices.map((d, i) => (
                <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400">
                  [+] {d.name} ({d.ip}) connected
                </motion.p>
              ))}
              {connectIdx < devices.length && (
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-gray-600">_</motion.span>
              )}
            </div>
            <NeonBadge color="cyan">{connectedDevices.length} DEVICES CONNECTED</NeonBadge>
          </motion.div>
        )}
        {phase === 'capture' && (
          <motion.div key="capture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="mb-4 font-mono text-xs tracking-widest text-cyber-magenta">CAPTURED TRAFFIC</h2>
            <div className="mb-4 space-y-2">
              {connectedDevices.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
                  className={`rounded-lg border p-3 ${d.hasCredentials ? 'border-cyber-green/30 bg-cyber-green/5' : 'border-white/10 bg-cyber-card'}`}>
                  <p className="font-mono text-xs text-gray-400">{d.name} - {d.ip}</p>
                  {d.hasCredentials ? (
                    <div className="mt-1">
                      <NeonBadge color="green">CREDENTIALS FOUND</NeonBadge>
                      <p className="mt-1 font-mono text-xs text-cyber-green">{d.service}: {d.username}</p>
                    </div>
                  ) : <p className="mt-1 font-mono text-xs text-gray-600">No login traffic detected</p>}
                </motion.div>
              ))}
            </div>
            <CyberButton onClick={finishCapture} className="w-full" variant="danger">分析完了</CyberButton>
          </motion.div>
        )}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[40vh] items-center justify-center">
            <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
