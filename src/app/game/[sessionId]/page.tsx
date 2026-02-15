import GameContainer from "@/components/game/game-container";
import { TARGET_PROFILE } from "@/lib/scenarios";

interface GamePageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { sessionId } = await params;

  return <GameContainer sessionId={sessionId} initialTargetProfile={TARGET_PROFILE} />;
}
