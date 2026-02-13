import React from 'react';
import { CHARACTERS } from '../data';

export default function Characters() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8" }}>
          サイバーシティの住人たち
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
          コンピュータの仕組みを擬人化したキャラクター
        </div>
      </div>
      {Object.values(CHARACTERS).map((char) => (
        <div
          key={char.name}
          style={{
            padding: 18,
            background: `linear-gradient(135deg, ${char.color}08, transparent)`,
            border: `1px solid ${char.color}20`,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: `${char.color}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
              border: `1px solid ${char.color}25`,
            }}
          >
            {char.emoji}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>
                {char.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  background: `${char.color}20`,
                  color: char.color,
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                {char.role}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, lineHeight: 1.5 }}>
              {char.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
