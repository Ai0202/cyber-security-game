export default function StealthMeter({ stealth }: { stealth: number }) {
  const color = stealth > 70 ? "#22c55e" : stealth > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[.02] rounded-lg border border-white/[.06]">
      <span className="text-xs text-slate-500 font-semibold">STEALTH</span>
      <div className="flex-1 h-2 bg-white/[.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${stealth}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{stealth}%</span>
    </div>
  );
}
