"use client";

import { useEffect, useState } from "react";

const PHASE_TITLES = {
  1: { title: "Phase 1: 偵察 & フィッシング", icon: "🎣" },
  2: { title: "Phase 2: パスワード突破", icon: "🔓" },
  3: { title: "Phase 3: ネットワーク侵入", icon: "🌐" },
  4: { title: "Phase 4: ランサムウェア展開", icon: "💀" },
};

export default function PhaseTransition({ phase, onComplete }: { phase: 1 | 2 | 3 | 4; onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const info = PHASE_TITLES[phase];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="text-center animate-pulse">
        <div className="text-6xl mb-4">{info.icon}</div>
        <div className="text-2xl font-black text-white tracking-wider">{info.title}</div>
      </div>
    </div>
  );
}
