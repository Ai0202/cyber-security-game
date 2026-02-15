"use client";

import { useState } from "react";
import ShoulderHackDemo from "@/components/demo/shoulder-hack-demo";
import PasswordDemo from "@/components/demo/password-demo";
import RansomwareDemo from "@/components/demo/ransomware-demo";

const demos = [
  { id: "shoulder", label: "👁️ 覗き見", color: "#f59e0b" },
  { id: "password", label: "🔓 パスワード", color: "#ef4444" },
  { id: "ransom", label: "💀 ランサム", color: "#dc2626" },
] as const;

type DemoId = typeof demos[number]["id"];

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<DemoId | null>(null);

  return (
    <div>
      <div className="flex gap-1.5 mb-[18px]">
        {demos.map((d) => (
          <button key={d.id} onClick={() => setActiveDemo(d.id)}
            className="flex-1 py-2.5 px-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all border"
            style={{ background: activeDemo === d.id ? `${d.color}15` : "rgba(255,255,255,0.02)", borderColor: activeDemo === d.id ? `${d.color}35` : "rgba(255,255,255,0.06)", color: activeDemo === d.id ? d.color : "#64748b" }}>
            {d.label}
          </button>
        ))}
      </div>
      {!activeDemo && (
        <div className="text-center py-10 px-5 text-slate-600">
          <div className="text-4xl mb-3">🎮</div>
          <div className="text-sm font-semibold">上のタブから体験デモを選択</div>
          <div className="text-xs mt-1.5">インタラクティブに攻撃を体験できます</div>
        </div>
      )}
      {activeDemo && (
        <div className="p-4 bg-white/[.02] rounded-[14px] border border-white/[.06]">
          <div className="text-[15px] font-extrabold mb-1" style={{ color: demos.find(d => d.id === activeDemo)?.color }}>
            {activeDemo === "shoulder" && "👁️ ショルダーハッキング体験"}
            {activeDemo === "password" && "🔓 パスワードクラッキング体験"}
            {activeDemo === "ransom" && "💀 ランサムウェア体験"}
          </div>
          {activeDemo === "shoulder" && <ShoulderHackDemo />}
          {activeDemo === "password" && <PasswordDemo />}
          {activeDemo === "ransom" && <RansomwareDemo />}
        </div>
      )}
    </div>
  );
}
