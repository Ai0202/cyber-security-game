from fastapi import APIRouter
from backend.schemas import (
    ActionRequest, CharacterReaction, 
    ChatRequest, ChatResponse,
    PhishingEvaluationRequest, PhishingEvaluationResponse
)
from backend.services.ai_service import ai_service

router = APIRouter()

@router.post("/stage/{stage_id}/action", response_model=CharacterReaction)
async def stage_action(stage_id: int, request: ActionRequest):
    # Determine character based on stage
    character_map = {1: "mamoru", 2: "passuwa", 3: "mailer", 4: "crypto"}
    character = character_map.get(stage_id, "shadow")
    
    result = await ai_service.get_character_reaction(character, request.action_type)
    
    return CharacterReaction(
        character=character,
        reaction_type=result["type"],
        message=result["message"],
        emoji=result["emoji"]
    )

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await ai_service.chat_with_employee(request.messages)
    return ChatResponse(**result)

@router.post("/phishing/evaluate", response_model=PhishingEvaluationResponse)
async def evaluate_phishing(request: PhishingEvaluationRequest):
    result = await ai_service.evaluate_phishing(request.subject, request.body)
    return PhishingEvaluationResponse(**result)
