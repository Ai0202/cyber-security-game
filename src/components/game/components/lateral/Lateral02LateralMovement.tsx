'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface LNode { id: string; name: string; tier: number; compromised: boolean; adjacent: string[]; risk: number; }
type Method = 'hash' | 'rat' | 'cred';
type Phase = 'loading' | 'intro' | 'spread' | 'done';

const methods: { id: Method; name: string; speed: string; stealth: number; label: string }[] = [
  { id: 'hash', name: 'Pass the Hash', speed: '\u9AD8\u901F', stealth: -20, label: '\u9AD8\u901F\u30FB\u30EA\u30B9\u30AF\u5927' },
  { id: 'rat', name: 'Remote Access Tool', speed: '\u4F4E\u901F', stealth: -5, label: '\u4F4E\u901F\u30FB\u30B9\u30C6\u30EB\u30B9' },
  { id: 'cred', name: 'Shared Credential', speed: '\u666E\u901A', stealth: -12, label: '\u4E2D\u9593\u30FB\u5B89\u5B9A' },
];

const fallbackNodes: LNode[] = [
  { id: 'pc0', name: '\u611F\u67D3PC', tier: 1, compromised: true, adjacent: ['pc1','printer','web'], risk: 0 },
  { id: 'pc1', name: '\u96A3\u306E\u793E\u54E1PC', tier: 2, compromised: false, adjacent: ['pc0','dc','fs'], risk: 15 },
  { id: 'printer', name: '\u5171\u6709\u30D7\u30EA\u30F3\u30BF', tier: 2, compromised: false, adjacent: ['pc0','web'], risk: 5 },
  { id: 'web', name: '\u5185\u90E8Web\u30B5\u30FC\u30D0\u30FC', tier: 2, compromised: false, adjacent: ['pc0','printer','dc','backup'], risk: 20 },
  { id: 'dc', name: '\u30C9\u30E1\u30A4\u30F3\u30B3\u30F3\u30C8\u30ED\u30FC\u30E9\u30FC', tier: 3, compromised: false, adjacent: ['pc1','web'], risk: 35 },
  { id: 'fs', name: '\u30D5\u30A1\u30A4\u30EB\u30B5\u30FC\u30D0\u30FC', tier: 3, compromised: false, adjacent: ['pc1','backup'], risk: 25 },
  { id: 'backup', name: '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7\u30B5\u30FC\u30D0\u30FC', tier: 3, compromised: false, adjacent: ['web','fs'], risk: 20 },
];

const nodePos: Record<string, {x:number;y:number}> = {
  pc0:{x:15,y:50}, pc1:{x:45,y:20}, printer:{x:45,y:50}, web:{x:45,y:80},
  dc:{x:80,y:20}, fs:{x:80,y:50}, backup:{x:80,y:80},
};

export default function Lateral02LateralMovement({ storyContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [nodes, setNodes] = useState(fallbackNodes);
  const [stealth, setStealth] = useState(100);
  const [target, setTarget] = useState<LNode | null>(null);
  const [usedMethods, setUsedMethods] = useState<Set<Method>>(new Set());
  const [log, setLog] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await fetch(`/api/game/phase/${phaseId}/action`, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ componentId, action:'init', storyContext, previousResults }) });
        if (!r.ok) throw new Error();
        if (!c) { /* could use API nodes */ }
      } catch { /* fallback */ }
      if (!c) setPhase('intro');
    })();
    return () => { c = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  const addLog = (l: string) => setLog(p => [...p, l]);

  const canAttack = (node: LNode) => {
    if (node.compromised) return false;
    return node.adjacent.some(a => nodes.find(n => n.id === a)?.compromised);
  };

  const attack = (method: Method) => {
    if (!target || target.compromised) return;
    const m = methods.find(x => x.id === method)!;
    const pen = m.stealth + Math.floor(target.risk * 0.3);
    setStealth(p => Math.max(0, p + pen));
    setUsedMethods(p => new Set([...p, method]));
    addLog(`$ ${m.name} -> ${target.name}`);

    const success = Math.random() > target.risk / 100;
    if (success) {
      addLog(`[SUCCESS] ${target.name} \u3092\u4FB5\u5BB3\u3057\u307E\u3057\u305F`);
      setNodes(p => p.map(n => n.id === target.id ? { ...n, compromised: true } : n));
    } else {
      addLog(`[WARNING] ${target.name} \u3078\u306E\u653B\u6483\u304C\u691C\u77E5\u3055\u308C\u307E\u3057\u305F`);
      setStealth(p => Math.max(0, p - 10));
      setNodes(p => p.map(n => n.id === target.id ? { ...n, compromised: true } : n));
    }
    setTarget(null);
  };

  const finish = useCallback(() => {
    const comp = nodes.filter(n => n.compromised).length;
    const elapsed = (Date.now() - startTime) / 1000;
    const nodePoints = Math.min(40, comp * 10);
    const stealthPts = Math.floor(stealth * 0.3);
    const varietyPts = Math.min(15, usedMethods.size * 5);
    const speedPts = elapsed < 30 ? 15 : elapsed < 60 ? 10 : elapsed < 90 ? 5 : 0;
    const s = Math.max(0, Math.min(100, nodePoints + stealthPts + varietyPts + speedPts));
    const rank = s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const;
    onComplete({ score: s, rank, breakdown: [
      { category: '\u30CE\u30FC\u30C9\u4FB5\u5BB3', points: nodePoints, maxPoints: 40, comment: `${comp}\u30CE\u30FC\u30C9\u3092\u4FB5\u5BB3` },
      { category: '\u30B9\u30C6\u30EB\u30B9', points: stealthPts, maxPoints: 30, comment: `\u6B8B: ${stealth}%` },
      { category: '\u624B\u6CD5\u306E\u591A\u69D8\u6027', points: varietyPts, maxPoints: 15, comment: `${usedMethods.size}\u7A2E\u985E\u4F7F\u7528` },
      { category: '\u30B9\u30D4\u30FC\u30C9', points: speedPts, maxPoints: 15, comment: `${Math.floor(elapsed)}\u79D2` },
    ], contextOutput: { compromisedHosts: nodes.filter(n => n.compromised).map(n => n.name), discoveredServices: nodes.filter(n => n.compromised).map(n => n.name) } });
  }, [nodes, stealth, usedMethods, startTime, onComplete]);

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
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">LATERAL MOVEMENT</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}\u306E\u5185\u90E8\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u3067\u6A2A\u5C55\u958B\u3092\u884C\u3048\u3002</p>
            <p className="mb-4 text-xs text-cyber-green/70">\u611F\u67D3\u7AEF\u672B\u304B\u3089\u96A3\u63A5\u30CE\u30FC\u30C9\u3078\u653B\u6483\u3092\u5E83\u3052\u308D\u30024+\u30CE\u30FC\u30C9\u304C\u76EE\u6A19\u3002</p>
            <CyberButton onClick={() => setPhase('spread')}>START</CyberButton>
          </motion.div>
        )}
        {(phase === 'spread' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color="cyan">COMPROMISED: {nodes.filter(n=>n.compromised).length}/{nodes.length}</NeonBadge>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">STEALTH:</span>
                <div className="h-1.5 w-20 overflow-hidden rounded bg-gray-700">
                  <motion.div className={`h-full ${stealth>50?'bg-cyber-green':stealth>25?'bg-yellow-400':'bg-red-400'}`} animate={{width:`${stealth}%`}} />
                </div>
                <span className="font-mono text-xs text-gray-500">{stealth}%</span>
              </div>
            </div>
            <div className="relative mb-4 aspect-[3/2] rounded-lg border border-white/10 bg-cyber-card">
              <svg className="absolute inset-0 h-full w-full">
                {nodes.flatMap(n => n.adjacent.map(a => {
                  const fp = nodePos[n.id], tp = nodePos[a];
                  if (!fp || !tp || n.id > a) return null;
                  return <line key={`${n.id}-${a}`} x1={`${fp.x}%`} y1={`${fp.y}%`} x2={`${tp.x}%`} y2={`${tp.y}%`} stroke={n.compromised && nodes.find(x=>x.id===a)?.compromised ? '#ef4444' : 'rgba(255,255,255,0.1)'} strokeWidth="1" />;
                }))}
              </svg>
              {nodes.map(node => {
                const pos = nodePos[node.id]; if (!pos) return null;
                return (
                  <motion.button key={node.id} onClick={() => phase==='spread' && canAttack(node) && setTarget(node)}
                    whileHover={canAttack(node)?{scale:1.2}:undefined}
                    className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border text-sm ${
                      node.compromised ? 'border-red-400/50 bg-red-400/10' : canAttack(node) ? 'border-cyber-cyan/50 bg-cyber-cyan/10' : 'border-gray-600 bg-gray-800'
                    } ${target?.id===node.id ? 'ring-2 ring-cyber-magenta' : ''}`}
                    style={{ left:`${pos.x}%`, top:`${pos.y}%` }} title={node.name}>
                    {node.compromised ? '\u{1F534}' : node.tier===1 ? '\u{1F4BB}' : node.tier===2 ? '\u{1F5A5}\uFE0F' : '\u{1F451}'}
                  </motion.button>
                );
              })}
            </div>
            {target && phase === 'spread' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded border border-white/10 bg-cyber-card/80 p-3">
                <p className="mb-2 font-mono text-xs text-cyber-cyan">{target.name} - \u691C\u77E5\u30EA\u30B9\u30AF: {target.risk}%</p>
                <div className="flex gap-2">
                  {methods.map(m => (
                    <CyberButton key={m.id} variant={m.id==='hash'?'danger':'secondary'} onClick={() => attack(m.id)} className="flex-1 px-2 py-1.5 text-[10px]">
                      {m.name}
                    </CyberButton>
                  ))}
                </div>
              </motion.div>
            )}
            {phase === 'spread' && nodes.filter(n => n.compromised).length >= 4 && (
              <CyberButton onClick={() => { setPhase('done'); setTimeout(finish, 300); }} variant="primary" className="mb-3 w-full">\u5B8C\u4E86</CyberButton>
            )}
            <div className="h-24 overflow-y-auto rounded border border-white/10 bg-black p-2 font-mono text-xs">
              {log.map((l, i) => <p key={i} className={l.includes('SUCCESS')?'text-cyber-green':l.includes('WARNING')?'text-yellow-400':'text-gray-500'}>{l}</p>)}
            </div>
            {phase === 'done' && <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
