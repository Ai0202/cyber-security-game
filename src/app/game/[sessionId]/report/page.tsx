import type { FinalReport } from "@/lib/types";

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

async function getReport(sessionId: string): Promise<FinalReport & { stealth: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/game/${sessionId}/report`, { cache: "no-store" });
  return res.json();
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;
  const report = await getReport(sessionId);

  const rankColors: Record<string, string> = {
    S: "#f59e0b", A: "#22c55e", B: "#3b82f6", C: "#a855f7", D: "#ef4444",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-6">
        <div className="text-5xl mb-3" style={{ color: rankColors[report.rank] }}>
          {report.rank}
        </div>
        <div className="text-lg font-bold text-white">攻撃完了レポート</div>
        <div className="text-xs text-slate-500 mt-1">ステルス度: {report.stealth}%</div>
      </div>

      <div className="p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
        <div className="text-sm font-bold text-slate-300 mb-2">概要</div>
        <p className="text-xs text-slate-400 leading-relaxed m-0">{report.summary}</p>
      </div>

      {report.phaseFeedback.map((pf) => (
        <div key={pf.phase} className="p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-slate-300">Phase {pf.phase}: {pf.title}</div>
            <div className="text-xs font-bold text-cyan-400">{pf.score}点</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{pf.feedback}</p>
        </div>
      ))}

      <div className="p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
        <div className="text-sm font-bold text-amber-400 mb-2">学んだこと</div>
        {report.keyLearning.map((learning, i) => (
          <div key={i} className="text-xs text-slate-300 mb-1">• {learning}</div>
        ))}
      </div>

      <a
        href="/"
        className="text-center py-2.5 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold no-underline"
      >
        🏠 トップに戻る
      </a>
    </div>
  );
}
