export default function StealthMeter({ stealth }) {
  const color =
    stealth >= 70 ? "#22c55e" : stealth >= 40 ? "#eab308" : "#ef4444";

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1 }}>
          🥷 STEALTH
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{stealth}%</span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${stealth}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.5s ease, background 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
