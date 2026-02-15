"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GameStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    const res = await fetch("/api/game/start", { method: "POST" });
    const data = await res.json();
    router.push(`/game/${data.sessionId}`);
  };

  return (
    <div className="text-center py-10">
      <div className="text-6xl mb-6">👤</div>
      <div className="text-2xl font-black text-white mb-2">
        ランサムウェア攻撃チェーン
      </div>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        あなたは攻撃者「シャドウ」。<br />
        4つのフェーズを通じてサイバー攻撃を体験し、<br />
        防御の重要性を学びましょう。
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {[
          { phase: 1, title: "偵察 & フィッシング", icon: "🎣" },
          { phase: 2, title: "パスワード突破", icon: "🔓" },
          { phase: 3, title: "ネットワーク侵入", icon: "🌐" },
          { phase: 4, title: "ランサムウェア展開", icon: "💀" },
        ].map((p) => (
          <div key={p.phase} className="flex items-center gap-3 p-3 bg-white/[.02] rounded-lg border border-white/[.06] text-left">
            <span className="text-xl">{p.icon}</span>
            <div>
              <div className="text-xs text-slate-500">Phase {p.phase}</div>
              <div className="text-sm font-bold text-slate-300">{p.title}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={startGame}
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-br from-red-500 to-red-700 border-none rounded-xl text-white text-base font-black cursor-pointer tracking-wider disabled:opacity-50"
      >
        {loading ? "準備中..." : "⚔️ ゲーム開始"}
      </button>
    </div>
  );
}
