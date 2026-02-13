import { useState } from "react";
import { apiPost } from "../../../api";

const NODE_ICONS = {
  pc: "💻",
  server: "🖥️",
  backup: "💾",
  firewall: "🛡️",
};

const NODE_COLORS = {
  pc: "#3b82f6",
  server: "#8b5cf6",
  backup: "#22c55e",
  firewall: "#ef4444",
};

const INITIAL_NODES = {
  pc_tanaka: { name: "田中のPC", type: "pc" },
  file_server: { name: "ファイルサーバー", type: "server" },
  mail_server: { name: "メールサーバー", type: "server" },
  firewall: { name: "ファイアウォール", type: "firewall" },
  admin_pc: { name: "管理者端末", type: "pc" },
  backup_server: { name: "バックアップサーバー", type: "backup" },
};

export default function NetworkPhase({ session, onAdvancePhase, onUpdateStealth, stealth }) {
  const [discovered, setDiscovered] = useState(
    new Set(["pc_tanaka", "file_server", "mail_server", "firewall"])
  );
  const [compromised, setCompromised] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [files, setFiles] = useState([]);
  const [defenderMsg, setDefenderMsg] = useState(null);
  const [detectionLevel, setDetectionLevel] = useState(0);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const doAction = async (action, nodeId) => {
    setLoading(true);
    try {
      const data = await apiPost("/game/phase3/action", {
        session_id: session.session_id,
        action,
        node_id: nodeId,
      });

      setDiscovered(new Set(data.discovered_nodes));
      setCompromised((prev) => {
        const next = new Set(prev);
        if (action === "access") next.add(nodeId);
        return next;
      });
      if (data.files_found.length > 0) setFiles(data.files_found);
      setDetectionLevel(data.detection_level);
      setDefenderMsg(data.defender_reaction);
      setHasAdmin(data.has_admin);
      onUpdateStealth(data.stealth);

      setLog((prev) => [
        ...prev,
        { action, node: nodeId, message: data.message },
      ]);

      if (data.has_admin) {
        setTimeout(() => onAdvancePhase(4, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const discoveredArray = Array.from(discovered);

  return (
    <div>
      <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 3 — ネットワーク侵入
      </div>

      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
        ネットワーク内のノードを探索し、管理者権限を奪取してください。
        行動するたびに検知レベルが上がります。
      </p>

      {/* 検知レベル */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>🔍 検知レベル</span>
          <span style={{ color: detectionLevel >= 80 ? "#ef4444" : detectionLevel >= 50 ? "#eab308" : "#22c55e" }}>
            {detectionLevel}/100
          </span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(detectionLevel, 100)}%`,
              background: detectionLevel >= 80 ? "#ef4444" : detectionLevel >= 50 ? "#eab308" : "#22c55e",
              transition: "width 0.5s",
            }}
          />
        </div>
      </div>

      {/* ネットワークマップ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {discoveredArray.map((nodeId) => {
          const info = INITIAL_NODES[nodeId];
          if (!info) return null;
          const isSelected = selectedNode === nodeId;
          const isCompromised = compromised.has(nodeId);

          return (
            <div
              key={nodeId}
              onClick={() => setSelectedNode(nodeId)}
              style={{
                padding: 12,
                background: isSelected
                  ? `rgba(${nodeId === "firewall" ? "239,68,68" : "59,130,246"},0.12)`
                  : "rgba(255,255,255,0.04)",
                borderRadius: 10,
                border: `1px solid ${
                  isSelected
                    ? NODE_COLORS[info.type]
                    : "rgba(255,255,255,0.08)"
                }`,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
                position: "relative",
              }}
            >
              {isCompromised && (
                <div style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "#22c55e" }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: 24, marginBottom: 4 }}>
                {NODE_ICONS[info.type]}
              </div>
              <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>
                {info.name}
              </div>
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
                {isCompromised ? "侵入済" : "未侵入"}
              </div>
            </div>
          );
        })}
      </div>

      {/* アクションボタン */}
      {selectedNode && selectedNode !== "firewall" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => doAction("scan", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 8,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔍 スキャン
          </button>
          <button
            onClick={() => doAction("access", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 8,
              color: "#a78bfa",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔑 アクセス
          </button>
          <button
            onClick={() => doAction("exploit", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            💥 権限奪取
          </button>
        </div>
      )}

      {/* 発見ファイル */}
      {files.length > 0 && (
        <div style={{ marginBottom: 12, padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>
            📂 発見したファイル
          </div>
          {files.map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: "#94a3b8", padding: "2px 0" }}>
              📄 {f}
            </div>
          ))}
        </div>
      )}

      {/* 防御側リアクション */}
      {defenderMsg && (
        <div
          style={{
            padding: 12,
            background: "rgba(239,68,68,0.06)",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,0.15)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>
            {defenderMsg.emoji} マモル（ファイアウォール）
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            「{defenderMsg.message}」
          </p>
          {defenderMsg.action !== "none" && (
            <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>
              ⚡ アクション: {defenderMsg.action}
            </div>
          )}
        </div>
      )}

      {/* ログ */}
      {log.length > 0 && (
        <div style={{ maxHeight: 120, overflowY: "auto", fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
          {log.map((l, i) => (
            <div key={i} style={{ padding: "2px 0" }}>
              [{l.action}] {l.message}
            </div>
          ))}
        </div>
      )}

      {hasAdmin && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            background: "rgba(34,197,94,0.1)",
            borderRadius: 10,
            border: "1px solid rgba(34,197,94,0.3)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#22c55e", fontSize: 14, fontWeight: 700, margin: 0 }}>
            🔓 管理者権限を奪取しました！
          </p>
        </div>
      )}
    </div>
  );
}
