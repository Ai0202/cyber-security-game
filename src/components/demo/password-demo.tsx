"use client";

import { useState, useRef, useEffect } from "react";
import { PASSWORDS } from "@/data/passwords";

export default function PasswordDemo() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cracking, setCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCrack = (idx: number) => {
    setSelectedIdx(idx);
    setCracking(true);
    setCrackProgress(0);
    const pw = PASSWORDS[idx];
    const duration = Math.min(pw.strength * 30, 2500);
    const steps = 40;
    let step = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      step++;
      setCrackProgress(step / steps);
      if (step >= steps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCracking(false);
      }
    }, duration / steps);
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "#ef4444";
    if (strength < 60) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        パスワードを選んで「クラッキング開始」をクリック。<br />
        弱いパスワードがいかに速く突破されるか体感しよう。
      </p>
      <div className="flex flex-col gap-2">
        {PASSWORDS.map((pw, i) => (
          <button key={i} onClick={() => startCrack(i)} disabled={cracking}
            className="flex items-center justify-between py-2.5 px-3.5 rounded-lg font-mono text-[13px] text-slate-200 transition-all border cursor-pointer disabled:cursor-wait"
            style={{ background: selectedIdx === i ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)", borderColor: selectedIdx === i ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)" }}>
            <span>{pw.value}</span>
            {selectedIdx === i && !cracking && <span className="text-red-500 text-xs font-sans">⚡ {pw.time}で突破！</span>}
            {selectedIdx === i && cracking && <span className="text-amber-400 text-xs font-sans">解析中... {Math.round(crackProgress * 100)}%</span>}
          </button>
        ))}
      </div>
      {selectedIdx !== null && !cracking && (
        <div className="mt-4 p-3.5 bg-red-500/[.08] rounded-[10px] border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <span className="text-amber-400 font-bold text-sm">パスワの分析</span>
          </div>
          <p className="text-slate-300 text-[13px] leading-relaxed m-0">
            「{PASSWORDS[selectedIdx].value}」は{PASSWORDS[selectedIdx].time}で突破されました。
            <br /><span className="text-slate-400">{PASSWORDS[selectedIdx].label}</span>
          </p>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1"><span>脆弱</span><span>強固</span></div>
            <div className="h-1.5 bg-white/[.08] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
                style={{ width: `${PASSWORDS[selectedIdx].strength}%`, background: getStrengthColor(PASSWORDS[selectedIdx].strength) }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
