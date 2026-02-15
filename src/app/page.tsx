"use client";

import { useState } from "react";
import { STAGES, STAGE_DESCRIPTIONS } from "@/data/stages";

export default function HomePage() {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  return (
    <div>
      {/* Attack Side Banner */}
      <div className="flex items-center gap-2.5 p-3.5 px-4 bg-red-500/[.06] rounded-xl border border-red-500/[.12] mb-5">
        <span className="text-[22px]">👤</span>
        <div>
          <div className="text-[13px] font-bold text-red-300">
            ATTACK SIDE — 攻撃者体験
          </div>
          <div className="text-[11px] text-slate-400">
            シャドウを操作して企業への侵入を試みよ
          </div>
        </div>
      </div>

      {/* Stage List */}
      <div className="flex flex-col gap-2.5">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
            className="p-4 rounded-[14px] text-left transition-all duration-[250ms] border cursor-pointer"
            style={{
              background: selectedStage === stage.id
                ? `linear-gradient(135deg, ${stage.color}15, ${stage.color}08)`
                : "rgba(255,255,255,0.02)",
              borderColor: selectedStage === stage.id
                ? `${stage.color}40`
                : "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[22px] shrink-0"
                style={{ background: `${stage.color}18` }}
              >
                {stage.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-200">
                  Stage {stage.id}: {stage.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {stage.subtitle}
                </div>
              </div>
              <div className="flex gap-[3px]">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: d <= stage.difficulty ? stage.color : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>

            {selectedStage === stage.id && (
              <div className="mt-3.5 pt-3.5 border-t border-white/[.06] text-xs text-slate-400 leading-[1.7]">
                {STAGE_DESCRIPTIONS[stage.id]}
                <div
                  className="mt-2.5 py-2 px-3.5 rounded-lg text-center font-bold text-[13px] cursor-pointer"
                  style={{ background: `${stage.color}12`, color: stage.color }}
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
