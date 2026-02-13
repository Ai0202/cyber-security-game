import React, { useState, useRef, useEffect } from 'react';

function PixelGrid({ progress }) {
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const isEncrypted = i < Math.floor(progress * 64);
    cells.push(
      <div
        key={i}
        style={{
          width: 16,
          height: 16,
          borderRadius: 2,
          backgroundColor: isEncrypted ? "#dc2626" : "#22c55e",
          transition: `background-color 0.1s ${i * 15}ms`,
          opacity: 0.6 + Math.random() * 0.4,
        }}
      />
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 16px)", gap: 3 }}>
      {cells}
    </div>
  );
}

export default function RansomwareDemo() {
  const [phase, setPhase] = useState("ready");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  const startAttack = () => {
    setPhase("encrypting");
    setProgress(0);
    let p = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p += 0.02;
      setProgress(Math.min(p, 1));
      if (p >= 1) {
        clearInterval(intervalRef.current);
        setPhase("ransom");
      }
    }, 60);
  };

  const restore = () => {
    setPhase("restoring");
    setProgress(1);
    let p = 1;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p -= 0.03;
      setProgress(Math.max(p, 0));
      if (p <= 0) {
        clearInterval(intervalRef.current);
        setPhase("restored");
      }
    }, 50);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        ランサムウェアがサーバーのファイルを暗号化する様子を体験。<br />
        🟢緑=安全 → 🔴赤=暗号化済み
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
        <PixelGrid progress={progress} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}>
        <span style={{ fontSize: 20 }}>🥷</span>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>
          クリプトの暗号化能力が{phase === "encrypting" || phase === "ransom" ? "悪用" : "正常稼働"}中
        </span>
      </div>

      {phase === "ready" && (
        <button
          onClick={startAttack}
          style={{
            width: "100%",
            padding: "12px 0",
            background: "linear-gradient(135deg, #dc2626, #991b1b)",
            border: "none",
            borderRadius: 10,
            color: "white",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          💀 ランサムウェアを実行する
        </button>
      )}

      {phase === "encrypting" && (
        <div style={{ textAlign: "center", color: "#ef4444", fontSize: 14, fontWeight: 600 }}>
          暗号化中... {Math.round(progress * 100)}%
        </div>
      )}

      {phase === "ransom" && (
        <div
          style={{
            padding: 16,
            background: "rgba(220,38,38,0.12)",
            borderRadius: 10,
            border: "1px solid rgba(220,38,38,0.3)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#fca5a5", fontSize: 18, fontWeight: 800, margin: "0 0 6px" }}>
            ⚠️ YOUR FILES HAVE BEEN ENCRYPTED
          </p>
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 14px" }}>
            身代金 5 BTC を支払えばファイルを復号します
          </p>
          <button
            onClick={restore}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #22c55e, #15803d)",
              border: "none",
              borderRadius: 8,
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            🛟 バックアップンに復旧を頼む
          </button>
        </div>
      )}

      {phase === "restoring" && (
        <div style={{ textAlign: "center", color: "#22c55e", fontSize: 14, fontWeight: 600 }}>
          🛟 バックアップから復旧中... {Math.round((1 - progress) * 100)}%
        </div>
      )}

      {phase === "restored" && (
        <div
          style={{
            padding: 14,
            background: "rgba(34,197,94,0.1)",
            borderRadius: 10,
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          <p style={{ color: "#86efac", fontSize: 14, fontWeight: 700, margin: "0 0 6px", textAlign: "center" }}>
            ✅ 復旧完了！
          </p>
          <p style={{ color: "#94a3b8", fontSize: 12, margin: 0, textAlign: "center", lineHeight: 1.6 }}>
            バックアップンのおかげで身代金を払わずに済みました。<br />
            <strong style={{ color: "#fbbf24" }}>学び：定期バックアップは最後の砦</strong>
          </p>
        </div>
      )}
    </div>
  );
}
