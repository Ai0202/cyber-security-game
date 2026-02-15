import { useState } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import StageSelect from './components/StageSelect';
import Characters from './components/Characters';
import DemoView from './components/DemoView';
import GameContainer from './components/game/GameContainer';

function App() {
  const [view, setView] = useState("home");

  if (view === "game") {
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
        <div className="bg-grid" />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
          <GameContainer onExit={() => setView("home")} />
        </div>
      </div>
    );
  }

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
      <div className="bg-grid" />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>

        <Header />

        <Navigation view={view} setView={setView} />

        {view === "home" && <StageSelect onStartGame={() => setView("game")} />}

        {view === "characters" && <Characters />}

        {view === "demo" && <DemoView />}

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

export default App;
