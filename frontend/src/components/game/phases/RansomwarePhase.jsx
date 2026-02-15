import { useState, useRef, useEffect } from "react";
import { apiPost } from "../../../api";

function EncryptionGrid({ encryptedCount, totalNodes }) {
  const ratio = totalNodes > 0 ? encryptedCount / totalNodes : 0;
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const isEncrypted = i < Math.floor(ratio * 64);
    cells.push(
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: 2,
          backgroundColor: isEncrypted ? "#dc2626" : "#22c55e",
          transition: `background-color 0.15s ${i * 20}ms`,
          opacity: 0.6 + Math.random() * 0.4,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 14px)",
        gap: 3,
        justifyContent: "center",
      }}
    >
      {cells}
    </div>
  );
}

export default function RansomwarePhase({ session, onUpdateStealth, onFinish }) {
  const [step, setStep] = useState("plan"); // "plan" | "encrypting" | "ransom" | "done"
  const [backupDisabled, setBackupDisabled] = useState(false);
  const [encryptedCount, setEncryptedCount] = useState(0);
  const [speed, setSpeed] = useState("slow");
  const [defenderMsg, setDefenderMsg] = useState(null);
  const [ransomMsg, setRansomMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const disableBackup = async () => {
    setLoading(true);
    try {
      const data = await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "disable_backup",
      });
      setBackupDisabled(data.backup_disabled);
      onUpdateStealth(data.stealth);
      if (data.defender_reaction?.message) {
        setDefenderMsg(data.defender_reaction);
      }
    } finally {
      setLoading(false);
    }
  };

  const encrypt = async () => {
    setStep("encrypting");
    setAnimProgress(0);

    // アニメーション
    let p = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p += speed === "fast" ? 0.04 : 0.02;
      if (p >= 1) {
        p = 1;
        clearInterval(intervalRef.current);
      }
      setAnimProgress(p);
    }, 60);

    setLoading(true);
    try {
      const targets = ["pc_tanaka", "file_server", "mail_server"];
      const data = await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "encrypt",
        target_nodes: targets,
        speed,
      });
      setEncryptedCount(data.encrypted_nodes.length);
      onUpdateStealth(data.stealth);
      if (data.defender_reaction?.message) {
        setDefenderMsg(data.defender_reaction);
      }

      // アニメーション完了を待つ
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (p >= 1) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });

      setStep("ransom");
    } finally {
      setLoading(false);
    }
  };

  const sendRansom = async () => {
    setLoading(true);
    try {
      await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "ransom_message",
        ransom_message: ransomMsg || "YOUR FILES HAVE BEEN ENCRYPTED. PAY 5 BTC.",
      });
      setStep("done");
      setTimeout(() => onFinish(), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 4 — ランサムウェア展開
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <EncryptionGrid
          encryptedCount={step === "encrypting" ? Math.floor(animProgress * 3) : encryptedCount}
          totalNodes={3}
        />
      </div>

      {step === "plan" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            管理者権限を取得しました。ランサムウェアの展開準備をしましょう。
            バックアップを先に無効化すると、復旧を防げます。
          </p>

          {/* バックアップ無効化 */}
          <div
            style={{
              padding: 14,
              marginBottom: 12,
              background: backupDisabled
                ? "rgba(34,197,94,0.08)"
                : "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: `1px solid ${backupDisabled ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                  💾 バックアップサーバー
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {backupDisabled ? "無効化済み — 復旧不可能" : "稼働中 — 復旧される可能性あり"}
                </div>
              </div>
              {!backupDisabled && (
                <button
                  onClick={disableBackup}
                  disabled={loading}
                  style={{
                    padding: "6px 16px",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: 6,
                    color: "#f87171",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  無効化
                </button>
              )}
            </div>
          </div>

          {/* 暗号化速度選択 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>暗号化速度:</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["slow", "fast"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: speed === s ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${speed === s ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8,
                    color: speed === s ? "#f87171" : "#64748b",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {s === "slow" ? "🐢 低速（ステルス）" : "⚡ 高速（検知リスク高）"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={encrypt}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
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
            💀 ランサムウェアを展開する
          </button>
        </div>
      )}

      {step === "encrypting" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            暗号化中... {Math.round(animProgress * 100)}%
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {speed === "fast" ? "⚡ 高速暗号化 — 検知リスクが上昇中" : "🐢 低速暗号化 — ステルス維持中"}
          </div>
        </div>
      )}

      {step === "ransom" && (
        <div>
          <div
            style={{
              padding: 16,
              background: "rgba(220,38,38,0.12)",
              borderRadius: 10,
              border: "1px solid rgba(220,38,38,0.3)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#fca5a5", fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>
              ⚠️ 暗号化完了
            </p>
            <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
              {backupDisabled
                ? "バックアップ無効化済み — 完全な攻撃成功"
                : "⚠️ バックアップが残っています — 復旧される可能性あり"}
            </p>
          </div>

          {defenderMsg && (
            <div
              style={{
                padding: 12,
                background: "rgba(34,197,94,0.06)",
                borderRadius: 8,
                border: "1px solid rgba(34,197,94,0.15)",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#86efac" }}>
                {defenderMsg.emoji} バックアップン
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                「{defenderMsg.message}」
              </p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              💀 身代金要求メッセージ
            </label>
            <textarea
              value={ransomMsg}
              onChange={(e) => setRansomMsg(e.target.value)}
              placeholder="YOUR FILES HAVE BEEN ENCRYPTED. PAY 5 BTC TO DECRYPT."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: 8,
                color: "#fca5a5",
                fontSize: 13,
                fontFamily: "'Courier New', monospace",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={sendRansom}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "送信中..." : "📨 身代金要求を送信して攻撃完了"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏁</div>
          <p style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
            MISSION COMPLETE
          </p>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            レポートを生成中...
          </p>
        </div>
      )}
    </div>
  );
}
