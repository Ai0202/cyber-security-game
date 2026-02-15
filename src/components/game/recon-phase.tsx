"use client";

import { useState } from "react";
import type { TargetProfile, Clue } from "@/lib/types";

interface ReconPhaseProps {
  sessionId: string;
  targetProfile: TargetProfile;
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function ReconPhase({ sessionId, targetProfile, onPhaseComplete, onStealthChange }: ReconPhaseProps) {
  const [clues, setClues] = useState<Clue[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sender, setSender] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const collectClue = async (postId: string) => {
    const res = await fetch("/api/game/phase1/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, postId }),
    });
    const data = await res.json();
    if (data.success) {
      setClues((prev) => [...prev, { id: postId, type: data.clueType, description: data.clueDescription }]);
    }
  };

  const sendPhishing = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase1/phishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, subject, body, sender }),
    });
    const data = await res.json();
    setFeedback(`スコア: ${data.score}/100 — ${data.feedback}\n${data.victimReaction}`);
    onStealthChange(data.stealth);
    if (data.isSuccess) {
      setTimeout(onPhaseComplete, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-cyan-400">🎣 ターゲットのSNSを調査せよ</div>

      {/* SNS Posts */}
      <div className="flex flex-col gap-2">
        {targetProfile.snsPosts.map((post) => {
          const isCollected = clues.some((c) => c.id === post.id);
          return (
            <button
              key={post.id}
              onClick={() => collectClue(post.id)}
              disabled={isCollected}
              className={`p-3 rounded-lg text-left text-xs leading-relaxed border transition-all cursor-pointer disabled:cursor-default ${
                isCollected
                  ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-300"
                  : "bg-white/[.02] border-white/[.06] text-slate-400 hover:border-white/[.12]"
              }`}
            >
              {isCollected && "✅ "}{post.content}
            </button>
          );
        })}
      </div>

      {/* Collected Clues */}
      {clues.length > 0 && (
        <div className="p-3 bg-amber-400/10 rounded-lg border border-amber-400/20">
          <div className="text-xs font-bold text-amber-400 mb-2">収集した手がかり ({clues.length})</div>
          {clues.map((c) => (
            <div key={c.id} className="text-xs text-slate-300">• {c.description}</div>
          ))}
        </div>
      )}

      {/* Phishing Email Form */}
      {clues.length >= 3 && !showEmailForm && (
        <button
          onClick={() => setShowEmailForm(true)}
          className="py-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-bold cursor-pointer"
        >
          📧 フィッシングメールを作成する
        </button>
      )}

      {showEmailForm && (
        <div className="flex flex-col gap-3 p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
          <div className="text-sm font-bold text-purple-400">📧 フィッシングメール作成</div>
          <input
            placeholder="送信者名 (例: IT部門)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40"
          />
          <input
            placeholder="件名"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40"
          />
          <textarea
            placeholder="本文"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40 resize-none"
          />
          <button
            onClick={sendPhishing}
            disabled={loading || !subject || !body}
            className="py-2.5 bg-gradient-to-br from-red-500 to-red-700 border-none rounded-lg text-white text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "評価中..." : "🎯 メール送信"}
          </button>
          {feedback && (
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-slate-300 whitespace-pre-line">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
