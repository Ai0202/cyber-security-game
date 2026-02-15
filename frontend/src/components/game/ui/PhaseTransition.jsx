import { useState, useEffect } from "react";

const PHASE_INFO = {
  1: { title: "Phase 1", subtitle: "偵察 & フィッシング", icon: "🎣", color: "#8b5cf6" },
  2: { title: "Phase 2", subtitle: "パスワード突破", icon: "🔓", color: "#ef4444" },
  3: { title: "Phase 3", subtitle: "ネットワーク侵入", icon: "🌐", color: "#3b82f6" },
  4: { title: "Phase 4", subtitle: "ランサムウェア展開", icon: "💀", color: "#dc2626" },
};

export default function PhaseTransition({ phase, onComplete }) {
  const [visible, setVisible] = useState(true);
  const info = PHASE_INFO[phase];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  if (!visible || !info) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>{info.icon}</div>
      <div
        style={{
          fontSize: 14,
          color: info.color,
          letterSpacing: 4,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {info.title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0" }}>
        {info.subtitle}
      </div>
    </div>
  );
}
