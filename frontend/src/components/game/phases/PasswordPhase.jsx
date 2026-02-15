import { useState } from "react";
import { apiPost } from "../../../api";

export default function PasswordPhase({ session, onAdvancePhase, onUpdateStealth }) {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);

  const attemptPassword = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setResult(null);
    setCracking(true);
    setCrackProgress(0);

    // クラッキングアニメーション
    const interval = setInterval(() => {
      setCrackProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 30);

    await new Promise((r) => setTimeout(r, 700));
    clearInterval(interval);
    setCrackProgress(100);
    setCracking(false);

    try {
      const data = await apiPost("/game/phase2/attempt", {
        session_id: session.session_id,
        password: password.trim(),
      });
      setAttempts((prev) => [...prev, { pw: password, success: data.success }]);
      setResult(data);
      setHint(data.hint);
      onUpdateStealth(data.stealth);
      setPassword("");

      if (data.success) {
        setTimeout(() => onAdvancePhase(3, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 2 — パスワード突破
      </div>

      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        Phase 1で収集した情報をもとに、田中さんのパスワードを推理してください。
        試行回数が多いとアカウントがロックされます。
      </p>

      {/* ターミナル風UI */}
      <div
        style={{
          background: "#0c0c0c",
          borderRadius: 10,
          border: "1px solid #333",
          padding: 16,
          fontFamily: "'Courier New', monospace",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, color: "#22c55e", marginBottom: 12 }}>
          $ ssh tanaka@mail.cyberco.jp
          <br />
          Password authentication required.
        </div>

        {attempts.map((a, i) => (
          <div key={i} style={{ fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: "#64748b" }}>attempt[{i + 1}]:</span>{" "}
            <span style={{ color: "#e2e8f0" }}>{"*".repeat(a.pw.length)}</span>{" "}
            <span style={{ color: a.success ? "#22c55e" : "#ef4444" }}>
              {a.success ? "✓ ACCESS GRANTED" : "✗ DENIED"}
            </span>
          </div>
        ))}

        {cracking && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#eab308" }}>
              Attempting... {crackProgress}%
            </div>
            <div
              style={{
                height: 3,
                background: "#333",
                borderRadius: 2,
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${crackProgress}%`,
                  background: "#eab308",
                  transition: "width 0.05s",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span style={{ color: "#22c55e", fontSize: 12 }}>Password:</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attemptPassword()}
            placeholder="パスワードを入力..."
            disabled={loading || result?.locked_out}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "'Courier New', monospace",
              outline: "none",
            }}
          />
        </div>
      </div>

      {hint && (
        <div
          style={{
            padding: 12,
            background: "rgba(251,191,36,0.08)",
            borderRadius: 8,
            border: "1px solid rgba(251,191,36,0.2)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>
            💡 ヒント
          </div>
          <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.6 }}>
            {hint.hint}
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            background: result.success
              ? "rgba(34,197,94,0.08)"
              : result.locked_out
                ? "rgba(239,68,68,0.15)"
                : "rgba(239,68,68,0.08)",
            borderRadius: 8,
            border: `1px solid ${result.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            color: result.success ? "#22c55e" : "#ef4444",
            margin: "0 0 4px",
          }}>
            {result.message}
          </p>
          {!result.success && !result.locked_out && (
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              残り試行回数: {result.attempts_remaining}
            </p>
          )}
        </div>
      )}

      <button
        onClick={attemptPassword}
        disabled={loading || !password.trim() || result?.locked_out}
        style={{
          width: "100%",
          padding: "12px 0",
          background:
            password.trim() && !result?.locked_out
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "rgba(255,255,255,0.06)",
          border: "none",
          borderRadius: 10,
          color: password.trim() ? "white" : "#64748b",
          fontWeight: 700,
          fontSize: 14,
          cursor: password.trim() ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "試行中..." : result?.locked_out ? "🔒 ロックアウト" : "🔓 パスワードを試す"}
      </button>
    </div>
  );
}
