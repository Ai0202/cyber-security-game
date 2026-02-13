import { useState, useEffect, useRef } from "react";

const CHARACTERS = {
  mamoru: { name: "マモル", role: "ファイアウォール", emoji: "🛡️", color: "#2563eb", desc: "真面目な門番。外部からの侵入を防ぐ" },
  passuwa: { name: "パスワ", role: "パスワード", emoji: "🔑", color: "#d97706", desc: "強さで姿が変わる鍵の番人" },
  crypto: { name: "クリプト", role: "暗号化", emoji: "🥷", color: "#7c3aed", desc: "データを暗号の衣で守る忍者" },
  mailer: { name: "メーラ", role: "メールクライアント", emoji: "📧", color: "#e11d48", desc: "おしゃべりで人を疑わない" },
  shadow: { name: "シャドウ", role: "攻撃者", emoji: "👤", color: "#1e293b", desc: "あなたが操る攻撃者" },
};

const STAGES = [
  {
    id: 1,
    title: "ショルダーハッキング",
    subtitle: "覗き見で情報を盗め",
    icon: "👁️",
    difficulty: 1,
    mode: "attack",
    color: "#f59e0b",
  },
  {
    id: 2,
    title: "パスワードクラッキング",
    subtitle: "弱いパスワードを突破せよ",
    icon: "🔓",
    difficulty: 2,
    mode: "attack",
    color: "#ef4444",
  },
  {
    id: 3,
    title: "フィッシング攻撃",
    subtitle: "偽メールで騙せ",
    icon: "🎣",
    difficulty: 2,
    mode: "attack",
    color: "#8b5cf6",
  },
  {
    id: 4,
    title: "ランサムウェア侵攻",
    subtitle: "サーバーを暗号化せよ",
    icon: "💀",
    difficulty: 3,
    mode: "attack",
    color: "#dc2626",
  },
  {
    id: 5,
    title: "ソーシャルエンジニアリング",
    subtitle: "人間の隙を突け",
    icon: "🎭",
    difficulty: 3,
    mode: "attack",
    color: "#6366f1",
  },
  {
    id: 6,
    title: "公衆Wi-Fi攻撃",
    subtitle: "偽アクセスポイントを仕掛けろ",
    icon: "📡",
    difficulty: 2,
    mode: "attack",
    color: "#0891b2",
  },
];

const PASSWORDS = [
  { value: "password", time: "0.001秒", strength: 3, label: "辞書攻撃で瞬殺" },
  { value: "1234567890", time: "0.01秒", strength: 5, label: "数字だけは危険" },
  { value: "tanaka1985", time: "3分", strength: 20, label: "名前＋生年は推測可能" },
  { value: "Coffee#Mug42", time: "3ヶ月", strength: 55, label: "まあまあ強い" },
  { value: "Xk#9pL!2qW$m", time: "推定380年", strength: 95, label: "突破ほぼ不可能" },
];

function PixelGrid({ encrypted, progress }) {
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

function PasswordDemo() {
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

function RansomwareDemo() {
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

function ShoulderHackDemo() {
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
}

export default function CyberGuardians() {
  const [view, setView] = useState("home");
  const [selectedStage, setSelectedStage] = useState(null);
  const [activeDemo, setActiveDemo] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e1a",
        color: "#e2e8f0",
        fontFamily: "'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "auto",
      }}
    >
      {/* Background grid effect */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
        {/* Header */}
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

        {/* Navigation */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
          {[
            { id: "home", label: "ステージ", icon: "⚔️" },
            { id: "characters", label: "キャラ", icon: "👥" },
            { id: "demo", label: "体験デモ", icon: "🎮" },
          ].map((tab) => (
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

        {/* Home - Stage Select */}
        {view === "home" && (
          <div>
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(239,68,68,0.06)",
                borderRadius: 12,
                border: "1px solid rgba(239,68,68,0.12)",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>👤</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fca5a5" }}>
                  ATTACK SIDE — 攻撃者体験
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>
                  シャドウを操作して企業への侵入を試みよ
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                  style={{
                    padding: "16px",
                    background:
                      selectedStage === stage.id
                        ? `linear-gradient(135deg, ${stage.color}15, ${stage.color}08)`
                        : "rgba(255,255,255,0.02)",
                    border: selectedStage === stage.id ? `1px solid ${stage.color}40` : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 14,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.25s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: `${stage.color}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {stage.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
                        Stage {stage.id}: {stage.title}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                        {stage.subtitle}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[1, 2, 3].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: d <= stage.difficulty ? stage.color : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {selectedStage === stage.id && (
                    <div
                      style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        fontSize: 12,
                        color: "#94a3b8",
                        lineHeight: 1.7,
                      }}
                    >
                      {stage.id === 1 && "カフェで仕事中の社員を観察し、画面の覗き見・付箋のパスワード・社員証の情報を見つけ出します。物理的なセキュリティの重要性を体感。"}
                      {stage.id === 2 && "盗んだパスワードハッシュに対して辞書攻撃・ブルートフォースを実行。弱いパスワードが0.001秒で突破される衝撃を体験。"}
                      {stage.id === 3 && "本物そっくりの偽メールを作成してターゲットに送信。キャラクター「メーラ」がうっかり開いてしまう場面を目撃。"}
                      {stage.id === 4 && "侵入後、クリプトの暗号化能力を悪用してサーバー内のファイルを次々と暗号化。身代金要求画面を作成し、バックアップの重要性を学ぶ。"}
                      {stage.id === 5 && "AIチャットで社員になりすまし、電話やメールで機密情報を聞き出す。相手の警戒レベルゲージが上がるとゲームオーバー。"}
                      {stage.id === 6 && "カフェに偽Wi-Fiアクセスポイントを設置し、接続してきた人の通信を傍受。VPNの重要性を理解。"}
                      <div
                        style={{
                          marginTop: 10,
                          padding: "8px 14px",
                          background: `${stage.color}12`,
                          borderRadius: 8,
                          textAlign: "center",
                          color: stage.color,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        ▶ ステージ開始
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Characters */}
        {view === "characters" && (
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
        )}

        {/* Interactive Demos */}
        {view === "demo" && (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {[
                { id: "shoulder", label: "👁️ 覗き見", color: "#f59e0b" },
                { id: "password", label: "🔓 パスワード", color: "#ef4444" },
                { id: "ransom", label: "💀 ランサム", color: "#dc2626" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setActiveDemo(d.id)}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    background: activeDemo === d.id ? `${d.color}15` : "rgba(255,255,255,0.02)",
                    border: activeDemo === d.id ? `1px solid ${d.color}35` : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    color: activeDemo === d.id ? d.color : "#64748b",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {!activeDemo && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🎮</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>上のタブから体験デモを選択</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  インタラクティブに攻撃を体験できます
                </div>
              </div>
            )}

            {activeDemo === "shoulder" && (
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#f59e0b" }}>
                  👁️ ショルダーハッキング体験
                </div>
                <ShoulderHackDemo />
              </div>
            )}

            {activeDemo === "password" && (
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#ef4444" }}>
                  🔓 パスワードクラッキング体験
                </div>
                <PasswordDemo />
              </div>
            )}

            {activeDemo === "ransom" && (
              <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: "#dc2626" }}>
                  💀 ランサムウェア体験
                </div>
                <RansomwareDemo />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 32, paddingBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#334155", letterSpacing: 1 }}>
            CONCEPT PROTOTYPE — CyberGuardians v0.1
          </div>
        </div>
      </div>
    </div>
  );
}