"use client";

import { useState } from "react";

interface NetworkPhaseProps {
  sessionId: string;
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

interface NodeInfo {
  name: string;
  compromised: boolean;
  files: string[];
}

export default function NetworkPhase({ sessionId, onPhaseComplete, onStealthChange }: NetworkPhaseProps) {
  const [nodes, setNodes] = useState<Record<string, NodeInfo>>({
    pc_tanaka: { name: "田中のPC", compromised: false, files: [] },
    file_server: { name: "ファイルサーバー", compromised: false, files: [] },
    mail_server: { name: "メールサーバー", compromised: false, files: [] },
    firewall: { name: "マモル (FW)", compromised: false, files: [] },
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [defenderMsg, setDefenderMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performAction = async (action: "scan" | "access" | "exploit") => {
    if (!selectedNode) return;
    setLoading(true);
    const res = await fetch("/api/game/phase3/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action, nodeId: selectedNode }),
    });
    const data = await res.json();
    setMessage(data.message);
    setDefenderMsg(data.defenderReaction);
    onStealthChange(data.stealth);

    if (data.discoveredNodes?.length > 0) {
      setNodes((prev) => {
        const updated = { ...prev };
        for (const nodeId of data.discoveredNodes) {
          if (!updated[nodeId]) {
            updated[nodeId] = { name: nodeId === "admin_pc" ? "管理者端末" : "バックアップサーバー", compromised: false, files: [] };
          }
        }
        return updated;
      });
    }

    if (data.filesFound?.length > 0) {
      setNodes((prev) => ({
        ...prev,
        [selectedNode]: { ...prev[selectedNode], files: data.filesFound },
      }));
    }

    if (action === "exploit") {
      setNodes((prev) => ({
        ...prev,
        [selectedNode]: { ...prev[selectedNode], compromised: true },
      }));
      const compromisedCount = Object.values(nodes).filter((n) => n.compromised).length + 1;
      if (compromisedCount >= 3) {
        setTimeout(onPhaseComplete, 2000);
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-blue-400">🌐 ネットワークを探索せよ</div>

      {/* Network Map */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(nodes).map(([id, node]) => (
          <button
            key={id}
            onClick={() => setSelectedNode(id)}
            className={`p-3 rounded-lg text-left text-xs border transition-all cursor-pointer ${
              selectedNode === id
                ? "bg-blue-500/15 border-blue-500/30"
                : node.compromised
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-white/[.02] border-white/[.06]"
            }`}
          >
            <div className="font-bold text-slate-300">
              {node.compromised ? "💀" : "🖥️"} {node.name}
            </div>
            {node.files.length > 0 && (
              <div className="text-slate-500 mt-1">
                {node.files.map((f) => <div key={f}>📄 {f}</div>)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {selectedNode && (
        <div className="flex gap-2">
          <button onClick={() => performAction("scan")} disabled={loading} className="flex-1 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-cyan-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            🔍 スキャン
          </button>
          <button onClick={() => performAction("access")} disabled={loading} className="flex-1 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            📂 アクセス
          </button>
          <button onClick={() => performAction("exploit")} disabled={loading} className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            ⚡ 攻撃
          </button>
        </div>
      )}

      {message && <div className="p-2 bg-white/[.03] rounded-lg text-xs text-slate-400">{message}</div>}
      {defenderMsg && (
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
          🛡️ マモル: {defenderMsg}
        </div>
      )}
    </div>
  );
}
