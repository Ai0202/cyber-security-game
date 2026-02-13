import React, { useState } from 'react';
import { STAGES } from '../data';

export default function StageSelect({ onStartGame }) {
  const [selectedStage, setSelectedStage] = useState(null);

  const getStageDescription = (id) => {
    switch(id) {
      case 1: return "カフェで仕事中の社員を観察し、画面の覗き見・付箋のパスワード・社員証の情報を見つけ出します。物理的なセキュリティの重要性を体感。";
      case 2: return "盗んだパスワードハッシュに対して辞書攻撃・ブルートフォースを実行。弱いパスワードが0.001秒で突破される衝撃を体験。";
      case 3: return "本物そっくりの偽メールを作成してターゲットに送信。キャラクター「メーラ」がうっかり開いてしまう場面を目撃。";
      case 4: return "侵入後、クリプトの暗号化能力を悪用してサーバー内のファイルを次々と暗号化。身代金要求画面を作成し、バックアップの重要性を学ぶ。";
      case 5: return "AIチャットで社員になりすまし、電話やメールで機密情報を聞き出す。相手の警戒レベルゲージが上がるとゲームオーバー。";
      case 6: return "カフェに偽Wi-Fiアクセスポイントを設置し、接続してきた人の通信を傍受。VPNの重要性を理解。";
      default: return "";
    }
  };

  return (
    <div>
      {/* ランサムウェア攻撃チェーン - メインゲーム */}
      {onStartGame && (
        <div
          onClick={onStartGame}
          style={{
            padding: 20,
            marginBottom: 20,
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
            borderRadius: 14,
            border: "1px solid rgba(124,58,237,0.3)",
            cursor: "pointer",
            textAlign: "center",
            transition: "transform 0.2s",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>
            OPERATION: RANSOMWARE
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
            攻撃チェーンを体験する4フェーズゲーム
          </div>
          <div
            style={{
              marginTop: 12,
              padding: "8px 24px",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              borderRadius: 8,
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              display: "inline-block",
            }}
          >
            プレイする →
          </div>
        </div>
      )}

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
                {getStageDescription(stage.id)}
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
  );
}
