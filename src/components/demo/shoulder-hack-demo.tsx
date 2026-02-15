"use client";

import { useState } from "react";

const hints = [
  { id: "sticky", label: "付箋のパスワード", x: 72, y: 22, detail: "モニターに貼られた「pass1234」" },
  { id: "screen", label: "画面の機密情報", x: 38, y: 40, detail: "顧客リストが丸見え" },
  { id: "badge", label: "社員証の氏名", x: 55, y: 68, detail: "名前から社内システムIDを推測可能" },
];

export default function ShoulderHackDemo() {
  const [found, setFound] = useState<string[]>([]);

  const handleFind = (id: string) => {
    if (!found.includes(id)) setFound([...found, id]);
  };

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        カフェで仕事中の社員を観察。<br />
        危険な情報漏洩ポイントを3つ見つけてタップしよう。
      </p>
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden border border-white/[.08] mb-3.5">
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#2d1b11]" />
        <div className="absolute bottom-[30%] left-[20%] w-[60%] h-[8%] bg-[#5c3a1e] rounded-t" />
        <div className="absolute bottom-[38%] left-[30%] w-[30%] h-[22%] bg-slate-700 rounded-t border-2 border-slate-600">
          <div className="absolute inset-[3px] bg-slate-800 rounded-sm flex items-center justify-center">
            <span className="text-slate-500 text-[8px]">顧客リスト.xlsx</span>
          </div>
        </div>
        <div className="absolute top-[15%] right-[18%] w-[50px] h-[40px] bg-yellow-300 rounded-sm rotate-[5deg] flex items-center justify-center">
          <span className="text-yellow-900 text-[7px] font-bold">pass1234</span>
        </div>
        <div className="absolute bottom-[45%] left-[42%] w-7 h-7 bg-slate-500 rounded-full" />
        <div className="absolute bottom-[25%] left-[38%] w-9 h-8 bg-slate-600 rounded-t-lg" />
        <div className="absolute bottom-[30%] left-[50%] w-[22px] h-[14px] bg-white rounded-sm flex items-center justify-center">
          <span className="text-slate-800 text-[5px]">田中太郎</span>
        </div>
        {hints.map((h) => (
          <button
            key={h.id}
            onClick={() => handleFind(h.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: found.includes(h.id) ? 36 : 28,
              height: found.includes(h.id) ? 36 : 28,
              background: found.includes(h.id) ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.0)",
              border: found.includes(h.id) ? "2px solid #22c55e" : "2px dashed rgba(239,68,68,0.4)",
              animation: found.includes(h.id) ? "none" : "pulse 2s infinite",
            }}
          />
        ))}
      </div>
      <div className="text-[13px] text-slate-400 mb-2.5">発見: {found.length} / {hints.length}</div>
      <div className="flex flex-col gap-1.5">
        {hints.map((h) => (
          <div key={h.id} className={`py-2 px-3 rounded-lg text-xs ${found.includes(h.id) ? "bg-green-500/[.08] border border-green-500/20 text-green-300" : "bg-white/[.03] border border-white/[.06] text-slate-600"}`}>
            {found.includes(h.id) ? `✅ ${h.label} — ${h.detail}` : "❓ ???"}
          </div>
        ))}
      </div>
      {found.length === 3 && (
        <div className="mt-3.5 p-3 bg-amber-400/10 rounded-[10px] border border-amber-400/20">
          <p className="text-amber-400 text-[13px] font-bold m-0 text-center">
            🎯 全て発見！覗き見防止フィルター＋画面ロック＋社員証は裏返して！
          </p>
        </div>
      )}
    </div>
  );
}
