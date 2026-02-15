"""ゲームセッションの状態管理（インメモリ）"""
import uuid
from datetime import datetime


class GameSession:
    def __init__(self):
        self.id = str(uuid.uuid4())
        self.current_phase = 1
        self.stealth = 100
        self.started_at = datetime.now().isoformat()
        self.phase_results = {}
        self.collected_clues = []
        self.discovered_nodes = ["pc_tanaka", "file_server", "mail_server", "firewall"]
        self.compromised_nodes = []
        self.has_admin = False
        self.backup_disabled = False
        self.password_attempts = 0
        self.detection_level = 0
        self.action_log = []

    def log_action(self, phase: int, action: str, detail: str = ""):
        self.action_log.append({
            "phase": phase,
            "action": action,
            "detail": detail,
            "timestamp": datetime.now().isoformat(),
            "stealth": self.stealth,
        })

    def reduce_stealth(self, amount: int):
        self.stealth = max(0, self.stealth - amount)

    def to_dict(self):
        return {
            "id": self.id,
            "current_phase": self.current_phase,
            "stealth": self.stealth,
            "collected_clues": self.collected_clues,
            "discovered_nodes": self.discovered_nodes,
            "compromised_nodes": self.compromised_nodes,
            "has_admin": self.has_admin,
            "backup_disabled": self.backup_disabled,
            "password_attempts": self.password_attempts,
            "detection_level": self.detection_level,
        }


class GameStateManager:
    def __init__(self):
        self.sessions: dict[str, GameSession] = {}

    def create_session(self) -> GameSession:
        session = GameSession()
        self.sessions[session.id] = session
        return session

    def get_session(self, session_id: str) -> GameSession | None:
        return self.sessions.get(session_id)

    def delete_session(self, session_id: str):
        self.sessions.pop(session_id, None)


game_state_manager = GameStateManager()
