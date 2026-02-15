import ReconPhase from "./phases/ReconPhase";
import PasswordPhase from "./phases/PasswordPhase";
import NetworkPhase from "./phases/NetworkPhase";
import RansomwarePhase from "./phases/RansomwarePhase";

export default function PhaseManager({
  session,
  phase,
  stealth,
  onAdvancePhase,
  onUpdateStealth,
  onFinish,
}) {
  const props = { session, stealth, onAdvancePhase, onUpdateStealth, onFinish };

  switch (phase) {
    case 1:
      return <ReconPhase {...props} />;
    case 2:
      return <PasswordPhase {...props} />;
    case 3:
      return <NetworkPhase {...props} />;
    case 4:
      return <RansomwarePhase {...props} />;
    default:
      return <div style={{ color: "#94a3b8", textAlign: "center" }}>Loading...</div>;
  }
}
