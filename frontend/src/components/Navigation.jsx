import React from 'react';

export default function Navigation({ view, setView }) {
  const tabs = [
    { id: "home", label: "ステージ", icon: "⚔️" },
    { id: "characters", label: "キャラ", icon: "👥" },
    { id: "demo", label: "体験デモ", icon: "🎮" },
  ];

  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          style={{
            padding: "8px 18px",
            background: view === tab.id ? "rgba(34,211,238,0.12)" : "transparent",
            border: view === tab.id ? "1px solid rgba(34,211,238,0.25)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: view === tab.id ? "#22d3ee" : "#64748b",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </div>
  );
}
