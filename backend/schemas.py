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
