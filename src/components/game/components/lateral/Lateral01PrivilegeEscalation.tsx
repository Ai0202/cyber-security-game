'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface NetNode {
  id: string; name: string; type: 'workstation' | 'server' | 'firewall' | 'router' | 'admin';
  explored: boolean; compromised: boolean; info: string;
}

type Phase = 'loading' | 'login' | 'explore' | 'escalate' | 'done';

const icons: Record<string, string> = { workstation: '\u{1F4BB}', server: '\u{1F5A5}\uFE0F', firewall: '\u{1F6E1}\uFE0F', router: '\u{1F4E1}', admin: '\u{1F451}' };

const fallbackNodes: NetNode[] = [
  { id: 'entry', name: '\u53D7\u4ED8\u7AEF\u672B', type: 'workstation', explored: false, compromised: false, info: 'Windows 10 / \u4E00\u822C\u30E6\u30FC\u30B6\u30FC\u6A29\u9650' },
  { id: 'fs', name: '\u30D5\u30A1\u30A4\u30EB\u30B5\u30FC\u30D0\u30FC', type: 'server', explored: false, compromised: false, info: 'Windows Server 2019 / \u6A5F\u5BC6\u60C5\u5831\u683C\u7D0D' },
  { id: 'mail', name: '\u30E1\u30FC\u30EB\u30B5\u30FC\u30D0\u30FC', type: 'server', explored: false, compromised: false, info: 'Linux / \u5168\u8077\u54E1\u30E1\u30FC\u30EB' },
  { id: 'admin', name: '\u7BA1\u7406\u8005\u7AEF\u672B', type: 'admin', explored: false, compromised: false, info: 'Windows 10 / \u30C9\u30E1\u30A4\u30F3\u7BA1\u7406\u8005' },
  { id: 'fw', name: '\u30D5\u30A1\u30A4\u30A2\u30A6\u30A9\u30FC\u30EB', type: 'firewall', explored: false, compromised: false, info: 'FortiGate / \u5916\u90E8\u901A\u4FE1\u5236\u5FA1' },
  { id: 'db', name: '\u30C7\u30FC\u30BF\u30D9\u30FC\u30B9', type: 'server', explored: false, compromised: false, info: 'PostgreSQL / \u696D\u52D9DB' },
];
const fallbackConns = [['entry','fs'],['entry','mail'],['entry','db'],['fs','admin'],['mail','fw'],['db','admin']];
const fallbackPos: Record<string, {x:number;y:number}> = {
  entry:{x:15,y:50}, fs:{x:45,y:20}, mail:{x:45,y:80}, admin:{x:80,y:30}, fw:{x:80,y:70}, db:{x:45,y:50},
};

export default function Lateral01PrivilegeEscalation({ storyContext, previousContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [nodes, setNodes] = useState(fallbackNodes);
  const [conns] = useState(fallbackConns);
  const [positions] = useState(fallbackPos);
  const [selected, setSelected] = useState<NetNode | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [stealth, setStealth] = useState(100);
  const [access, setAccess] = useState<'user'|'admin'>('user');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const r = await fetch(`/api/game/phase/${phaseId}/action`, { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ componentId, action:'init', storyContext, previousResults }) });
        if (!r.ok) throw new Error();
        const d = await r.json();
        if (!c && d.nodes?.length) {
          setNodes(d.nodes.map((n: {id:string;name:string;type:string;info?:string}) => ({
            id:n.id, name:n.name, type:(['workstation','server','firewall','router','admin'].includes(n.type)?n.type:'server') as NetNode['type'],
            explored:false, compromised:false, info:n.info||n.name })));
        }
      } catch { /* use fallback */ }
      if (!c) setPhase('login');
    })();
    return () => { c = true; };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => { ref.current && (ref.current.scrollTop = ref.current.scrollHeight); }, [lines]);
  const log = (l: string) => setLines(p => [...p, l]);

  const handleLogin = () => {
    const cred = previousContext.crackedPassword || previousContext.stolenCredentials;
    log('$ ssh user@192.168.1.10');
    log(cred ? 'Using credentials from previous phase...' : 'Using default credentials...');
    log('[SUCCESS] \u30ED\u30B0\u30A4\u30F3\u6210\u529F - \u4E00\u822C\u30E6\u30FC\u30B6\u30FC\u6A29\u9650');
    setNodes(p => p.map((n, i) => i === 0 ? { ...n, explored: true, compromised: true } : n));
    setPhase('explore');
  };

  const handleExplore = (node: NetNode) => {
    if (node.explored) { setSelected(node); return; }
    log(`$ nmap -sV ${node.name}...`);
    log(`  Discovered: ${node.info}`);
    const penalty = node.type === 'firewall' ? 25 : node.type === 'admin' ? 15 : 10;
    setStealth(p => Math.max(0, p - penalty));
    if (penalty >= 15) log(`[WARNING] \u4E0D\u5BE9\u306A\u30B9\u30AD\u30E3\u30F3\u691C\u77E5\u30EA\u30B9\u30AF: +${penalty}%`);
    setNodes(p => p.map(n => n.id === node.id ? { ...n, explored: true } : n));
    setSelected({ ...node, explored: true });
  };

  const handleEscalate = () => {
    setPhase('escalate');
    log('$ exploit --target admin --method pass-the-hash');
    log('[...] \u6A29\u9650\u6607\u683C\u3092\u8A66\u884C\u4E2D...');
    setTimeout(() => {
      log('[SUCCESS] \u30C9\u30E1\u30A4\u30F3\u7BA1\u7406\u8005\u6A29\u9650\u3092\u53D6\u5F97\uFF01');
      setAccess('admin');
      setNodes(p => p.map(n => n.type === 'admin' ? { ...n, compromised: true } : n));
      setStealth(p => Math.max(0, p - 20));
      setTimeout(() => finish(), 800);
    }, 1500);
  };

  const finish = () => {
    setPhase('done');
    const explored = nodes.filter(n => n.explored).length;
    const s = Math.min(100, 20 + Math.min(30, explored * 6) + 25 + Math.floor(stealth * 0.25));
    const rank = s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const;
    onComplete({ score: s, rank, breakdown: [
      { category: '\u521D\u671F\u4FB5\u5165', points: 20, maxPoints: 20, comment: '\u30ED\u30B0\u30A4\u30F3\u6210\u529F' },
      { category: '\u5075\u5BDF', points: Math.min(30, explored * 6), maxPoints: 30, comment: `${explored}\u30CE\u30FC\u30C9\u3092\u63A2\u7D22` },
      { category: '\u6A29\u9650\u6607\u683C', points: 25, maxPoints: 25, comment: '\u7BA1\u7406\u8005\u6A29\u9650\u53D6\u5F97' },
      { category: '\u30B9\u30C6\u30EB\u30B9\u7DAD\u6301', points: Math.floor(stealth * 0.25), maxPoints: 25, comment: `\u30B9\u30C6\u30EB\u30B9\u6B8B: ${stealth}%` },
    ], contextOutput: { accessLevel: 'admin', discoveredServers: nodes.filter(n => n.explored).map(n => n.name), stealthLevel: stealth } });
  };

  if (phase === 'loading') return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent" />
        <p className="font-mono text-sm text-cyber-cyan">LOADING SCENARIO...</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">PRIVILEGE ESCALATION</h2>
            <p className="mb-2 text-sm text-gray-400">
              {storyContext.targetOrg}\u306E\u30CD\u30C3\u30C8\u30EF\u30FC\u30AF\u306B\u63A5\u7D9A\u3057\u3001\u7BA1\u7406\u8005\u6A29\u9650\u3092\u596A\u53D6\u305B\u3088\u3002
            </p>
            <p className="mb-4 text-xs text-cyber-green/70">\u5185\u90E8\u5075\u5BDF\u3067\u60C5\u5831\u3092\u96C6\u3081\u3001\u6A29\u9650\u6607\u683C\u3092\u72D9\u3048\u3002</p>
            <CyberButton onClick={handleLogin}>\u63A5\u7D9A</CyberButton>
          </motion.div>
        )}
        {(phase === 'explore' || phase === 'escalate' || phase === 'done') && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={access === 'admin' ? 'red' : 'green'}>{access.toUpperCase()}</NeonBadge>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">STEALTH:</span>
                <div className="h-1.5 w-20 overflow-hidden rounded bg-gray-700">
                  <motion.div className={`h-full ${stealth > 50 ? 'bg-cyber-green' : stealth > 25 ? 'bg-yellow-400' : 'bg-red-400'}`} animate={{ width: `${stealth}%` }} />
                </div>
                <span className="font-mono text-xs text-gray-500">{stealth}%</span>
              </div>
            </div>
            <div className="relative mb-4 aspect-[3/2] rounded-lg border border-white/10 bg-cyber-card">
              <svg className="absolute inset-0 h-full w-full">
                {conns.map(([f,t], i) => {
                  const fp = positions[f], tp = positions[t];
                  return fp && tp ? <line key={i} x1={`${fp.x}%`} y1={`${fp.y}%`} x2={`${tp.x}%`} y2={`${tp.y}%`} stroke="rgba(255,255,255,0.1)" strokeWidth="1" /> : null;
                })}
              </svg>
              {nodes.map(node => {
                const pos = positions[node.id];
                return pos ? (
                  <motion.button key={node.id} onClick={() => handleExplore(node)} disabled={phase !== 'explore'}
                    whileHover={phase === 'explore' ? { scale: 1.2 } : undefined}
                    className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border text-sm ${
                      node.compromised ? 'border-red-400/50 bg-red-400/10' : node.explored ? 'border-cyber-green/50 bg-cyber-green/10' : 'border-gray-600 bg-gray-800'
                    }`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} title={node.name}>
                    {icons[node.type]}
                  </motion.button>
                ) : null;
              })}
            </div>
            {selected && phase === 'explore' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 rounded border border-white/10 bg-cyber-card/80 p-3 text-xs">
                <p className="font-mono text-cyber-green">{selected.name}</p>
                <p className="text-gray-400">{selected.info}</p>
              </motion.div>
            )}
            {phase === 'explore' && nodes.filter(n => n.explored).length >= 3 && (
              <CyberButton onClick={handleEscalate} variant="danger" className="mb-3 w-full">\u6A29\u9650\u6607\u683C\u3092\u8A66\u884C</CyberButton>
            )}
            <div ref={ref} className="h-32 overflow-y-auto rounded border border-white/10 bg-black p-2 font-mono text-xs">
              {lines.map((l, i) => (
                <p key={i} className={l.includes('SUCCESS') ? 'text-cyber-green' : l.includes('WARNING') ? 'text-yellow-400' : 'text-gray-500'}>{l}</p>
              ))}
            </div>
            {phase === 'done' && <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
