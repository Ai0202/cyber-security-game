import React, { useState, useRef, useEffect } from 'react';
import { PASSWORDS } from '../data';

export default function PasswordDemo() {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [cracking, setCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const intervalRef = useRef(null);

  const startCrack = (idx) => {
    setSelectedIdx(idx);
    setCracking(true);
    setCrackProgress(0);
    const pw = PASSWORDS[idx];
    const duration = Math.min(pw.strength * 30, 2500);
    const steps = 40;
    let step = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      step++;
      setCrackProgress(step / steps);
      if (step >= steps) {
        clearInterval(intervalRef.current);
        setCracking(false);
      }
    }, duration / steps);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        パスワードを選んで「クラッキング開始」をクリック。<br />
        弱いパスワードがいかに速く突破されるか体感しよう。
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PASSWORDS.map((pw, i) => (
          <button
            key={i}
            onClick={() => startCrack(i)}
            disabled={cracking}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              background: selectedIdx === i ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
              border: selectedIdx === i ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#e2e8f0",
              cursor: cracking ? "wait" : "pointer",
              fontSize: 13,
              fontFamily: "monospace",
              transition: "all 0.2s",
            }}
          >
            <span>{pw.value}</span>
            {selectedIdx === i && !cracking && (
              <span style={{ color: "#ef4444", fontSize: 12, fontFamily: "sans-serif" }}>
                ⚡ {pw.time}で突破！
              </span>
            )}
            {selectedIdx === i && cracking && (
              <span style={{ color: "#fbbf24", fontSize: 12, fontFamily: "sans-serif" }}>
                解析中... {Math.round(crackProgress * 100)}%
              </span>
            )}
          </button>
        ))}
      </div>
      {selectedIdx !== null && !cracking && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "rgba(239,68,68,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>🔑</span>
            <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 14 }}>
              パスワの分析
            </span>
          </div>
          <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            「{PASSWORDS[selectedIdx].value}」は{PASSWORDS[selectedIdx].time}で突破されました。
            <br />
            <span style={{ color: "#94a3b8" }}>{PASSWORDS[selectedIdx].label}</span>
          </p>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
              <span>脆弱</span><span>強固</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${PASSWORDS[selectedIdx].strength}%`,
                  background: PASSWORDS[selectedIdx].strength < 30 ? "#ef4444" : PASSWORDS[selectedIdx].strength < 60 ? "#f59e0b" : "#22c55e",
                  borderRadius: 3,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
