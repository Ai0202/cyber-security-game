'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface FNode { id: string; name: string; type: 'folder' | 'file'; children?: FNode[]; value?: 'high' | 'medium' | 'low'; ext?: string; }
type Phase = 'loading' | 'intro' | 'explore' | 'done';

const fallbackTree: FNode[] = [
  { id: 'root', name: '\u5171\u6709\u30D5\u30A9\u30EB\u30C0', type: 'folder', children: [
    { id: 'acc', name: '\u7D4C\u7406\u90E8', type: 'folder', children: [
      { id: 'f1', name: '\u4E88\u7B97\u66F8.xlsx', type: 'file', value: 'medium', ext: 'xlsx' },
      { id: 'f2', name: '\u53E3\u5EA7\u60C5\u5831.csv', type: 'file', value: 'high', ext: 'csv' },
    ]},
    { id: 'hr', name: '\u4EBA\u4E8B\u90E8', type: 'folder', children: [
      { id: 'f3', name: '\u5F93\u696D\u54E1\u540D\u7C3F.xlsx', type: 'file', value: 'high', ext: 'xlsx' },
      { id: 'f4', name: '\u7D66\u4E0E\u30C7\u30FC\u30BF.csv', type: 'file', value: 'high', ext: 'csv' },
    ]},
    { id: 'it', name: 'IT\u90E8', type: 'folder', children: [
      { id: 'f5', name: '\u30B5\u30FC\u30D0\u30FC\u69CB\u6210\u56F3.pdf', type: 'file', value: 'medium', ext: 'pdf' },
      { id: 'f6', name: '\u30D1\u30B9\u30EF\u30FC\u30C9\u4E00\u89A7.txt', type: 'file', value: 'high', ext: 'txt' },
    ]},
    { id: 'biz', name: '\u7D4C\u55B6\u4F01\u753B', type: 'folder', children: [
      { id: 'f7', name: '\u65B0\u898F\u4E8B\u696D\u8A08\u753B.pptx', type: 'file', value: 'medium', ext: 'pptx' },
      { id: 'f8', name: 'M&A\u691C\u8A0E\u8CC7\u6599.docx', type: 'file', value: 'high', ext: 'docx' },
    ]},
    { id: 'bk', name: '\u30D0\u30C3\u30AF\u30A2\u30C3\u30D7', type: 'folder', children: [
      { id: 'f9', name: 'daily_backup.tar.gz', type: 'file', value: 'high', ext: 'tar.gz' },
    ]},
  ]},
];

const extIcons: Record<string, string> = { xlsx: '\u{1F4CA}', csv: '\u{1F4C4}', pdf: '\u{1F4D1}', txt: '\u{1F4DD}', pptx: '\u{1F4CA}', docx: '\u{1F4C3}', 'tar.gz': '\u{1F4E6}' };
const valColors: Record<string, 'red' | 'yellow' | 'green'> = { high: 'red', medium: 'yellow', low: 'green' };

export default function Lateral04DataDiscovery({ storyContext, phaseId, componentId, previousResults, onComplete }: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [tree] = useState(fallbackTree);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [targets, setTargets] = useState<Set<string>>(new Set());
  const [clicks, setClicks] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FNode | null>(null);

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

  const allFiles = useCallback((): FNode[] => {
    const result: FNode[] = [];
    const walk = (nodes: FNode[]) => { nodes.forEach(n => { if (n.type === 'file') result.push(n); if (n.children) walk(n.children); }); };
    walk(tree);
    return result;
  }, [tree]);

  const highFiles = useCallback(() => allFiles().filter(f => f.value === 'high'), [allFiles]);

  const finish = useCallback(() => {
    const all = allFiles();
    const hf = highFiles();
    const markedHigh = hf.filter(f => targets.has(f.id));
    const highPts = Math.min(50, markedHigh.length * (50 / Math.max(hf.length, 1)));
    const coverPts = Math.min(25, Math.floor((inspected.size / Math.max(all.length, 1)) * 25));
    const effPts = clicks <= 12 ? 25 : clicks <= 18 ? 18 : clicks <= 25 ? 10 : 5;
    const s = Math.max(0, Math.min(100, Math.round(highPts + coverPts + effPts)));
    const rank = s >= 90 ? 'S' : s >= 70 ? 'A' : s >= 50 ? 'B' : s >= 30 ? 'C' : 'D' as const;
    const tFiles = all.filter(f => targets.has(f.id)).map(f => f.name);
    const locs: Record<string, string> = {};
    targets.forEach(id => { const f = all.find(x => x.id === id); if (f) locs[f.name] = f.value || 'unknown'; });
    onComplete({ score: s, rank, breakdown: [
      { category: '\u9AD8\u4FA1\u5024\u30D5\u30A1\u30A4\u30EB', points: Math.round(highPts), maxPoints: 50, comment: `${markedHigh.length}/${hf.length}\u4EF6` },
      { category: '\u7DB2\u7F85\u6027', points: coverPts, maxPoints: 25, comment: `${inspected.size}/${all.length}\u30D5\u30A1\u30A4\u30EB\u78BA\u8A8D` },
      { category: '\u52B9\u7387\u6027', points: effPts, maxPoints: 25, comment: `${clicks}\u30AF\u30EA\u30C3\u30AF` },
    ], contextOutput: { targetFiles: tFiles, dataLocations: locs } });
  }, [allFiles, highFiles, targets, inspected, clicks, onComplete]);

  const toggleFolder = (id: string) => {
    setClicks(p => p + 1);
    setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const inspectFile = (file: FNode) => {
    setClicks(p => p + 1);
    setInspected(p => new Set([...p, file.id]));
    setSelectedFile(file);
  };

  const toggleTarget = (id: string) => {
    setTargets(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const renderTree = (nodes: FNode[], depth: number): React.ReactNode => nodes.map(node => (
    <div key={node.id} style={{ paddingLeft: depth * 16 }}>
      {node.type === 'folder' ? (
        <motion.button onClick={() => toggleFolder(node.id)} whileTap={{ scale: 0.97 }}
          className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs hover:bg-white/5">
          <span className="text-yellow-400">{expanded.has(node.id) ? '\u{1F4C2}' : '\u{1F4C1}'}</span>
          <span className="text-gray-300">{node.name}</span>
        </motion.button>
      ) : (
        <motion.button onClick={() => inspectFile(node)} whileTap={{ scale: 0.97 }}
          className={`flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-xs hover:bg-white/5 ${selectedFile?.id === node.id ? 'bg-cyber-cyan/10' : ''}`}>
          <span>{extIcons[node.ext || ''] || '\u{1F4C4}'}</span>
          <span className={inspected.has(node.id) ? 'text-cyber-green' : 'text-gray-400'}>{node.name}</span>
          {targets.has(node.id) && <span className="text-red-400">{'\u{1F3AF}'}</span>}
        </motion.button>
      )}
      {node.type === 'folder' && expanded.has(node.id) && node.children && renderTree(node.children, depth + 1)}
    </div>
  ));

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
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">DATA DISCOVERY</h2>
            <p className="mb-2 text-sm text-gray-400">{storyContext.targetOrg}\u306E\u30D5\u30A1\u30A4\u30EB\u30B5\u30FC\u30D0\u30FC\u3092\u63A2\u7D22\u3057\u3001\u9AD8\u4FA1\u5024\u30C7\u30FC\u30BF\u3092\u898B\u3064\u3051\u308D\u3002</p>
            <p className="mb-4 text-xs text-cyber-green/70">\u30D5\u30A1\u30A4\u30EB\u3092\u78BA\u8A8D\u3057\u3001\u7A83\u53D6\u5BFE\u8C61\u3068\u3057\u3066\u30DE\u30FC\u30AF\u305B\u3088\u3002\u52B9\u7387\u826F\u304F\u64CD\u4F5C\u305B\u3088\u3002</p>
            <CyberButton onClick={() => setPhase('explore')}>START</CyberButton>
          </motion.div>
        )}
        {(phase === 'explore' || phase === 'done') && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color="cyan">TARGET: {targets.size}\u4EF6</NeonBadge>
              <span className="font-mono text-xs text-gray-500">CLICKS: {clicks}</span>
            </div>
            <div className="flex gap-2" style={{ height: '320px' }}>
              {/* Directory tree */}
              <div className="w-2/5 overflow-y-auto rounded-l border border-white/10 bg-cyber-card p-2">
                {renderTree(tree, 0)}
              </div>
              {/* File detail */}
              <div className="w-3/5 overflow-y-auto rounded-r border border-white/10 bg-cyber-card/50 p-3">
                {selectedFile ? (
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-lg">{extIcons[selectedFile.ext || ''] || '\u{1F4C4}'}</span>
                      <p className="font-mono text-sm text-white">{selectedFile.name}</p>
                    </div>
                    <div className="mb-3 space-y-1 text-xs text-gray-400">
                      <p>\u62E1\u5F35\u5B50: {selectedFile.ext}</p>
                      <p>\u91CD\u8981\u5EA6: <NeonBadge color={valColors[selectedFile.value || 'low']} className="ml-1">{(selectedFile.value || 'low').toUpperCase()}</NeonBadge></p>
                    </div>
                    {phase === 'explore' && (
                      <CyberButton onClick={() => toggleTarget(selectedFile.id)}
                        variant={targets.has(selectedFile.id) ? 'danger' : 'primary'} className="w-full text-xs">
                        {targets.has(selectedFile.id) ? '\u30DE\u30FC\u30AF\u89E3\u9664' : '\u7A83\u53D6\u5BFE\u8C61\u306B\u30DE\u30FC\u30AF'}
                      </CyberButton>
                    )}
                  </div>
                ) : (
                  <p className="pt-10 text-center text-xs text-gray-600">\u30D5\u30A1\u30A4\u30EB\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044</p>
                )}
              </div>
            </div>
            {phase === 'explore' && (
              <CyberButton onClick={() => { setPhase('done'); setTimeout(finish, 300); }} variant="secondary" className="mt-3 w-full">\u63A2\u7D22\u5B8C\u4E86</CyberButton>
            )}
            {phase === 'done' && <div className="mt-4 text-center"><NeonBadge color="green">PHASE COMPLETE</NeonBadge></div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
