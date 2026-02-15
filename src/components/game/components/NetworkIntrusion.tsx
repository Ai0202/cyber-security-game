'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameComponentProps } from '@/lib/component-registry';
import CyberButton from '@/components/ui/CyberButton';
import NeonBadge from '@/components/ui/NeonBadge';

interface NetworkNode {
  id: string;
  name: string;
  type: 'workstation' | 'server' | 'firewall' | 'router' | 'admin';
  explored: boolean;
  compromised: boolean;
  info: string;
}

type Phase = 'loading' | 'login' | 'explore' | 'escalate' | 'done';

const fallbackNodes: NetworkNode[] = [
  {
    id: 'entry',
    name: '受付端末',
    type: 'workstation',
    explored: false,
    compromised: false,
    info: 'Windows 10 / 一般ユーザー権限',
  },
  {
    id: 'fileserver',
    name: 'ファイルサーバー',
    type: 'server',
    explored: false,
    compromised: false,
    info: 'Windows Server 2019 / 患者情報を格納',
  },
  {
    id: 'mailserver',
    name: 'メールサーバー',
    type: 'server',
    explored: false,
    compromised: false,
    info: 'Linux / 全職員のメールデータ',
  },
  {
    id: 'admin-pc',
    name: '管理者端末',
    type: 'admin',
    explored: false,
    compromised: false,
    info: 'Windows 10 / ドメイン管理者アカウント',
  },
  {
    id: 'firewall',
    name: 'ファイアウォール',
    type: 'firewall',
    explored: false,
    compromised: false,
    info: 'FortiGate / 外部通信の制御',
  },
  {
    id: 'db',
    name: 'データベース',
    type: 'server',
    explored: false,
    compromised: false,
    info: 'PostgreSQL / 電子カルテDB',
  },
];

const fallbackConnections = [
  ['entry', 'db'],
  ['entry', 'fileserver'],
  ['entry', 'mailserver'],
  ['db', 'admin-pc'],
  ['db', 'firewall'],
  ['fileserver', 'admin-pc'],
  ['mailserver', 'firewall'],
];

function generatePositions(count: number): Record<string, { x: number; y: number }> {
  if (count <= 6) {
    // Use a predefined layout for small networks
    const layouts: { x: number; y: number }[] = [
      { x: 20, y: 50 },
      { x: 50, y: 25 },
      { x: 50, y: 75 },
      { x: 80, y: 30 },
      { x: 80, y: 70 },
      { x: 50, y: 50 },
    ];
    const positions: Record<string, { x: number; y: number }> = {};
    for (let i = 0; i < count; i++) {
      positions[String(i)] = layouts[i] || { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 };
    }
    return positions;
  }

  // For larger networks, distribute in a grid-like pattern
  const positions: Record<string, { x: number; y: number }> = {};
  const cols = Math.ceil(Math.sqrt(count));
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[String(i)] = {
      x: 15 + (col / (cols - 1 || 1)) * 70,
      y: 20 + (row / (Math.ceil(count / cols) - 1 || 1)) * 60,
    };
  }
  return positions;
}

const nodeIcons: Record<string, string> = {
  workstation: '💻',
  server: '🖥️',
  firewall: '🛡️',
  router: '📡',
  admin: '👑',
};

export default function NetworkIntrusion({
  storyContext,
  previousContext,
  phaseId,
  componentId,
  previousResults,
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [nodes, setNodes] = useState<NetworkNode[]>(fallbackNodes);
  const [connections, setConnections] = useState<string[][]>(fallbackConnections);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [stealthLevel, setStealthLevel] = useState(100);
  const [accessLevel, setAccessLevel] = useState<'user' | 'admin'>('user');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Fetch scenario from API on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchScenario() {
      try {
        const res = await fetch(`/api/game/phase/${phaseId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            componentId,
            action: 'init',
            storyContext,
            previousResults,
          }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        if (cancelled) return;

        if (data.nodes && Array.isArray(data.nodes)) {
          const mapped: NetworkNode[] = data.nodes.map(
            (n: { id: string; name: string; type: string; os?: string; services?: string[] }, i: number) => ({
              id: n.id || String(i),
              name: n.name,
              type: (['workstation', 'server', 'firewall', 'router', 'admin'].includes(n.type) ? n.type : 'server') as NetworkNode['type'],
              explored: false,
              compromised: false,
              info: [n.os, n.services?.join(', ')].filter(Boolean).join(' / ') || n.name,
            })
          );

          if (mapped.length > 0) {
            setNodes(mapped);

            // Build positions
            const positions: Record<string, { x: number; y: number }> = {};
            const generated = generatePositions(mapped.length);
            mapped.forEach((node, i) => {
              positions[node.id] = generated[String(i)];
            });
            setNodePositions(positions);

            // Set connections
            if (data.connections && Array.isArray(data.connections)) {
              setConnections(
                data.connections.map((c: { from: string; to: string }) => [c.from, c.to])
              );
            }

            setPhase('login');
            return;
          }
        }

        // Fallback
        useFallbackData();
      } catch {
        if (cancelled) return;
        useFallbackData();
      }
    }

    function useFallbackData() {
      setNodes(fallbackNodes);
      setConnections(fallbackConnections);
      const positions: Record<string, { x: number; y: number }> = {
        entry: { x: 20, y: 50 },
        fileserver: { x: 50, y: 25 },
        mailserver: { x: 50, y: 75 },
        'admin-pc': { x: 80, y: 30 },
        firewall: { x: 80, y: 70 },
        db: { x: 50, y: 50 },
      };
      setNodePositions(positions);
      setPhase('login');
    }

    fetchScenario();
    return () => {
      cancelled = true;
    };
  }, [storyContext, phaseId, componentId, previousResults]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines]);

  const addLine = (line: string) =>
    setTerminalLines((prev) => [...prev, line]);

  const handleLogin = () => {
    const cred = previousContext.crackedPassword || previousContext.stolenCredentials;
    addLine('$ ssh user@192.168.1.10');
    addLine(cred ? `Using credentials from previous phase...` : 'Using default credentials...');
    addLine('[SUCCESS] ログイン成功 - 一般ユーザー権限');
    setPhase('explore');
    setNodes((prev) => {
      const firstNode = prev[0];
      if (!firstNode) return prev;
      return prev.map((n) => (n.id === firstNode.id ? { ...n, explored: true, compromised: true } : n));
    });
  };

  const handleExplore = (node: NetworkNode) => {
    if (node.explored) {
      setSelectedNode(node);
      return;
    }

    addLine(`$ nmap -sV ${node.name}...`);
    addLine(`  Discovered: ${node.info}`);

    const stealthPenalty = node.type === 'firewall' ? 25 : node.type === 'admin' ? 15 : 10;
    setStealthLevel((prev) => Math.max(0, prev - stealthPenalty));

    if (stealthPenalty >= 15) {
      addLine(`[WARNING] 不審なスキャン検知リスク: +${stealthPenalty}%`);
    }

    setNodes((prev) =>
      prev.map((n) => (n.id === node.id ? { ...n, explored: true } : n))
    );
    setSelectedNode({ ...node, explored: true });
  };

  const handleEscalate = () => {
    setPhase('escalate');
    addLine('$ exploit --target admin-pc --method pass-the-hash');
    addLine('[...] 権限昇格を試行中...');

    setTimeout(() => {
      addLine('[SUCCESS] ドメイン管理者権限を取得！');
      setAccessLevel('admin');
      // Find admin node and compromise it
      setNodes((prev) =>
        prev.map((n) =>
          n.type === 'admin' ? { ...n, compromised: true } : n
        )
      );
      setStealthLevel((prev) => Math.max(0, prev - 20));

      setTimeout(() => finishGame(), 1000);
    }, 1500);
  };

  const finishGame = () => {
    setPhase('done');
    const exploredCount = nodes.filter((n) => n.explored).length;
    const isAdmin = true; // will be admin after escalate

    const score = Math.min(100,
      20 + // initial login
      Math.min(30, exploredCount * 6) + // exploration
      (isAdmin ? 25 : 0) + // escalation
      Math.floor(stealthLevel * 0.25) // stealth
    );

    onComplete({
      score,
      rank:
        score >= 90
          ? 'S'
          : score >= 70
            ? 'A'
            : score >= 50
              ? 'B'
              : score >= 30
                ? 'C'
                : 'D',
      breakdown: [
        {
          category: '初期侵入',
          points: 20,
          maxPoints: 20,
          comment: 'ログイン成功',
        },
        {
          category: '偵察',
          points: Math.min(30, exploredCount * 6),
          maxPoints: 30,
          comment: `${exploredCount}ノードを探索`,
        },
        {
          category: '権限昇格',
          points: isAdmin ? 25 : 0,
          maxPoints: 25,
          comment: isAdmin ? '管理者権限取得' : '権限昇格未実施',
        },
        {
          category: 'ステルス維持',
          points: Math.floor(stealthLevel * 0.25),
          maxPoints: 25,
          comment: `ステルス残: ${stealthLevel}%`,
        },
      ],
      contextOutput: {
        accessLevel: 'admin',
        discoveredServers: nodes
          .filter((n) => n.explored)
          .map((n) => n.name),
        stealthLevel,
      },
    });
  };

  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-cyber-cyan border-t-transparent"
          />
          <p className="font-mono text-sm text-cyber-cyan">
            LOADING SCENARIO...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <AnimatePresence mode="wait">
        {phase === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="mb-2 font-mono text-xs tracking-widest text-cyber-cyan">
              NETWORK INTRUSION
            </h2>
            <p className="mb-2 text-sm text-gray-400">
              盗んだ認証情報で{storyContext.targetOrg}のネットワークに接続する。
              <br />
              内部を偵察し、管理者権限を奪取せよ。
            </p>
            <p className="mb-4 text-xs text-cyber-green/70">
              管理者権限を手に入れれば、機密ファイルへのアクセスが可能になる。
            </p>
            <CyberButton onClick={handleLogin}>接続</CyberButton>
          </motion.div>
        )}

        {(phase === 'explore' || phase === 'escalate' || phase === 'done') && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Status bar */}
            <div className="mb-3 flex items-center justify-between">
              <NeonBadge color={accessLevel === 'admin' ? 'red' : 'green'}>
                {accessLevel.toUpperCase()}
              </NeonBadge>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">
                  STEALTH:
                </span>
                <div className="h-1.5 w-20 overflow-hidden rounded bg-gray-700">
                  <motion.div
                    className={`h-full ${stealthLevel > 50 ? 'bg-cyber-green' : stealthLevel > 25 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    animate={{ width: `${stealthLevel}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-gray-500">
                  {stealthLevel}%
                </span>
              </div>
            </div>

            {/* Network map */}
            <div className="relative mb-4 aspect-[3/2] rounded-lg border border-white/10 bg-cyber-card">
              {/* Connection lines */}
              <svg className="absolute inset-0 h-full w-full">
                {connections.map(([from, to], i) => {
                  const fromPos = nodePositions[from];
                  const toPos = nodePositions[to];
                  if (!fromPos || !toPos) return null;
                  return (
                    <line
                      key={i}
                      x1={`${fromPos.x}%`}
                      y1={`${fromPos.y}%`}
                      x2={`${toPos.x}%`}
                      y2={`${toPos.y}%`}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  );
                })}
              </svg>

              {/* Nodes */}
              {nodes.map((node) => {
                const pos = nodePositions[node.id];
                if (!pos) return null;
                return (
                  <motion.button
                    key={node.id}
                    onClick={() => handleExplore(node)}
                    disabled={phase !== 'explore'}
                    whileHover={phase === 'explore' ? { scale: 1.2 } : undefined}
                    className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border text-sm ${
                      node.compromised
                        ? 'border-red-400/50 bg-red-400/10'
                        : node.explored
                          ? 'border-cyber-green/50 bg-cyber-green/10'
                          : 'border-gray-600 bg-gray-800'
                    }`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    title={node.name}
                  >
                    {nodeIcons[node.type]}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected node info */}
            {selectedNode && phase === 'explore' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded border border-white/10 bg-cyber-card/80 p-3 text-xs"
              >
                <p className="font-mono text-cyber-green">{selectedNode.name}</p>
                <p className="text-gray-400">{selectedNode.info}</p>
              </motion.div>
            )}

            {/* Escalate button */}
            {phase === 'explore' &&
              nodes.filter((n) => n.explored).length >= 3 && (
                <CyberButton
                  onClick={handleEscalate}
                  variant="danger"
                  className="mb-3 w-full"
                >
                  権限昇格を試行
                </CyberButton>
              )}

            {/* Terminal */}
            <div
              ref={terminalRef}
              className="h-32 overflow-y-auto rounded border border-white/10 bg-black p-2 font-mono text-xs"
            >
              {terminalLines.map((line, i) => (
                <p
                  key={i}
                  className={
                    line.includes('SUCCESS')
                      ? 'text-cyber-green'
                      : line.includes('WARNING')
                        ? 'text-yellow-400'
                        : 'text-gray-500'
                  }
                >
                  {line}
                </p>
              ))}
            </div>

            {phase === 'done' && (
              <div className="mt-4 text-center">
                <NeonBadge color="green">PHASE COMPLETE</NeonBadge>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
