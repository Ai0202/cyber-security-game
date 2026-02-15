from pydantic import BaseModel
from typing import List, Optional

class ActionRequest(BaseModel):
    action_type: str  # "click", "input", "monitor"
    target_id: Optional[str] = None
    input_value: Optional[str] = None

class CharacterReaction(BaseModel):
    character: str
    reaction_type: str  # "normal", "surprised", "panicked", "angry"
    message: str
    emoji: str

class ChatRequest(BaseModel):
    messages: List[dict]  # [{"role": "user", "content": "..."}]

class ChatResponse(BaseModel):
    reply: str
    alert_level: int
    is_game_over: bool

class PhishingEvaluationRequest(BaseModel):
    subject: str
    body: str
    sender: str

class PhishingEvaluationResponse(BaseModel):
    score: int
    feedback: str
    is_success: bool

# --- ゲームセッション ---

class GameStartResponse(BaseModel):
    session_id: str
    phase: int
    stealth: int
    target_profile: dict

class GameStateResponse(BaseModel):
    session_id: str
    current_phase: int
    stealth: int
    collected_clues: list
    discovered_nodes: list
    compromised_nodes: list
    has_admin: bool
    backup_disabled: bool
    password_attempts: int
    detection_level: int

# --- Phase 1: 偵察 & フィッシング ---

class CollectClueRequest(BaseModel):
    session_id: str
    post_id: str

class CollectClueResponse(BaseModel):
    success: bool
    clue_type: str
    clue_description: str
    total_clues: int

class PhishingEmailRequest(BaseModel):
    session_id: str
    subject: str
    body: str
    sender: str

class PhishingEmailResponse(BaseModel):
    score: int
    feedback: str
    is_success: bool
    victim_reaction: str
    stealth: int

# --- Phase 2: パスワード突破 ---

class PasswordAttemptRequest(BaseModel):
    session_id: str
    password: str

class PasswordAttemptResponse(BaseModel):
    success: bool
    message: str
    attempts_remaining: int
    stealth: int
    hint: Optional[dict] = None
    locked_out: bool

# --- Phase 3: ネットワーク侵入 ---

class NetworkActionRequest(BaseModel):
    session_id: str
    action: str  # "scan", "access", "exploit"
    node_id: str

class NetworkActionResponse(BaseModel):
    success: bool
    message: str
    discovered_nodes: list
    files_found: list
    defender_reaction: dict
    detection_level: int
    stealth: int
    has_admin: bool

# --- Phase 4: ランサムウェア展開 ---

class RansomwareActionRequest(BaseModel):
    session_id: str
    action: str  # "encrypt", "disable_backup", "ransom_message"
    target_nodes: Optional[list] = None
    speed: Optional[str] = None  # "slow", "fast"
    ransom_message: Optional[str] = None

class RansomwareActionResponse(BaseModel):
    success: bool
    message: str
    encrypted_nodes: list
    backup_disabled: bool
    defender_reaction: dict
    stealth: int
    detection_level: int

# --- 最終レポート ---

class FinalReportResponse(BaseModel):
    rank: str
    summary: str
    phase_feedback: list
    key_learning: str
    stealth: int
