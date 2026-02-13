import os
import json
# In a real implementation, we would import anthropic client
# from anthropic import Anthropic

# Mock implementation for prototype without API key
class AIService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        # self.client = Anthropic(api_key=self.api_key)

    async def get_character_reaction(self, character: str, action: str) -> dict:
        # Mock response for prototype
        reactions = {
            "mamoru": {
                "message": "不審な通信を検知しました。アクセスログを確認します。",
                "emoji": "🛡️",
                "type": "alert"
            },
            "passuwa": {
                "message": "うぐぐ…そのパスワードは…強力すぎる…！",
                "emoji": "🔑",
                "type": "panicked"
            },
            "mailer": {
                "message": "わあ！素敵なメールが届いたよ！開いちゃおうかな？",
                "emoji": "📧",
                "type": "excited"
            }
        }
        return reactions.get(character, {"message": "...", "emoji": "😐", "type": "normal"})

    async def chat_with_employee(self, messages: list) -> dict:
        # Mock response logic
        last_msg = messages[-1]["content"]
        alert_level = 0
        reply = "はい、経理部の鈴木です。何かご用でしょうか？"
        
        if "パスワード" in last_msg or "教えて" in last_msg:
            alert_level = 60
            reply = "パスワードですか？それはお教えできません。規定で決まっていますので。"
        elif "緊急" in last_msg:
            alert_level = 30
            reply = "緊急ですか？担当者に確認しますので少々お待ちください。"
            
        return {
            "reply": reply,
            "alert_level": alert_level,
            "is_game_over": alert_level >= 100
        }

    async def evaluate_phishing(self, subject: str, body: str) -> dict:
        score = 0
        feedback = ""
        
        if "緊急" in subject or "重要" in subject:
            score += 30
            feedback += "緊急性を煽る件名は効果的です。 "
        
        if "リンク" in body or "http" in body:
            score += 40
            feedback += "リンクへの誘導が自然です。 "

        return {
            "score": min(score, 100),
            "feedback": feedback or "もう少し騙す要素を入れましょう。",
            "is_success": score > 60
        }

ai_service = AIService()
