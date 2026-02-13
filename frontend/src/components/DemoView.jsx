import React, { useState } from 'react';
import ShoulderHackDemo from './ShoulderHackDemo';
import PasswordDemo from './PasswordDemo';
import RansomwareDemo from './RansomwareDemo';

export default function DemoView() {
  const [activeDemo, setActiveDemo] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {[
          { id: "shoulder", label: "👁️ 覗き見", color: "#f59e0b" },
          { id: "password", label: "🔓 パスワード", color: "#ef4444" },
          { id: "ransom", label: "💀 ランサム", color: "#dc2626" },
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDemo(d.id)}
            style={{
              flex: 1,
              padding: "10px 6px",
              background: activeDemo === d.id ? `${d.color}15` : "rgba(255,255,255,0.02)",
              border: activeDemo === d.id ? `1px solid ${d.color}35` : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              color: activeDemo === d.id ? d.color : "#64748b",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {!activeDemo && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎮</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>上のタブから体験デモを選択</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>
            インタラクティブに攻撃を体験できます
          </div>
        </div>
      )}

      {activeDemo === "shoulder" && (
        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#f59e0b" }}>
            👁️ ショルダーハッキング体験
          </div>
          <ShoulderHackDemo />
        </div>
      )}

      {activeDemo === "password" && (
        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#ef4444" }}>
            🔓 パスワードクラッキング体験
          </div>
          <PasswordDemo />
        </div>
      )}

      {activeDemo === "ransom" && (
        <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#dc2626" }}>
            💀 ランサムウェア体験
          </div>
          <RansomwareDemo />
        </div>
      )}
    </div>
  );
}
