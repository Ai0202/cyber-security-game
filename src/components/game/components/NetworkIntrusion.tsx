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

type Phase = 'login' | 'explore' | 'escalate' | 'done';

const initialNodes: NetworkNode[] = [
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

const nodePositions: Record<string, { x: number; y: number }> = {
  entry: { x: 20, y: 50 },
  fileserver: { x: 50, y: 25 },
  mailserver: { x: 50, y: 75 },
  'admin-pc': { x: 80, y: 30 },
  firewall: { x: 80, y: 70 },
  db: { x: 50, y: 50 },
};

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
  onComplete,
}: GameComponentProps) {
  const [phase, setPhase] = useState<Phase>('login');
  const [nodes, setNodes] = useState<NetworkNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [stealthLevel, setStealthLevel] = useState(100);
  const [accessLevel, setAccessLevel] = useState<'user' | 'admin'>('user');
  const terminalRef = useRef<HTMLDivElement>(null);

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
    setNodes((prev) =>
      prev.map((n) => (n.id === 'entry' ? { ...n, explored: true, compromised: true } : n))
    );
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
      setNodes((prev) =>
        prev.map((n) =>
          n.id === 'admin-pc' ? { ...n, compromised: true } : n
        )
      );
      setStealthLevel((prev) => Math.max(0, prev - 20));

      setTimeout(() => finishGame(), 1000);
    }, 1500);
  };

  const finishGame = () => {
    setPhase('done');
    const exploredCount = nodes.filter((n) => n.explored).length;
    const isAdmin = accessLevel === 'admin' || true; // will be admin after escalate

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
                {[
                  ['entry', 'db'],
                  ['entry', 'fileserver'],
                  ['entry', 'mailserver'],
                  ['db', 'admin-pc'],
                  ['db', 'firewall'],
                  ['fileserver', 'admin-pc'],
                  ['mailserver', 'firewall'],
                ].map(([from, to], i) => {
                  const fromPos = nodePositions[from];
                  const toPos = nodePositions[to];
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
