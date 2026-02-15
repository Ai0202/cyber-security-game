import { useState, useCallback } from "react";
import { apiPost, apiGet } from "../../api";
import StealthMeter from "./ui/StealthMeter";
import PhaseTransition from "./ui/PhaseTransition";
import PhaseManager from "./PhaseManager";

export default function GameContainer({ onExit }) {
  const [session, setSession] = useState(null);
  const [phase, setPhase] = useState(0);
  const [stealth, setStealth] = useState(100);
  const [showTransition, setShowTransition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiPost("/game/start");
      setSession(data);
      setStealth(data.stealth);
      setPhase(1);
      setShowTransition(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const advancePhase = useCallback((newPhase, newStealth) => {
    setStealth(newStealth);
    setPhase(newPhase);
    setShowTransition(true);
  }, []);

  const updateStealth = useCallback((value) => {
    setStealth(value);
  }, []);

  const finishGame = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await apiGet(`/game/${session.session_id}/report`);
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // スタート画面
  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          OPERATION: RANSOMWARE
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>
          あなたは攻撃者「シャドウ」。
          <br />
          ターゲット企業「サイバーコーポレーション」に
          <br />
          ランサムウェア攻撃を仕掛けよ。
        </p>
        <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 24px", lineHeight: 1.6 }}>
          偵察 → パスワード突破 → ネットワーク侵入 → ランサムウェア展開
        </p>
        <button
          onClick={startGame}
          disabled={loading}
          style={{
            padding: "14px 48px",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? "wait" : "pointer",
            letterSpacing: 1,
          }}
        >
          {loading ? "準備中..." : "⚔️ ミッション開始"}
        </button>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onExit}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ← ステージ選択に戻る
          </button>
        </div>
      </div>
    );
  }

  // レポート画面
  if (report) {
    const rankColors = { S: "#fbbf24", A: "#22c55e", B: "#3b82f6", C: "#94a3b8", D: "#ef4444" };
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: rankColors[report.rank] || "#94a3b8",
              textShadow: `0 0 40px ${rankColors[report.rank] || "#94a3b8"}40`,
            }}
          >
            {report.rank}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", letterSpacing: 2 }}>RANK</div>
        </div>

        <StealthMeter stealth={report.stealth} />

        <div
          style={{
            padding: 16,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          <p style={{ color: "#e2e8f0", fontSize: 14, margin: 0, lineHeight: 1.8 }}>
            {report.summary}
          </p>
        </div>

        {report.phase_feedback.map((pf) => (
          <div
            key={pf.phase}
            style={{
              padding: 14,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>
              Phase {pf.phase}: {pf.title}
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.6 }}>
              {pf.feedback}
            </p>
            <div
              style={{
                fontSize: 12,
                color: "#22c55e",
                padding: "6px 10px",
                background: "rgba(34,197,94,0.08)",
                borderRadius: 6,
              }}
            >
              🛡️ 防御策: {pf.defense_tip}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "rgba(251,191,36,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(251,191,36,0.2)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: 0 }}>
            💡 {report.key_learning}
          </p>
        </div>

        <button
          onClick={onExit}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "12px 0",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            color: "#94a3b8",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← ステージ選択に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      {showTransition && (
        <PhaseTransition phase={phase} onComplete={() => setShowTransition(false)} />
      )}

      <StealthMeter stealth={stealth} />

      <PhaseManager
        session={session}
        phase={phase}
        stealth={stealth}
        onAdvancePhase={advancePhase}
        onUpdateStealth={updateStealth}
        onFinish={finishGame}
      />
    </div>
  );
}
