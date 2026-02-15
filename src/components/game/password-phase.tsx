"use client";

import { useState } from "react";
import type { Clue } from "@/lib/types";

interface PasswordPhaseProps {
  sessionId: string;
  clues: Clue[];
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function PasswordPhase({ sessionId, clues, onPhaseComplete, onStealthChange }: PasswordPhaseProps) {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);

  const attemptPassword = async () => {
    if (!password.trim() || lockedOut) return;
    setLoading(true);
    const res = await fetch("/api/game/phase2/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, password }),
    });
    const data = await res.json();
    setAttempts((prev) => [...prev, password]);
    setMessage(data.message);
    setHint(data.hint ?? null);
    onStealthChange(data.stealth);
    setPassword("");

    if (data.success) {
      setTimeout(onPhaseComplete, 2000);
    }
    if (data.lockedOut) {
      setLockedOut(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-amber-400">🔓 パスワードを推測せよ</div>

      {/* Clues reminder */}
      <div className="p-3 bg-white/[.02] rounded-lg border border-white/[.06]">
        <div className="text-xs font-semibold text-slate-500 mb-1">手がかり:</div>
        {clues.map((c) => (
          <div key={c.id} className="text-xs text-slate-400">• {c.description}</div>
        ))}
      </div>

      {/* Terminal-style input */}
      <div className="p-4 bg-black/50 rounded-xl border border-green-500/20 font-mono">
        <div className="text-xs text-green-500/60 mb-2">CyberCo Login System v2.1</div>
        <div className="text-xs text-green-400 mb-3">User: tanaka.taro@cyberco.jp</div>

        {attempts.map((a, i) => (
          <div key={i} className="text-xs mb-1">
            <span className="text-green-500">Password: </span>
            <span className="text-red-400">{"*".repeat(a.length)} ✗</span>
          </div>
        ))}

        {!lockedOut && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-500">Password:</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptPassword()}
              className="flex-1 bg-transparent border-none outline-none text-xs text-green-400 font-mono"
              placeholder="パスワードを入力..."
              disabled={loading}
            />
          </div>
        )}

        <div className="text-xs text-slate-600 mt-2">
          残り試行回数: {5 - attempts.length}
        </div>
      </div>

      <button
        onClick={attemptPassword}
        disabled={loading || lockedOut || !password.trim()}
        className="py-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-bold cursor-pointer disabled:opacity-50"
      >
        {loading ? "認証中..." : "⏎ ログイン試行"}
      </button>

      {message && (
        <div className={`p-3 rounded-lg border text-xs ${
          message.includes("成功") ? "bg-green-500/10 border-green-500/20 text-green-300" : "bg-red-500/10 border-red-500/20 text-red-300"
        }`}>
          {message}
        </div>
      )}

      {hint && (
        <div className="p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20 text-xs text-cyan-300">
          💡 ヒント: {hint}
        </div>
      )}
    </div>
  );
}
