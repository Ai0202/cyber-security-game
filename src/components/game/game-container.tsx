"use client";

import { useState, useCallback } from "react";
import StealthMeter from "@/components/ui/stealth-meter";
import PhaseTransition from "@/components/ui/phase-transition";
import ReconPhase from "@/components/game/recon-phase";
import PasswordPhase from "@/components/game/password-phase";
import NetworkPhase from "@/components/game/network-phase";
import RansomwarePhase from "@/components/game/ransomware-phase";
import type { TargetProfile, Clue } from "@/lib/types";

interface GameContainerProps {
  sessionId: string;
  initialTargetProfile: TargetProfile;
}

export default function GameContainer({ sessionId, initialTargetProfile }: GameContainerProps) {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [stealth, setStealth] = useState(100);
  const [showTransition, setShowTransition] = useState(true);
  const [clues, setClues] = useState<Clue[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const advancePhase = useCallback(() => {
    if (phase < 4) {
      const nextPhase = (phase + 1) as 2 | 3 | 4;
      setPhase(nextPhase);
      setShowTransition(true);
    }
  }, [phase]);

  const refreshState = async () => {
    const res = await fetch(`/api/game/${sessionId}/state`);
    const data = await res.json();
    setStealth(data.stealth);
    setClues(data.collectedClues);
  };

  const handleStealthChange = (newStealth: number) => {
    setStealth(newStealth);
  };

  const handlePhaseComplete = () => {
    refreshState();
    advancePhase();
  };

  const handleGameComplete = () => {
    setGameComplete(true);
  };

  if (gameComplete) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">🏁</div>
        <div className="text-xl font-bold text-white mb-2">ゲーム完了！</div>
        <a
          href={`/game/${sessionId}/report`}
          className="inline-block mt-4 py-2.5 px-6 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold no-underline"
        >
          📊 レポートを見る
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showTransition && (
        <PhaseTransition phase={phase} onComplete={() => setShowTransition(false)} />
      )}

      <StealthMeter stealth={stealth} />

      {/* Phase indicator */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((p) => (
          <div
            key={p}
            className={`flex-1 h-1 rounded-full ${p === phase ? "bg-cyan-400" : p < phase ? "bg-green-500" : "bg-white/[.08]"}`}
          />
        ))}
      </div>

      {phase === 1 && (
        <ReconPhase
          sessionId={sessionId}
          targetProfile={initialTargetProfile}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 2 && (
        <PasswordPhase
          sessionId={sessionId}
          clues={clues}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 3 && (
        <NetworkPhase
          sessionId={sessionId}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 4 && (
        <RansomwarePhase
          sessionId={sessionId}
          onGameComplete={handleGameComplete}
          onStealthChange={handleStealthChange}
        />
      )}
    </div>
  );
}
