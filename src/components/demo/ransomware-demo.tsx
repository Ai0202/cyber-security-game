"use client";

import { useState, useRef, useEffect } from "react";

function PixelGrid({ progress }: { progress: number }) {
  const cells = Array.from({ length: 64 }, (_, i) => {
    const isEncrypted = i < Math.floor(progress * 64);
    return (
      <div key={i} className="w-4 h-4 rounded-sm transition-colors"
        style={{ backgroundColor: isEncrypted ? "#dc2626" : "#22c55e", transitionDelay: `${i * 15}ms`, opacity: 0.6 + Math.random() * 0.4 }} />
    );
  });
  return <div className="grid grid-cols-8 gap-[3px]">{cells}</div>;
}

type Phase = "ready" | "encrypting" | "ransom" | "restoring" | "restored";

export default function RansomwareDemo() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAttack = () => {
    setPhase("encrypting");
    setProgress(0);
    let p = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p += 0.02;
      setProgress(Math.min(p, 1));
      if (p >= 1) { if (intervalRef.current) clearInterval(intervalRef.current); setPhase("ransom"); }
    }, 60);
  };

  const restore = () => {
    setPhase("restoring");
    setProgress(1);
    let p = 1;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p -= 0.03;
      setProgress(Math.max(p, 0));
      if (p <= 0) { if (intervalRef.current) clearInterval(intervalRef.current); setPhase("restored"); }
    }, 50);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        ランサムウェアがサーバーのファイルを暗号化する様子を体験。<br />🟢緑=安全 → 🔴赤=暗号化済み
      </p>
      <div className="flex justify-center mb-5"><PixelGrid progress={progress} /></div>
      <div className="flex items-center gap-2.5 mb-4 justify-center">
        <span className="text-xl">🥷</span>
        <span className="text-slate-400 text-xs">クリプトの暗号化能力が{phase === "encrypting" || phase === "ransom" ? "悪用" : "正常稼働"}中</span>
      </div>
      {phase === "ready" && (
        <button onClick={startAttack} className="w-full py-3 bg-gradient-to-br from-red-600 to-red-800 border-none rounded-[10px] text-white font-bold text-sm cursor-pointer tracking-wider">
          💀 ランサムウェアを実行する
        </button>
      )}
      {phase === "encrypting" && <div className="text-center text-red-500 text-sm font-semibold">暗号化中... {Math.round(progress * 100)}%</div>}
      {phase === "ransom" && (
        <div className="p-4 bg-red-600/[.12] rounded-[10px] border border-red-600/30 text-center">
          <p className="text-red-300 text-lg font-extrabold m-0 mb-1.5">⚠️ YOUR FILES HAVE BEEN ENCRYPTED</p>
          <p className="text-slate-400 text-xs m-0 mb-3.5">身代金 5 BTC を支払えばファイルを復号します</p>
          <button onClick={restore} className="py-2.5 px-6 bg-gradient-to-br from-green-500 to-green-700 border-none rounded-lg text-white font-bold text-[13px] cursor-pointer">
            🛟 バックアップから復旧を頼む
          </button>
        </div>
      )}
      {phase === "restoring" && <div className="text-center text-green-500 text-sm font-semibold">🛟 バックアップから復旧中... {Math.round((1 - progress) * 100)}%</div>}
      {phase === "restored" && (
        <div className="p-3.5 bg-green-500/10 rounded-[10px] border border-green-500/25">
          <p className="text-green-300 text-sm font-bold m-0 mb-1.5 text-center">✅ 復旧完了！</p>
          <p className="text-slate-400 text-xs m-0 text-center leading-relaxed">
            バックアップのおかげで身代金を払わずに済みました。<br />
            <strong className="text-amber-400">学び：定期バックアップは最後の砦</strong>
          </p>
        </div>
      )}
    </div>
  );
}
