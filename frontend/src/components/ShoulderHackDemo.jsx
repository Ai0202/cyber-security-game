import React, { useState } from 'react';

export default function ShoulderHackDemo() {
  const [found, setFound] = useState([]);
  const hints = [
    { id: "sticky", label: "付箋のパスワード", x: 72, y: 22, detail: "モニターに貼られた「pass1234」" },
    { id: "screen", label: "画面の機密情報", x: 38, y: 40, detail: "顧客リストが丸見え" },
    { id: "badge", label: "社員証の氏名", x: 55, y: 68, detail: "名前から社内システムIDを推測可能" },
  ];

  const handleFind = (id) => {
    if (!found.includes(id)) setFound([...found, id]);
  };

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        カフェで仕事中の社員を観察。<br />
        危険な情報漏洩ポイントを3つ見つけてタップしよう。
      </p>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 14,
        }}
      >
        {/* Cafe scene - simplified illustration */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "#2d1b11" }} />
        {/* Table */}
        <div style={{ position: "absolute", bottom: "30%", left: "20%", width: "60%", height: "8%", background: "#5c3a1e", borderRadius: "4px 4px 0 0" }} />
        {/* Laptop */}
        <div style={{ position: "absolute", bottom: "38%", left: "30%", width: "30%", height: "22%", background: "#334155", borderRadius: "4px 4px 0 0", border: "2px solid #475569" }}>
          <div style={{ position: "absolute", inset: 3, background: "#1e293b", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#64748b", fontSize: 8 }}>顧客リスト.xlsx</span>
          </div>
        </div>
        {/* Sticky note */}
        <div style={{ position: "absolute", top: "15%", right: "18%", width: 50, height: 40, background: "#fde047", borderRadius: 2, transform: "rotate(5deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#713f12", fontSize: 7, fontWeight: 700 }}>pass1234</span>
        </div>
        {/* Person silhouette */}
        <div style={{ position: "absolute", bottom: "45%", left: "42%", width: 28, height: 28, background: "#64748b", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "25%", left: "38%", width: 36, height: 32, background: "#475569", borderRadius: "8px 8px 0 0" }} />
        {/* Badge */}
        <div style={{ position: "absolute", bottom: "30%", left: "50%", width: 22, height: 14, background: "white", borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#1e293b", fontSize: 5 }}>田中太郎</span>
        </div>

        {/* Clickable hotspots */}
        {hints.map((h) => (
          <button
            key={h.id}
            onClick={() => handleFind(h.id)}
            style={{
              position: "absolute",
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: "translate(-50%, -50%)",
              width: found.includes(h.id) ? 36 : 28,
              height: found.includes(h.id) ? 36 : 28,
              borderRadius: "50%",
              background: found.includes(h.id) ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.0)",
              border: found.includes(h.id) ? "2px solid #22c55e" : "2px dashed rgba(239,68,68,0.4)",
              cursor: "pointer",
              transition: "all 0.3s",
              animation: found.includes(h.id) ? "none" : "pulse 2s infinite",
            }}
          />
        ))}
      </div>

      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10 }}>
        発見: {found.length} / {hints.length}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {hints.map((h) => (
          <div
            key={h.id}
            style={{
              padding: "8px 12px",
              background: found.includes(h.id) ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
              borderRadius: 8,
              border: found.includes(h.id) ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.06)",
              fontSize: 12,
              color: found.includes(h.id) ? "#86efac" : "#475569",
            }}
          >
            {found.includes(h.id) ? `✅ ${h.label} — ${h.detail}` : `❓ ???`}
          </div>
        ))}
      </div>

      {found.length === 3 && (
        <div style={{ marginTop: 14, padding: 12, background: "rgba(251,191,36,0.1)", borderRadius: 10, border: "1px solid rgba(251,191,36,0.2)" }}>
          <p style={{ color: "#fbbf24", fontSize: 13, fontWeight: 700, margin: 0, textAlign: "center" }}>
            🎯 全て発見！覗き見防止フィルター＋画面ロック＋社員証は裏返して！
          </p>
        </div>
      )}
    </div>
  );
}
