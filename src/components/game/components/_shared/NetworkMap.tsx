'use client';

import { motion } from 'framer-motion';

interface NetworkNode {
  id: string;
  name: string;
  type: string;
  explored: boolean;
  compromised: boolean;
}

interface NetworkMapProps {
  nodes: NetworkNode[];
  connections: string[][];
  nodePositions: Record<string, { x: number; y: number }>;
  onNodeClick: (nodeId: string) => void;
  disabled?: boolean;
}

const typeIcons: Record<string, string> = {
  workstation: '\uD83D\uDCBB',
  server: '\uD83D\uDDA5\uFE0F',
  firewall: '\uD83D\uDEE1\uFE0F',
  router: '\uD83D\uDCE1',
  admin: '\uD83D\uDC51',
};

function getNodeColor(node: NetworkNode): string {
  if (node.compromised) return 'border-red-500 bg-red-500/20 text-red-400';
  if (node.explored) return 'border-cyber-green bg-cyber-green/20 text-cyber-green';
  return 'border-gray-600 bg-gray-800/50 text-gray-400';
}

function getLineColor(
  a: NetworkNode | undefined,
  b: NetworkNode | undefined
): string {
  if (a?.compromised && b?.compromised) return '#ef4444';
  if (a?.explored && b?.explored) return '#00ff88';
  return '#374151';
}

export default function NetworkMap({
  nodes,
  connections,
  nodePositions,
  onNodeClick,
  disabled = false,
}: NetworkMapProps) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border border-white/10 bg-cyber-card">
      {/* SVG connection lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([fromId, toId], i) => {
          const from = nodePositions[fromId];
          const to = nodePositions[toId];
          if (!from || !to) return null;
          const color = getLineColor(nodeMap[fromId], nodeMap[toId]);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="0.4"
              strokeDasharray={nodeMap[fromId]?.explored && nodeMap[toId]?.explored ? '0' : '1 1'}
            />
          );
        })}
      </svg>

      {/* Node buttons */}
      {nodes.map((node) => {
        const pos = nodePositions[node.id];
        if (!pos) return null;
        const icon = typeIcons[node.type] ?? '\uD83D\uDCBB';
        return (
          <motion.button
            key={node.id}
            onClick={() => onNodeClick(node.id)}
            disabled={disabled}
            whileHover={disabled ? {} : { scale: 1.15 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-colors disabled:cursor-not-allowed ${getNodeColor(node)}`}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="whitespace-nowrap font-mono text-[8px] leading-tight">
              {node.name}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
