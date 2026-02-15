"use client";

import { useState } from "react";

interface RansomwarePhaseProps {
  sessionId: string;
  onGameComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function RansomwarePhase({ sessionId, onGameComplete, onStealthChange }: RansomwarePhaseProps) {
  const [targets, setTargets] = useState<string[]>([]);
  const [speed, setSpeed] = useState<"fast" | "stealth">("stealth");
  const [encrypted, setEncrypted] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [defenderMsg, setDefenderMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const allNodes = ["pc_tanaka", "file_server", "mail_server", "admin_pc", "backup_server"];

  const toggleTarget = (nodeId: string) => {
    setTargets((prev) => prev.includes(nodeId) ? prev.filter((n) => n !== nodeId) : [...prev, nodeId]);
  };

  const encrypt = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase4/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "encrypt", targetNodes: targets, speed }),
    });
    const data = await res.json();
    setEncrypted(data.encryptedNodes);
    setMessage(data.message);
    setDefenderMsg(data.defenderReaction);
    onStealthChange(data.stealth);
    setTargets([]);
    setLoading(false);
  };

  const deployRansom = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase4/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "ransom" }),
    });
    const data = await res.json();
    setMessage(data.message);
    setGameEnded(true);
    setLoading(false);
    setTimeout(onGameComplete, 2000);
  };

  const nodeNames: Record<string, string> = {
    pc_tanaka: "田中のPC",
    file_server: "ファイルサーバー",
    mail_server: "メールサーバー",
    admin_pc: "管理者端末",
    backup_server: "バックアップサーバー",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-red-400">💀 ランサムウェアを展開せよ</div>

      {/* Speed selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setSpeed("stealth")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${speed === "stealth" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-white/[.02] border-white/[.06] text-slate-500"}`}
        >
          🥷 ステルス
        </button>
        <button
          onClick={() => setSpeed("fast")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${speed === "fast" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-white/[.02] border-white/[.06] text-slate-500"}`}
        >
          ⚡ 高速
        </button>
      </div>

      {/* Target selection */}
      <div className="flex flex-col gap-1.5">
        {allNodes.map((nodeId) => {
          const isEncrypted = encrypted.includes(nodeId);
          const isSelected = targets.includes(nodeId);
          return (
            <button
              key={nodeId}
              onClick={() => !isEncrypted && toggleTarget(nodeId)}
              disabled={isEncrypted || gameEnded}
              className={`p-3 rounded-lg text-left text-xs border transition-all cursor-pointer disabled:cursor-default ${
                isEncrypted
                  ? "bg-red-500/15 border-red-500/25 text-red-400"
                  : isSelected
                    ? "bg-amber-400/15 border-amber-400/25 text-amber-300"
                    : "bg-white/[.02] border-white/[.06] text-slate-400"
              }`}
            >
              {isEncrypted ? "🔒" : isSelected ? "🎯" : "🖥️"} {nodeNames[nodeId]}
              {isEncrypted && " — 暗号化済み"}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {!gameEnded && (
        <div className="flex gap-2">
          <button
            onClick={encrypt}
            disabled={loading || targets.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 rounded-lg text-red-300 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "暗号化中..." : "🔐 暗号化実行"}
          </button>
          <button
            onClick={deployRansom}
            disabled={loading || encrypted.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            💰 身代金要求
          </button>
        </div>
      )}

      {message && <div className="p-2 bg-white/[.03] rounded-lg text-xs text-slate-400">{message}</div>}
      {defenderMsg && (
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
          🛟 バックアップ: {defenderMsg}
        </div>
      )}
    </div>
  );
}
