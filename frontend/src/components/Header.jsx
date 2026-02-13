import React from 'react';

export default function Header() {
  return (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 18px",
          background: "linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))",
          borderRadius: 50,
          border: "1px solid rgba(34,211,238,0.15)",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 20 }}>🛡️</span>
        <span
          style={{
            fontSize: 20,
            fontWeight: 900,
            background: "linear-gradient(135deg, #22d3ee, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 2,
          }}
        >
          CyberGuardians
        </span>
      </div>
      <p style={{ color: "#64748b", fontSize: 12, margin: 0, letterSpacing: 1 }}>
        攻撃者の目線で学ぶ、サイバーセキュリティ体験学習
      </p>
    </div>
  );
}
