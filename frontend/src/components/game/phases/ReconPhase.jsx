import { useState } from "react";
import { apiPost } from "../../../api";

export default function ReconPhase({ session, onAdvancePhase, onUpdateStealth }) {
  const [step, setStep] = useState("sns"); // "sns" | "compose"
  const [clues, setClues] = useState([]);
  const [collectedPosts, setCollectedPosts] = useState(new Set());
  const [email, setEmail] = useState({ subject: "", body: "", sender: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const posts = session.target_profile.sns_posts || [];

  const collectClue = async (postId) => {
    if (collectedPosts.has(postId)) return;
    setLoading(true);
    try {
      const data = await apiPost("/game/phase1/collect", {
        session_id: session.session_id,
        post_id: postId,
      });
      setClues((prev) => [...prev, data]);
      setCollectedPosts((prev) => new Set([...prev, postId]));
    } finally {
      setLoading(false);
    }
  };

  const sendPhishing = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await apiPost("/game/phase1/phishing", {
        session_id: session.session_id,
        subject: email.subject,
        body: email.body,
        sender: email.sender,
      });
      setResult(data);
      onUpdateStealth(data.stealth);
      if (data.is_success) {
        setTimeout(() => onAdvancePhase(2, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 1 — 偵察 & フィッシング
      </div>

      {step === "sns" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            ターゲット「{session.target_profile.name}」のSNS投稿を調査し、攻撃に使える情報を集めましょう。
            投稿をタップして情報を収集できます。
          </p>

          {posts.map((post) => {
            const collected = collectedPosts.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => collectClue(post.id)}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  background: collected
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  border: `1px solid ${collected ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  cursor: collected ? "default" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>
                    {post.type === "photo" ? "📷" : "💬"}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>@tanaka_taro</span>
                  {collected && (
                    <span style={{ fontSize: 10, color: "#22c55e", marginLeft: "auto" }}>
                      ✓ 収集済み
                    </span>
                  )}
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {post.text}
                </p>
              </div>
            );
          })}

          {clues.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, marginBottom: 8 }}>
                🔍 収集した情報 ({clues.length})
              </div>
              {clues.map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(251,191,36,0.08)",
                    borderRadius: 6,
                    marginBottom: 4,
                    fontSize: 12,
                    color: "#fbbf24",
                  }}
                >
                  {c.clue_description}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep("compose")}
            disabled={clues.length < 2}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px 0",
              background:
                clues.length >= 2
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 10,
              color: clues.length >= 2 ? "white" : "#64748b",
              fontWeight: 700,
              fontSize: 14,
              cursor: clues.length >= 2 ? "pointer" : "not-allowed",
            }}
          >
            {clues.length >= 2
              ? "📧 フィッシングメールを作成する"
              : `あと${Math.max(0, 2 - clues.length)}個情報を集めてください`}
          </button>
        </div>
      )}

      {step === "compose" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            収集した情報を使って、ターゲットが思わずクリックしてしまうフィッシングメールを作成しましょう。
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              差出人
            </label>
            <input
              value={email.sender}
              onChange={(e) => setEmail({ ...email, sender: e.target.value })}
              placeholder="例: suzuki@cyberco.jp"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              件名
            </label>
            <input
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              placeholder="例: 【緊急】経費精算の確認のお願い"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              本文
            </label>
            <textarea
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              placeholder="フィッシングメールの本文を書いてください..."
              rows={6}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {result && (
            <div
              style={{
                padding: 14,
                marginBottom: 12,
                background: result.is_success
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(239,68,68,0.08)",
                borderRadius: 10,
                border: `1px solid ${result.is_success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: result.is_success ? "#22c55e" : "#ef4444", marginBottom: 6 }}>
                {result.is_success ? "✅ フィッシング成功！" : `❌ スコア: ${result.score}/100`}
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.6 }}>
                {result.feedback}
              </p>
              <p style={{ fontSize: 12, color: "#e2e8f0", margin: 0 }}>
                💬 {session.target_profile.name}: 「{result.victim_reaction}」
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep("sns")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ← 調査に戻る
            </button>
            <button
              onClick={sendPhishing}
              disabled={loading || !email.subject || !email.body}
              style={{
                flex: 2,
                padding: "12px 0",
                background:
                  email.subject && email.body
                    ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                    : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 10,
                color: email.subject && email.body ? "white" : "#64748b",
                fontWeight: 700,
                fontSize: 14,
                cursor: email.subject && email.body ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "送信中..." : "📨 メール送信"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
