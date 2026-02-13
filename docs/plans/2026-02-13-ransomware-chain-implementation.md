# ランサムウェア攻撃チェーン 実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 4フェーズの攻撃チェーンゲーム（偵察→PW突破→ネットワーク侵入→ランサムウェア展開）をGemini AI連携で実装する

**Architecture:** フロントエンドはReact（既存App.jsxにゲームモードを追加）、バックエンドはFastAPI（既存を拡張）。ゲーム状態はバックエンド側でインメモリ管理し、各フェーズのユーザー操作をAPIで送信、Gemini APIで動的レスポンスを生成する。

**Tech Stack:** React 19 + Vite 7 / FastAPI + google-generativeai / Gemini API

---

## Task 1: バックエンド基盤 — Gemini AI統合 & ゲーム状態管理

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/services/ai_service.py`
- Create: `backend/services/game_state.py`
- Create: `backend/scenarios/ransomware_chain.py`
- Create: `backend/scenarios/__init__.py`

**Step 1: requirements.txt に Gemini SDK を追加**

`backend/requirements.txt` を以下に置き換え:

```
fastapi
uvicorn
pydantic
google-generativeai
python-dotenv
```

**Step 2: pip install**

Run: `cd /Users/ikeda_atsushi/workspace/github.com/Ai0202/cyber-security-game && source .venv/bin/activate && pip install -r backend/requirements.txt`

**Step 3: シナリオデータ定義を作成**

`backend/scenarios/__init__.py` — 空ファイル

`backend/scenarios/ransomware_chain.py`:

```python
"""ランサムウェア攻撃チェーン シナリオデータ"""

TARGET_PROFILE = {
    "name": "田中太郎",
    "department": "経理部",
    "company": "サイバーコーポレーション",
    "sns_posts": [
        {
            "id": "post1",
            "type": "photo",
            "text": "愛犬ポチとお散歩🐕 今日も元気いっぱい！ #犬のいる生活",
            "clue": "pet_name",
            "clue_value": "pochi",
        },
        {
            "id": "post2",
            "type": "text",
            "text": "誕生日にケーキもらった🎂 もう40歳か〜早いなぁ。1985年生まれが信じられない",
            "clue": "birth_year",
            "clue_value": "1985",
        },
        {
            "id": "post3",
            "type": "photo",
            "text": "新しいオフィスに引っ越し完了！ホワイトボードに書いた目標達成するぞ💪",
            "clue": "office_hint",
            "clue_value": "whiteboard_url",
            "hidden_detail": "写真の背景のホワイトボードに 'mail.cyberco.jp' と書かれている",
        },
        {
            "id": "post4",
            "type": "text",
            "text": "パスワード変えろって言われたけど、覚えやすいのがいいんだよな〜",
            "clue": "password_habit",
            "clue_value": "easy_password",
        },
        {
            "id": "post5",
            "type": "text",
            "text": "今日は経理部の飲み会！上司の鈴木部長、いつも奢ってくれるんだよな〜",
            "clue": "boss_name",
            "clue_value": "suzuki",
        },
    ],
    "correct_passwords": ["pochi1985", "Pochi1985", "pochi85"],
    "email_domain": "cyberco.jp",
}

NETWORK_NODES = [
    {
        "id": "pc_tanaka",
        "name": "田中のPC",
        "type": "pc",
        "visible": True,
        "x": 1, "y": 1,
        "files": ["経費申請.xlsx", "議事録.docx"],
        "has_admin": False,
    },
    {
        "id": "file_server",
        "name": "ファイルサーバー",
        "type": "server",
        "visible": True,
        "x": 3, "y": 1,
        "files": ["顧客リスト.csv", "売上データ.xlsx", "社員名簿.xlsx"],
        "has_admin": False,
    },
    {
        "id": "mail_server",
        "name": "メールサーバー",
        "type": "server",
        "visible": True,
        "x": 2, "y": 0,
        "files": [],
        "has_admin": False,
    },
    {
        "id": "admin_pc",
        "name": "管理者端末",
        "type": "pc",
        "visible": False,
        "x": 4, "y": 2,
        "files": ["admin_password.txt", "network_config.yaml"],
        "has_admin": True,
        "discovery_hint": "田中のPCのログに 'maintenance@admin-pc' のSSH接続記録がある",
    },
    {
        "id": "backup_server",
        "name": "バックアップサーバー",
        "type": "backup",
        "visible": False,
        "x": 5, "y": 1,
        "files": ["backup_20240101.tar.gz", "backup_20240201.tar.gz"],
        "has_admin": False,
        "discovery_hint": "管理者端末の network_config.yaml にバックアップサーバーのIPが記載されている",
    },
    {
        "id": "firewall",
        "name": "ファイアウォール (マモル)",
        "type": "firewall",
        "visible": True,
        "x": 0, "y": 1,
        "files": [],
        "has_admin": False,
    },
]

PHASE_CONFIG = {
    "phase1": {
        "name": "偵察 & フィッシング",
        "description": "ターゲットのSNSを調査し、フィッシングメールを作成せよ",
        "stealth_penalty_per_retry": 5,
        "phishing_success_threshold": 60,
    },
    "phase2": {
        "name": "パスワード突破",
        "description": "収集した情報からパスワードを推理せよ",
        "max_attempts": 5,
        "stealth_penalty_per_attempt": 10,
    },
    "phase3": {
        "name": "社内ネットワーク侵入",
        "description": "ネットワークを探索し、管理者権限を奪取せよ",
        "detection_increase_per_action": 8,
        "detection_threshold": 100,
    },
    "phase4": {
        "name": "ランサムウェア展開",
        "description": "ファイルを暗号化し、身代金を要求せよ",
        "encryption_speed_slow": 3,
        "encryption_speed_fast": 1,
        "fast_detection_penalty": 20,
    },
}
```

**Step 4: ゲーム状態管理サービスを作成**

`backend/services/game_state.py`:

```python
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
```

**Step 5: ai_service.py を Gemini API に書き換え**

`backend/services/ai_service.py`:

```python
"""Gemini AI統合サービス"""
import os
import json
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai


class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
        else:
            self.model = None

    async def evaluate_phishing_email(self, email_subject: str, email_body: str, email_sender: str, target_info: dict) -> dict:
        """Phase 1: フィッシングメールの説得力を評価"""
        if not self.model:
            return self._mock_phishing_eval(email_subject, email_body)

        prompt = f"""あなたはサイバーセキュリティの専門家です。以下のフィッシングメールの説得力を0-100のスコアで評価してください。

ターゲット情報:
- 名前: {target_info.get('name', '田中太郎')}
- 部署: {target_info.get('department', '経理部')}
- 会社: {target_info.get('company', 'サイバーコーポレーション')}

フィッシングメール:
- 差出人: {email_sender}
- 件名: {email_subject}
- 本文: {email_body}

以下のJSON形式で回答してください:
{{
  "score": <0-100の整数>,
  "feedback": "<日本語で2-3文のフィードバック。何が効果的で何が改善できるか>",
  "is_success": <scoreが60以上ならtrue、未満ならfalse>,
  "victim_reaction": "<もしメールを受け取った社員のリアクション（1文、日本語）>"
}}
JSON以外は出力しないでください。"""

        try:
            response = await self.model.generate_content_async(prompt)
            result = json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())
            return result
        except Exception:
            return self._mock_phishing_eval(email_subject, email_body)

    async def generate_password_hint(self, attempts: list[str], correct_passwords: list[str], clues: list[str]) -> dict:
        """Phase 2: パスワード推理のヒントを動的生成"""
        if not self.model:
            return self._mock_password_hint(attempts)

        prompt = f"""あなたはサイバーセキュリティ教育ゲームのヒントシステムです。
プレイヤーはターゲットのパスワードを推理しています。

プレイヤーが収集した手がかり: {json.dumps(clues, ensure_ascii=False)}
これまでの試行: {json.dumps(attempts, ensure_ascii=False)}

答えを直接言わずに、次の試行のヒントを1-2文で出してください。
プレイヤーが正解に近づいているなら「いい線いってる」系のヒントを、遠いなら方向修正のヒントを出してください。

JSON形式で回答:
{{
  "hint": "<ヒント文（日本語）>",
  "closeness": <0-100の近さスコア>
}}
JSON以外は出力しないでください。"""

        try:
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())
        except Exception:
            return self._mock_password_hint(attempts)

    async def get_defender_reaction(self, defender: str, player_action: str, detection_level: int, context: dict) -> dict:
        """Phase 3: 防御側キャラクターの動的リアクション"""
        if not self.model:
            return self._mock_defender_reaction(defender, detection_level)

        prompt = f"""あなたはサイバーセキュリティゲームの防御側キャラクター「{defender}」です。

キャラクター設定:
- マモル: 真面目なファイアウォール。不審な通信を見逃さない門番
- バックアップン: おっとりしたバックアップ担当。いざという時に頼りになる

現在の検知レベル: {detection_level}/100
プレイヤーの行動: {player_action}
コンテキスト: {json.dumps(context, ensure_ascii=False)}

キャラクターとしてリアクションしてください。検知レベルが高いほど警戒し、対策を打ちます。

JSON形式で回答:
{{
  "message": "<セリフ（日本語、1-2文）>",
  "action": "<取る対策: none / alert / block_port / isolate / lockdown>",
  "detection_increase": <この行動による検知レベル上昇値: 0-20>,
  "emoji": "<リアクション絵文字1つ>"
}}
JSON以外は出力しないでください。"""

        try:
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())
        except Exception:
            return self._mock_defender_reaction(defender, detection_level)

    async def generate_final_report(self, action_log: list, stealth: int, phase_results: dict) -> dict:
        """Phase 4完了後: 最終攻撃レポートを生成"""
        if not self.model:
            return self._mock_final_report(stealth)

        prompt = f"""あなたはサイバーセキュリティ教育の専門家です。
プレイヤーが攻撃者として実行した行動ログから、教育的な攻撃レポートを生成してください。

行動ログ: {json.dumps(action_log[-20:], ensure_ascii=False)}
最終ステルス度: {stealth}/100
フェーズ結果: {json.dumps(phase_results, ensure_ascii=False)}

JSON形式で回答:
{{
  "rank": "<S/A/B/C/Dのいずれか>",
  "summary": "<攻撃全体の総評（日本語、2-3文）>",
  "phase_feedback": [
    {{"phase": 1, "title": "偵察&フィッシング", "feedback": "<フィードバック>", "defense_tip": "<この攻撃の防ぎ方>"}},
    {{"phase": 2, "title": "パスワード突破", "feedback": "<フィードバック>", "defense_tip": "<この攻撃の防ぎ方>"}},
    {{"phase": 3, "title": "ネットワーク侵入", "feedback": "<フィードバック>", "defense_tip": "<この攻撃の防ぎ方>"}},
    {{"phase": 4, "title": "ランサムウェア展開", "feedback": "<フィードバック>", "defense_tip": "<この攻撃の防ぎ方>"}}
  ],
  "key_learning": "<最も重要な学び（1文）>"
}}
JSON以外は出力しないでください。"""

        try:
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text.strip().removeprefix("```json").removesuffix("```").strip())
        except Exception:
            return self._mock_final_report(stealth)

    # --- Mock fallbacks ---

    def _mock_phishing_eval(self, subject: str, body: str) -> dict:
        score = 0
        feedback_parts = []
        if "緊急" in subject or "重要" in subject:
            score += 30
            feedback_parts.append("緊急性を煽る件名は効果的です。")
        if "http" in body or "リンク" in body or "こちら" in body:
            score += 30
            feedback_parts.append("リンクへの誘導が含まれています。")
        if "部長" in body or "鈴木" in body:
            score += 20
            feedback_parts.append("社内の人物名を使うのは説得力があります。")
        if "@cyberco.jp" in body or "cyberco" in body:
            score += 20
            feedback_parts.append("社内ドメインの使用は信頼性を高めます。")
        return {
            "score": min(score, 100),
            "feedback": " ".join(feedback_parts) if feedback_parts else "もう少しターゲットの情報を活用して、説得力のあるメールを作りましょう。",
            "is_success": score >= 60,
            "victim_reaction": "うーん、ちょっと怪しいかも…" if score < 60 else "大変だ！すぐ対応しなきゃ！",
        }

    def _mock_password_hint(self, attempts: list[str]) -> dict:
        if not attempts:
            return {"hint": "SNSの投稿をよく見て、個人情報を組み合わせてみましょう。", "closeness": 0}
        last = attempts[-1].lower()
        if "pochi" in last:
            return {"hint": "ペットの名前はいい線いってます！他の情報と組み合わせてみては？", "closeness": 60}
        if "1985" in last:
            return {"hint": "生年の情報を見つけましたね。他にも使えそうな情報がありませんか？", "closeness": 50}
        return {"hint": "SNSの投稿から、ペットの名前や生年月日を探してみましょう。", "closeness": 10}

    def _mock_defender_reaction(self, defender: str, detection_level: int) -> dict:
        if detection_level < 30:
            return {"message": "特に異常なし。通常通り監視中。", "action": "none", "detection_increase": 5, "emoji": "🛡️"}
        if detection_level < 60:
            return {"message": "ん？少し怪しい通信がありますね…ログを確認します。", "action": "alert", "detection_increase": 8, "emoji": "🤔"}
        if detection_level < 80:
            return {"message": "不審なアクセスを検知！一部ポートを閉鎖します！", "action": "block_port", "detection_increase": 10, "emoji": "😠"}
        return {"message": "侵入者だ！全システムをロックダウン！", "action": "lockdown", "detection_increase": 15, "emoji": "🚨"}

    def _mock_final_report(self, stealth: int) -> dict:
        if stealth >= 80:
            rank = "S"
        elif stealth >= 60:
            rank = "A"
        elif stealth >= 40:
            rank = "B"
        elif stealth >= 20:
            rank = "C"
        else:
            rank = "D"
        return {
            "rank": rank,
            "summary": f"ステルス度{stealth}で攻撃を完了しました。{'非常に巧妙な攻撃でした。' if stealth >= 60 else '検知されやすい攻撃でした。セキュリティ対策の重要性を感じてください。'}",
            "phase_feedback": [
                {"phase": 1, "title": "偵察&フィッシング", "feedback": "SNS情報を活用したフィッシングを実行しました。", "defense_tip": "SNSでの個人情報公開を最小限にし、不審メールの見分け方を学びましょう。"},
                {"phase": 2, "title": "パスワード突破", "feedback": "推測可能なパスワードを突破しました。", "defense_tip": "12文字以上のランダムなパスワードと多要素認証を使いましょう。"},
                {"phase": 3, "title": "ネットワーク侵入", "feedback": "社内ネットワークを探索しました。", "defense_tip": "ネットワーク分離と異常検知システムを導入しましょう。"},
                {"phase": 4, "title": "ランサムウェア展開", "feedback": "ファイルの暗号化を試みました。", "defense_tip": "オフラインバックアップと定期的な復旧テストが最後の砦です。"},
            ],
            "key_learning": "攻撃は複数のステップで進行します。どこか1箇所でも防げれば、被害を食い止められます。",
        }


ai_service = AIService()
```

**Step 6: .env.example を作成**

Create: `backend/.env.example`

```
GEMINI_API_KEY=your_gemini_api_key_here
```

**Step 7: .gitignore に .env を確認（既に追加済み）**

**Step 8: コミット**

```bash
git add backend/requirements.txt backend/services/ai_service.py backend/services/game_state.py backend/scenarios/ backend/.env.example
git commit -m "feat: add Gemini AI service and game state management"
```

---

## Task 2: バックエンドAPI — ゲームエンドポイント

**Files:**
- Modify: `backend/schemas.py`
- Modify: `backend/routers/game.py`
- Modify: `backend/main.py`

**Step 1: schemas.py にゲーム用スキーマを追加**

`backend/schemas.py` の末尾に追加:

```python
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
```

**Step 2: game.py を拡張**

`backend/routers/game.py` を以下に置き換え:

```python
from fastapi import APIRouter, HTTPException
from backend.schemas import (
    ActionRequest, CharacterReaction,
    ChatRequest, ChatResponse,
    PhishingEvaluationRequest, PhishingEvaluationResponse,
    GameStartResponse, GameStateResponse,
    CollectClueRequest, CollectClueResponse,
    PhishingEmailRequest, PhishingEmailResponse,
    PasswordAttemptRequest, PasswordAttemptResponse,
    NetworkActionRequest, NetworkActionResponse,
    RansomwareActionRequest, RansomwareActionResponse,
    FinalReportResponse,
)
from backend.services.ai_service import ai_service
from backend.services.game_state import game_state_manager
from backend.scenarios.ransomware_chain import TARGET_PROFILE, NETWORK_NODES, PHASE_CONFIG

router = APIRouter()

# --- 既存エンドポイント（互換性維持） ---

@router.post("/stage/{stage_id}/action", response_model=CharacterReaction)
async def stage_action(stage_id: int, request: ActionRequest):
    character_map = {1: "mamoru", 2: "passuwa", 3: "mailer", 4: "crypto"}
    character = character_map.get(stage_id, "shadow")
    result = await ai_service.get_character_reaction(character, request.action_type)
    return CharacterReaction(
        character=character,
        reaction_type=result["type"],
        message=result["message"],
        emoji=result["emoji"],
    )

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    result = await ai_service.chat_with_employee(request.messages)
    return ChatResponse(**result)

@router.post("/phishing/evaluate", response_model=PhishingEvaluationResponse)
async def evaluate_phishing(request: PhishingEvaluationRequest):
    result = await ai_service.evaluate_phishing(request.subject, request.body)
    return PhishingEvaluationResponse(**result)

# --- 新規: ゲームセッション ---

@router.post("/game/start", response_model=GameStartResponse)
async def start_game():
    session = game_state_manager.create_session()
    return GameStartResponse(
        session_id=session.id,
        phase=1,
        stealth=session.stealth,
        target_profile={
            "name": TARGET_PROFILE["name"],
            "department": TARGET_PROFILE["department"],
            "company": TARGET_PROFILE["company"],
            "sns_posts": [
                {"id": p["id"], "type": p["type"], "text": p["text"]}
                for p in TARGET_PROFILE["sns_posts"]
            ],
        },
    )

@router.get("/game/{session_id}/state", response_model=GameStateResponse)
async def get_game_state(session_id: str):
    session = game_state_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return GameStateResponse(**session.to_dict())

# --- Phase 1: 偵察 & フィッシング ---

@router.post("/game/phase1/collect", response_model=CollectClueResponse)
async def collect_clue(request: CollectClueRequest):
    session = game_state_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    post = next((p for p in TARGET_PROFILE["sns_posts"] if p["id"] == request.post_id), None)
    if not post:
        raise HTTPException(status_code=400, detail="Invalid post_id")

    clue = {"type": post["clue"], "value": post["clue_value"], "post_id": post["id"]}
    if clue not in session.collected_clues:
        session.collected_clues.append(clue)
    session.log_action(1, "collect_clue", f"Collected: {post['clue']}")

    descriptions = {
        "pet_name": "ペットの名前を発見: ポチ",
        "birth_year": "生年を発見: 1985年",
        "office_hint": "社内メールドメインを発見: cyberco.jp",
        "password_habit": "パスワードの傾向: 覚えやすいものを好む",
        "boss_name": "上司の名前を発見: 鈴木部長",
    }

    return CollectClueResponse(
        success=True,
        clue_type=post["clue"],
        clue_description=descriptions.get(post["clue"], "情報を入手"),
        total_clues=len(session.collected_clues),
    )

@router.post("/game/phase1/phishing", response_model=PhishingEmailResponse)
async def send_phishing(request: PhishingEmailRequest):
    session = game_state_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    result = await ai_service.evaluate_phishing_email(
        request.subject, request.body, request.sender, TARGET_PROFILE
    )

    if not result["is_success"]:
        session.reduce_stealth(PHASE_CONFIG["phase1"]["stealth_penalty_per_retry"])
    else:
        session.current_phase = 2
        session.phase_results["phase1"] = {"score": result["score"], "attempts": 1}

    session.log_action(1, "phishing", f"Score: {result['score']}")

    return PhishingEmailResponse(
        score=result["score"],
        feedback=result["feedback"],
        is_success=result["is_success"],
        victim_reaction=result["victim_reaction"],
        stealth=session.stealth,
    )

# --- Phase 2: パスワード突破 ---

@router.post("/game/phase2/attempt", response_model=PasswordAttemptResponse)
async def password_attempt(request: PasswordAttemptRequest):
    session = game_state_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    max_attempts = PHASE_CONFIG["phase2"]["max_attempts"]
    session.password_attempts += 1
    session.reduce_stealth(PHASE_CONFIG["phase2"]["stealth_penalty_per_attempt"])
    session.log_action(2, "password_attempt", request.password)

    is_correct = request.password.lower() in [p.lower() for p in TARGET_PROFILE["correct_passwords"]]
    remaining = max(0, max_attempts - session.password_attempts)
    locked_out = remaining <= 0 and not is_correct

    hint = None
    if not is_correct and not locked_out:
        clue_names = [c["type"] for c in session.collected_clues]
        attempts_list = [
            log["detail"] for log in session.action_log
            if log["action"] == "password_attempt"
        ]
        hint = await ai_service.generate_password_hint(
            attempts_list, TARGET_PROFILE["correct_passwords"], clue_names
        )

    if is_correct:
        session.current_phase = 3
        session.phase_results["phase2"] = {"attempts": session.password_attempts}
        message = "パスワード突破成功！社内システムへのアクセス権を取得しました。"
    elif locked_out:
        session.reduce_stealth(20)
        message = "アカウントがロックされました！不正アクセスとして記録されています。"
    else:
        message = f"パスワードが違います。残り{remaining}回。"

    return PasswordAttemptResponse(
        success=is_correct,
        message=message,
        attempts_remaining=remaining,
        stealth=session.stealth,
        hint=hint,
        locked_out=locked_out,
    )

# --- Phase 3: ネットワーク侵入 ---

@router.post("/game/phase3/action", response_model=NetworkActionResponse)
async def network_action(request: NetworkActionRequest):
    session = game_state_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    node = next((n for n in NETWORK_NODES if n["id"] == request.node_id), None)
    if not node:
        raise HTTPException(status_code=400, detail="Invalid node_id")

    session.log_action(3, request.action, request.node_id)
    files_found = []
    new_discoveries = []
    message = ""

    if request.action == "scan":
        session.detection_level += PHASE_CONFIG["phase3"]["detection_increase_per_action"]
        # スキャンで隠しノードを発見
        for n in NETWORK_NODES:
            if not n["visible"] and n["id"] not in session.discovered_nodes:
                if request.node_id == "pc_tanaka" and n["id"] == "admin_pc":
                    session.discovered_nodes.append(n["id"])
                    new_discoveries.append(n["id"])
                    message = f"ログを解析中… {n.get('discovery_hint', '')} 新しいノード「{n['name']}」を発見！"
                    break
                elif request.node_id == "admin_pc" and n["id"] == "backup_server":
                    session.discovered_nodes.append(n["id"])
                    new_discoveries.append(n["id"])
                    message = f"設定ファイルを解析中… {n.get('discovery_hint', '')} 新しいノード「{n['name']}」を発見！"
                    break
        if not message:
            message = f"「{node['name']}」をスキャンしました。"

    elif request.action == "access":
        if node["id"] not in session.discovered_nodes:
            raise HTTPException(status_code=400, detail="Node not discovered yet")
        session.detection_level += PHASE_CONFIG["phase3"]["detection_increase_per_action"]
        files_found = node.get("files", [])
        if node["id"] not in session.compromised_nodes:
            session.compromised_nodes.append(node["id"])
        message = f"「{node['name']}」にアクセスしました。"
        if files_found:
            message += f" {len(files_found)}個のファイルを発見。"

    elif request.action == "exploit":
        session.detection_level += PHASE_CONFIG["phase3"]["detection_increase_per_action"] * 2
        if node.get("has_admin"):
            session.has_admin = True
            session.current_phase = 4
            session.phase_results["phase3"] = {"detection_level": session.detection_level}
            message = "管理者権限を奪取しました！全システムへのアクセスが可能です。"
        else:
            message = f"「{node['name']}」には管理者権限がありません。"
            session.reduce_stealth(5)

    # 防御側リアクション
    defender_reaction = await ai_service.get_defender_reaction(
        "マモル", request.action,
        session.detection_level,
        {"node": request.node_id, "compromised": session.compromised_nodes},
    )
    session.detection_level += defender_reaction.get("detection_increase", 0)
    session.reduce_stealth(defender_reaction.get("detection_increase", 0))

    return NetworkActionResponse(
        success=True,
        message=message,
        discovered_nodes=session.discovered_nodes,
        files_found=files_found,
        defender_reaction=defender_reaction,
        detection_level=session.detection_level,
        stealth=session.stealth,
        has_admin=session.has_admin,
    )

# --- Phase 4: ランサムウェア展開 ---

@router.post("/game/phase4/action", response_model=RansomwareActionResponse)
async def ransomware_action(request: RansomwareActionRequest):
    session = game_state_manager.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.log_action(4, request.action, str(request.target_nodes or ""))
    message = ""
    defender_reaction = {"message": "", "action": "none", "detection_increase": 0, "emoji": ""}

    if request.action == "disable_backup":
        if "backup_server" in session.discovered_nodes:
            session.backup_disabled = True
            session.detection_level += 15
            session.reduce_stealth(10)
            message = "バックアップサーバーを無効化しました。復旧手段を断ちました。"
        else:
            message = "バックアップサーバーが見つかっていません。Phase 3でネットワークを探索してください。"

    elif request.action == "encrypt":
        targets = request.target_nodes or []
        speed = request.speed or "slow"
        if speed == "fast":
            session.detection_level += PHASE_CONFIG["phase4"]["fast_detection_penalty"]
            session.reduce_stealth(15)

        encrypted = []
        for node_id in targets:
            node = next((n for n in NETWORK_NODES if n["id"] == node_id), None)
            if node and node_id in session.compromised_nodes:
                encrypted.append(node_id)

        session.log_action(4, "encrypt_complete", f"Encrypted: {encrypted}")

        # 防御側リアクション
        defender_reaction = await ai_service.get_defender_reaction(
            "バックアップン", "encrypt_files",
            session.detection_level,
            {"encrypted": encrypted, "backup_disabled": session.backup_disabled},
        )
        session.detection_level += defender_reaction.get("detection_increase", 0)

        if session.backup_disabled:
            message = f"{len(encrypted)}個のノードを暗号化しました。バックアップは無効化済み — 復旧不可能です。"
        else:
            message = f"{len(encrypted)}個のノードを暗号化しましたが、バックアップから復旧される可能性があります。"

    elif request.action == "ransom_message":
        session.phase_results["phase4"] = {
            "backup_disabled": session.backup_disabled,
            "ransom_message": request.ransom_message,
            "detection_level": session.detection_level,
        }
        message = "身代金要求メッセージを送信しました。攻撃完了。"

    return RansomwareActionResponse(
        success=True,
        message=message,
        encrypted_nodes=session.compromised_nodes,
        backup_disabled=session.backup_disabled,
        defender_reaction=defender_reaction,
        stealth=session.stealth,
        detection_level=session.detection_level,
    )

# --- 最終レポート ---

@router.get("/game/{session_id}/report", response_model=FinalReportResponse)
async def get_final_report(session_id: str):
    session = game_state_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    report = await ai_service.generate_final_report(
        session.action_log, session.stealth, session.phase_results
    )
    report["stealth"] = session.stealth
    return FinalReportResponse(**report)
```

**Step 3: main.py はそのまま（game router は既にインクルード済み）**

**Step 4: コミット**

```bash
git add backend/schemas.py backend/routers/game.py
git commit -m "feat: add game session API endpoints for 4-phase attack chain"
```

---

## Task 3: フロントエンド — ゲームコンテナ & フェーズ管理

**Files:**
- Create: `frontend/src/components/game/GameContainer.jsx`
- Create: `frontend/src/components/game/PhaseManager.jsx`
- Create: `frontend/src/components/game/ui/StealthMeter.jsx`
- Create: `frontend/src/components/game/ui/PhaseTransition.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: API ベースURL定数**

Create: `frontend/src/api.js`

```javascript
const API_BASE = "http://localhost:8000";

export async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

**Step 2: StealthMeter コンポーネント**

Create: `frontend/src/components/game/ui/StealthMeter.jsx`

```jsx
export default function StealthMeter({ stealth }) {
  const color =
    stealth >= 70 ? "#22c55e" : stealth >= 40 ? "#eab308" : "#ef4444";

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 1 }}>
          🥷 STEALTH
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{stealth}%</span>
      </div>
      <div
        style={{
          height: 6,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${stealth}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.5s ease, background 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
```

**Step 3: PhaseTransition コンポーネント**

Create: `frontend/src/components/game/ui/PhaseTransition.jsx`

```jsx
import { useState, useEffect } from "react";

const PHASE_INFO = {
  1: { title: "Phase 1", subtitle: "偵察 & フィッシング", icon: "🎣", color: "#8b5cf6" },
  2: { title: "Phase 2", subtitle: "パスワード突破", icon: "🔓", color: "#ef4444" },
  3: { title: "Phase 3", subtitle: "ネットワーク侵入", icon: "🌐", color: "#3b82f6" },
  4: { title: "Phase 4", subtitle: "ランサムウェア展開", icon: "💀", color: "#dc2626" },
};

export default function PhaseTransition({ phase, onComplete }) {
  const [visible, setVisible] = useState(true);
  const info = PHASE_INFO[phase];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [phase, onComplete]);

  if (!visible || !info) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{ fontSize: 64, marginBottom: 16 }}>{info.icon}</div>
      <div
        style={{
          fontSize: 14,
          color: info.color,
          letterSpacing: 4,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {info.title}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0" }}>
        {info.subtitle}
      </div>
    </div>
  );
}
```

**Step 4: GameContainer コンポーネント**

Create: `frontend/src/components/game/GameContainer.jsx`

```jsx
import { useState, useCallback } from "react";
import { apiPost, apiGet } from "../../api";
import StealthMeter from "./ui/StealthMeter";
import PhaseTransition from "./ui/PhaseTransition";
import PhaseManager from "./PhaseManager";

export default function GameContainer({ onExit }) {
  const [session, setSession] = useState(null);
  const [phase, setPhase] = useState(0);
  const [stealth, setStealth] = useState(100);
  const [showTransition, setShowTransition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const startGame = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiPost("/game/start");
      setSession(data);
      setStealth(data.stealth);
      setPhase(1);
      setShowTransition(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const advancePhase = useCallback((newPhase, newStealth) => {
    setStealth(newStealth);
    setPhase(newPhase);
    setShowTransition(true);
  }, []);

  const updateStealth = useCallback((value) => {
    setStealth(value);
  }, []);

  const finishGame = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const data = await apiGet(`/game/${session.session_id}/report`);
      setReport(data);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // スタート画面
  if (!session) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👤</div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          OPERATION: RANSOMWARE
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 13, margin: "0 0 8px", lineHeight: 1.6 }}>
          あなたは攻撃者「シャドウ」。
          <br />
          ターゲット企業「サイバーコーポレーション」に
          <br />
          ランサムウェア攻撃を仕掛けよ。
        </p>
        <p style={{ color: "#64748b", fontSize: 11, margin: "0 0 24px", lineHeight: 1.6 }}>
          偵察 → パスワード突破 → ネットワーク侵入 → ランサムウェア展開
        </p>
        <button
          onClick={startGame}
          disabled={loading}
          style={{
            padding: "14px 48px",
            background: "linear-gradient(135deg, #7c3aed, #ec4899)",
            border: "none",
            borderRadius: 12,
            color: "white",
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? "wait" : "pointer",
            letterSpacing: 1,
          }}
        >
          {loading ? "準備中..." : "⚔️ ミッション開始"}
        </button>
        <div style={{ marginTop: 16 }}>
          <button
            onClick={onExit}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            ← ステージ選択に戻る
          </button>
        </div>
      </div>
    );
  }

  // レポート画面
  if (report) {
    const rankColors = { S: "#fbbf24", A: "#22c55e", B: "#3b82f6", C: "#94a3b8", D: "#ef4444" };
    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              color: rankColors[report.rank] || "#94a3b8",
              textShadow: `0 0 40px ${rankColors[report.rank] || "#94a3b8"}40`,
            }}
          >
            {report.rank}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", letterSpacing: 2 }}>RANK</div>
        </div>

        <StealthMeter stealth={report.stealth} />

        <div
          style={{
            padding: 16,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 16,
          }}
        >
          <p style={{ color: "#e2e8f0", fontSize: 14, margin: 0, lineHeight: 1.8 }}>
            {report.summary}
          </p>
        </div>

        {report.phase_feedback.map((pf) => (
          <div
            key={pf.phase}
            style={{
              padding: 14,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>
              Phase {pf.phase}: {pf.title}
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.6 }}>
              {pf.feedback}
            </p>
            <div
              style={{
                fontSize: 12,
                color: "#22c55e",
                padding: "6px 10px",
                background: "rgba(34,197,94,0.08)",
                borderRadius: 6,
              }}
            >
              🛡️ 防御策: {pf.defense_tip}
            </div>
          </div>
        ))}

        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "rgba(251,191,36,0.08)",
            borderRadius: 10,
            border: "1px solid rgba(251,191,36,0.2)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: 0 }}>
            💡 {report.key_learning}
          </p>
        </div>

        <button
          onClick={onExit}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "12px 0",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            color: "#94a3b8",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← ステージ選択に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      {showTransition && (
        <PhaseTransition phase={phase} onComplete={() => setShowTransition(false)} />
      )}

      <StealthMeter stealth={stealth} />

      <PhaseManager
        session={session}
        phase={phase}
        stealth={stealth}
        onAdvancePhase={advancePhase}
        onUpdateStealth={updateStealth}
        onFinish={finishGame}
      />
    </div>
  );
}
```

**Step 5: PhaseManager コンポーネント（フェーズのルーティング）**

Create: `frontend/src/components/game/PhaseManager.jsx`

```jsx
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
```

**Step 6: App.jsx にゲームモードを追加**

`frontend/src/App.jsx` — `view === "game"` の分岐を追加:

```jsx
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
      <div className="bg-grid" />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 480, margin: "0 auto", padding: "20px 16px" }}>
        <Header />
        <Navigation view={view} setView={setView} />
        {view === "home" && <StageSelect onStartGame={() => setView("game")} />}
        {view === "characters" && <Characters />}
        {view === "demo" && <DemoView />}
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
```

**Step 7: StageSelect に「ゲーム開始」ボタンを追加**

`frontend/src/components/StageSelect.jsx` — props に `onStartGame` を受け取り、ランサムウェア攻撃チェーンの起動ボタンを追加。ファイル先頭のステージカード群の上に、メインゲームへの導線を追加:

ファイルの先頭に以下のバナーを追加（既存の STAGES マップの前）:

```jsx
{/* ランサムウェア攻撃チェーン - メインゲーム */}
{onStartGame && (
  <div
    onClick={onStartGame}
    style={{
      padding: 20,
      marginBottom: 20,
      background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))",
      borderRadius: 14,
      border: "1px solid rgba(124,58,237,0.3)",
      cursor: "pointer",
      textAlign: "center",
      transition: "transform 0.2s",
    }}
  >
    <div style={{ fontSize: 32, marginBottom: 8 }}>⚔️</div>
    <div style={{ fontSize: 16, fontWeight: 800, color: "#a78bfa", marginBottom: 4 }}>
      OPERATION: RANSOMWARE
    </div>
    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
      攻撃チェーンを体験する4フェーズゲーム
    </div>
    <div
      style={{
        marginTop: 12,
        padding: "8px 24px",
        background: "linear-gradient(135deg, #7c3aed, #ec4899)",
        borderRadius: 8,
        color: "white",
        fontWeight: 700,
        fontSize: 13,
        display: "inline-block",
      }}
    >
      プレイする →
    </div>
  </div>
)}
```

**Step 8: コミット**

```bash
git add frontend/src/api.js frontend/src/components/game/ frontend/src/App.jsx frontend/src/components/StageSelect.jsx
git commit -m "feat: add game container, phase manager, and UI framework"
```

---

## Task 4: Phase 1 — 偵察 & フィッシング画面

**Files:**
- Create: `frontend/src/components/game/phases/ReconPhase.jsx`

**Step 1: ReconPhase コンポーネント**

Create: `frontend/src/components/game/phases/ReconPhase.jsx`

```jsx
import { useState } from "react";
import { apiPost } from "../../../api";

export default function ReconPhase({ session, onAdvancePhase, onUpdateStealth }) {
  const [step, setStep] = useState("sns"); // "sns" | "compose"
  const [clues, setClues] = useState([]);
  const [collectedPosts, setCollectedPosts] = useState(new Set());
  const [email, setEmail] = useState({ subject: "", body: "", sender: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const posts = session.target_profile.sns_posts || [];

  const collectClue = async (postId) => {
    if (collectedPosts.has(postId)) return;
    setLoading(true);
    try {
      const data = await apiPost("/game/phase1/collect", {
        session_id: session.session_id,
        post_id: postId,
      });
      setClues((prev) => [...prev, data]);
      setCollectedPosts((prev) => new Set([...prev, postId]));
    } finally {
      setLoading(false);
    }
  };

  const sendPhishing = async () => {
    setLoading(true);
    setResult(null);
    try {
      const data = await apiPost("/game/phase1/phishing", {
        session_id: session.session_id,
        subject: email.subject,
        body: email.body,
        sender: email.sender,
      });
      setResult(data);
      onUpdateStealth(data.stealth);
      if (data.is_success) {
        setTimeout(() => onAdvancePhase(2, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 1 — 偵察 & フィッシング
      </div>

      {step === "sns" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            ターゲット「{session.target_profile.name}」のSNS投稿を調査し、攻撃に使える情報を集めましょう。
            投稿をタップして情報を収集できます。
          </p>

          {posts.map((post) => {
            const collected = collectedPosts.has(post.id);
            return (
              <div
                key={post.id}
                onClick={() => collectClue(post.id)}
                style={{
                  padding: 14,
                  marginBottom: 10,
                  background: collected
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(255,255,255,0.04)",
                  borderRadius: 10,
                  border: `1px solid ${collected ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  cursor: collected ? "default" : "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>
                    {post.type === "photo" ? "📷" : "💬"}
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>@tanaka_taro</span>
                  {collected && (
                    <span style={{ fontSize: 10, color: "#22c55e", marginLeft: "auto" }}>
                      ✓ 収集済み
                    </span>
                  )}
                </div>
                <p style={{ color: "#e2e8f0", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {post.text}
                </p>
              </div>
            );
          })}

          {clues.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 700, marginBottom: 8 }}>
                🔍 収集した情報 ({clues.length})
              </div>
              {clues.map((c, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(251,191,36,0.08)",
                    borderRadius: 6,
                    marginBottom: 4,
                    fontSize: 12,
                    color: "#fbbf24",
                  }}
                >
                  {c.clue_description}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep("compose")}
            disabled={clues.length < 2}
            style={{
              width: "100%",
              marginTop: 16,
              padding: "12px 0",
              background:
                clues.length >= 2
                  ? "linear-gradient(135deg, #7c3aed, #6d28d9)"
                  : "rgba(255,255,255,0.06)",
              border: "none",
              borderRadius: 10,
              color: clues.length >= 2 ? "white" : "#64748b",
              fontWeight: 700,
              fontSize: 14,
              cursor: clues.length >= 2 ? "pointer" : "not-allowed",
            }}
          >
            {clues.length >= 2
              ? "📧 フィッシングメールを作成する"
              : `あと${Math.max(0, 2 - clues.length)}個情報を集めてください`}
          </button>
        </div>
      )}

      {step === "compose" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            収集した情報を使って、ターゲットが思わずクリックしてしまうフィッシングメールを作成しましょう。
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              差出人
            </label>
            <input
              value={email.sender}
              onChange={(e) => setEmail({ ...email, sender: e.target.value })}
              placeholder="例: suzuki@cyberco.jp"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              件名
            </label>
            <input
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              placeholder="例: 【緊急】経費精算の確認のお願い"
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              本文
            </label>
            <textarea
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              placeholder="フィッシングメールの本文を書いてください..."
              rows={6}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 13,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {result && (
            <div
              style={{
                padding: 14,
                marginBottom: 12,
                background: result.is_success
                  ? "rgba(34,197,94,0.08)"
                  : "rgba(239,68,68,0.08)",
                borderRadius: 10,
                border: `1px solid ${result.is_success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: result.is_success ? "#22c55e" : "#ef4444", marginBottom: 6 }}>
                {result.is_success ? "✅ フィッシング成功！" : `❌ スコア: ${result.score}/100`}
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 8px", lineHeight: 1.6 }}>
                {result.feedback}
              </p>
              <p style={{ fontSize: 12, color: "#e2e8f0", margin: 0 }}>
                💬 {session.target_profile.name}: 「{result.victim_reaction}」
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setStep("sns")}
              style={{
                flex: 1,
                padding: "12px 0",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              ← 調査に戻る
            </button>
            <button
              onClick={sendPhishing}
              disabled={loading || !email.subject || !email.body}
              style={{
                flex: 2,
                padding: "12px 0",
                background:
                  email.subject && email.body
                    ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
                    : "rgba(255,255,255,0.06)",
                border: "none",
                borderRadius: 10,
                color: email.subject && email.body ? "white" : "#64748b",
                fontWeight: 700,
                fontSize: 14,
                cursor: email.subject && email.body ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "送信中..." : "📨 メール送信"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: コミット**

```bash
git add frontend/src/components/game/phases/ReconPhase.jsx
git commit -m "feat: add Phase 1 recon and phishing UI"
```

---

## Task 5: Phase 2 — パスワード突破画面

**Files:**
- Create: `frontend/src/components/game/phases/PasswordPhase.jsx`

**Step 1: PasswordPhase コンポーネント**

Create: `frontend/src/components/game/phases/PasswordPhase.jsx`

```jsx
import { useState } from "react";
import { apiPost } from "../../../api";

export default function PasswordPhase({ session, onAdvancePhase, onUpdateStealth }) {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);

  const attemptPassword = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setResult(null);
    setCracking(true);
    setCrackProgress(0);

    // クラッキングアニメーション
    const interval = setInterval(() => {
      setCrackProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 30);

    await new Promise((r) => setTimeout(r, 700));
    clearInterval(interval);
    setCrackProgress(100);
    setCracking(false);

    try {
      const data = await apiPost("/game/phase2/attempt", {
        session_id: session.session_id,
        password: password.trim(),
      });
      setAttempts((prev) => [...prev, { pw: password, success: data.success }]);
      setResult(data);
      setHint(data.hint);
      onUpdateStealth(data.stealth);
      setPassword("");

      if (data.success) {
        setTimeout(() => onAdvancePhase(3, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#ef4444", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 2 — パスワード突破
      </div>

      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
        Phase 1で収集した情報をもとに、田中さんのパスワードを推理してください。
        試行回数が多いとアカウントがロックされます。
      </p>

      {/* ターミナル風UI */}
      <div
        style={{
          background: "#0c0c0c",
          borderRadius: 10,
          border: "1px solid #333",
          padding: 16,
          fontFamily: "'Courier New', monospace",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 11, color: "#22c55e", marginBottom: 12 }}>
          $ ssh tanaka@mail.cyberco.jp
          <br />
          Password authentication required.
        </div>

        {attempts.map((a, i) => (
          <div key={i} style={{ fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: "#64748b" }}>attempt[{i + 1}]:</span>{" "}
            <span style={{ color: "#e2e8f0" }}>{"*".repeat(a.pw.length)}</span>{" "}
            <span style={{ color: a.success ? "#22c55e" : "#ef4444" }}>
              {a.success ? "✓ ACCESS GRANTED" : "✗ DENIED"}
            </span>
          </div>
        ))}

        {cracking && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#eab308" }}>
              Attempting... {crackProgress}%
            </div>
            <div
              style={{
                height: 3,
                background: "#333",
                borderRadius: 2,
                marginTop: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${crackProgress}%`,
                  background: "#eab308",
                  transition: "width 0.05s",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span style={{ color: "#22c55e", fontSize: 12 }}>Password:</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attemptPassword()}
            placeholder="パスワードを入力..."
            disabled={loading || result?.locked_out}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#e2e8f0",
              fontSize: 13,
              fontFamily: "'Courier New', monospace",
              outline: "none",
            }}
          />
        </div>
      </div>

      {hint && (
        <div
          style={{
            padding: 12,
            background: "rgba(251,191,36,0.08)",
            borderRadius: 8,
            border: "1px solid rgba(251,191,36,0.2)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>
            💡 ヒント
          </div>
          <p style={{ fontSize: 12, color: "#fbbf24", margin: 0, lineHeight: 1.6 }}>
            {hint.hint}
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            background: result.success
              ? "rgba(34,197,94,0.08)"
              : result.locked_out
                ? "rgba(239,68,68,0.15)"
                : "rgba(239,68,68,0.08)",
            borderRadius: 8,
            border: `1px solid ${result.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          <p style={{
            fontSize: 13,
            fontWeight: 700,
            color: result.success ? "#22c55e" : "#ef4444",
            margin: "0 0 4px",
          }}>
            {result.message}
          </p>
          {!result.success && !result.locked_out && (
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              残り試行回数: {result.attempts_remaining}
            </p>
          )}
        </div>
      )}

      <button
        onClick={attemptPassword}
        disabled={loading || !password.trim() || result?.locked_out}
        style={{
          width: "100%",
          padding: "12px 0",
          background:
            password.trim() && !result?.locked_out
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "rgba(255,255,255,0.06)",
          border: "none",
          borderRadius: 10,
          color: password.trim() ? "white" : "#64748b",
          fontWeight: 700,
          fontSize: 14,
          cursor: password.trim() ? "pointer" : "not-allowed",
        }}
      >
        {loading ? "試行中..." : result?.locked_out ? "🔒 ロックアウト" : "🔓 パスワードを試す"}
      </button>
    </div>
  );
}
```

**Step 2: コミット**

```bash
git add frontend/src/components/game/phases/PasswordPhase.jsx
git commit -m "feat: add Phase 2 password cracking UI"
```

---

## Task 6: Phase 3 — ネットワーク侵入画面

**Files:**
- Create: `frontend/src/components/game/phases/NetworkPhase.jsx`

**Step 1: NetworkPhase コンポーネント**

Create: `frontend/src/components/game/phases/NetworkPhase.jsx`

```jsx
import { useState } from "react";
import { apiPost } from "../../../api";

const NODE_ICONS = {
  pc: "💻",
  server: "🖥️",
  backup: "💾",
  firewall: "🛡️",
};

const NODE_COLORS = {
  pc: "#3b82f6",
  server: "#8b5cf6",
  backup: "#22c55e",
  firewall: "#ef4444",
};

const INITIAL_NODES = {
  pc_tanaka: { name: "田中のPC", type: "pc" },
  file_server: { name: "ファイルサーバー", type: "server" },
  mail_server: { name: "メールサーバー", type: "server" },
  firewall: { name: "ファイアウォール", type: "firewall" },
  admin_pc: { name: "管理者端末", type: "pc" },
  backup_server: { name: "バックアップサーバー", type: "backup" },
};

export default function NetworkPhase({ session, onAdvancePhase, onUpdateStealth, stealth }) {
  const [discovered, setDiscovered] = useState(
    new Set(["pc_tanaka", "file_server", "mail_server", "firewall"])
  );
  const [compromised, setCompromised] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [files, setFiles] = useState([]);
  const [defenderMsg, setDefenderMsg] = useState(null);
  const [detectionLevel, setDetectionLevel] = useState(0);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  const doAction = async (action, nodeId) => {
    setLoading(true);
    try {
      const data = await apiPost("/game/phase3/action", {
        session_id: session.session_id,
        action,
        node_id: nodeId,
      });

      setDiscovered(new Set(data.discovered_nodes));
      setCompromised((prev) => {
        const next = new Set(prev);
        if (action === "access") next.add(nodeId);
        return next;
      });
      if (data.files_found.length > 0) setFiles(data.files_found);
      setDetectionLevel(data.detection_level);
      setDefenderMsg(data.defender_reaction);
      setHasAdmin(data.has_admin);
      onUpdateStealth(data.stealth);

      setLog((prev) => [
        ...prev,
        { action, node: nodeId, message: data.message },
      ]);

      if (data.has_admin) {
        setTimeout(() => onAdvancePhase(4, data.stealth), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const discoveredArray = Array.from(discovered);

  return (
    <div>
      <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 3 — ネットワーク侵入
      </div>

      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12, lineHeight: 1.6 }}>
        ネットワーク内のノードを探索し、管理者権限を奪取してください。
        行動するたびに検知レベルが上がります。
      </p>

      {/* 検知レベル */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
          <span>🔍 検知レベル</span>
          <span style={{ color: detectionLevel >= 80 ? "#ef4444" : detectionLevel >= 50 ? "#eab308" : "#22c55e" }}>
            {detectionLevel}/100
          </span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(detectionLevel, 100)}%`,
              background: detectionLevel >= 80 ? "#ef4444" : detectionLevel >= 50 ? "#eab308" : "#22c55e",
              transition: "width 0.5s",
            }}
          />
        </div>
      </div>

      {/* ネットワークマップ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {discoveredArray.map((nodeId) => {
          const info = INITIAL_NODES[nodeId];
          if (!info) return null;
          const isSelected = selectedNode === nodeId;
          const isCompromised = compromised.has(nodeId);

          return (
            <div
              key={nodeId}
              onClick={() => setSelectedNode(nodeId)}
              style={{
                padding: 12,
                background: isSelected
                  ? `rgba(${nodeId === "firewall" ? "239,68,68" : "59,130,246"},0.12)`
                  : "rgba(255,255,255,0.04)",
                borderRadius: 10,
                border: `1px solid ${
                  isSelected
                    ? NODE_COLORS[info.type]
                    : "rgba(255,255,255,0.08)"
                }`,
                cursor: "pointer",
                transition: "all 0.2s",
                textAlign: "center",
                position: "relative",
              }}
            >
              {isCompromised && (
                <div style={{ position: "absolute", top: 6, right: 8, fontSize: 10, color: "#22c55e" }}>
                  ✓
                </div>
              )}
              <div style={{ fontSize: 24, marginBottom: 4 }}>
                {NODE_ICONS[info.type]}
              </div>
              <div style={{ fontSize: 11, color: "#e2e8f0", fontWeight: 600 }}>
                {info.name}
              </div>
              <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
                {isCompromised ? "侵入済" : "未侵入"}
              </div>
            </div>
          );
        })}
      </div>

      {/* アクションボタン */}
      {selectedNode && selectedNode !== "firewall" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => doAction("scan", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: 8,
              color: "#60a5fa",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔍 スキャン
          </button>
          <button
            onClick={() => doAction("access", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 8,
              color: "#a78bfa",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🔑 アクセス
          </button>
          <button
            onClick={() => doAction("exploit", selectedNode)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            💥 権限奪取
          </button>
        </div>
      )}

      {/* 発見ファイル */}
      {files.length > 0 && (
        <div style={{ marginBottom: 12, padding: 10, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700, marginBottom: 6 }}>
            📂 発見したファイル
          </div>
          {files.map((f, i) => (
            <div key={i} style={{ fontSize: 11, color: "#94a3b8", padding: "2px 0" }}>
              📄 {f}
            </div>
          ))}
        </div>
      )}

      {/* 防御側リアクション */}
      {defenderMsg && (
        <div
          style={{
            padding: 12,
            background: "rgba(239,68,68,0.06)",
            borderRadius: 8,
            border: "1px solid rgba(239,68,68,0.15)",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 4 }}>
            {defenderMsg.emoji} マモル（ファイアウォール）
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>
            「{defenderMsg.message}」
          </p>
          {defenderMsg.action !== "none" && (
            <div style={{ fontSize: 10, color: "#ef4444", marginTop: 6 }}>
              ⚡ アクション: {defenderMsg.action}
            </div>
          )}
        </div>
      )}

      {/* ログ */}
      {log.length > 0 && (
        <div style={{ maxHeight: 120, overflowY: "auto", fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
          {log.map((l, i) => (
            <div key={i} style={{ padding: "2px 0" }}>
              [{l.action}] {l.message}
            </div>
          ))}
        </div>
      )}

      {hasAdmin && (
        <div
          style={{
            marginTop: 12,
            padding: 14,
            background: "rgba(34,197,94,0.1)",
            borderRadius: 10,
            border: "1px solid rgba(34,197,94,0.3)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#22c55e", fontSize: 14, fontWeight: 700, margin: 0 }}>
            🔓 管理者権限を奪取しました！
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: コミット**

```bash
git add frontend/src/components/game/phases/NetworkPhase.jsx
git commit -m "feat: add Phase 3 network intrusion UI"
```

---

## Task 7: Phase 4 — ランサムウェア展開画面

**Files:**
- Create: `frontend/src/components/game/phases/RansomwarePhase.jsx`

**Step 1: RansomwarePhase コンポーネント**

Create: `frontend/src/components/game/phases/RansomwarePhase.jsx`

```jsx
import { useState, useRef, useEffect } from "react";
import { apiPost } from "../../../api";

function EncryptionGrid({ encryptedNodes, totalNodes }) {
  const ratio = totalNodes > 0 ? encryptedNodes / totalNodes : 0;
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const isEncrypted = i < Math.floor(ratio * 64);
    cells.push(
      <div
        key={i}
        style={{
          width: 14,
          height: 14,
          borderRadius: 2,
          backgroundColor: isEncrypted ? "#dc2626" : "#22c55e",
          transition: `background-color 0.15s ${i * 20}ms`,
          opacity: 0.6 + Math.random() * 0.4,
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 14px)",
        gap: 3,
        justifyContent: "center",
      }}
    >
      {cells}
    </div>
  );
}

export default function RansomwarePhase({ session, onUpdateStealth, onFinish }) {
  const [step, setStep] = useState("plan"); // "plan" | "encrypting" | "ransom" | "done"
  const [backupDisabled, setBackupDisabled] = useState(false);
  const [encryptedNodes, setEncryptedNodes] = useState([]);
  const [speed, setSpeed] = useState("slow");
  const [defenderMsg, setDefenderMsg] = useState(null);
  const [ransomMsg, setRansomMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);
  const intervalRef = useRef(null);

  const discoveredNodes = session.target_profile
    ? ["pc_tanaka", "file_server", "mail_server"]
    : [];

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const disableBackup = async () => {
    setLoading(true);
    try {
      const data = await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "disable_backup",
      });
      setBackupDisabled(data.backup_disabled);
      onUpdateStealth(data.stealth);
      if (data.defender_reaction?.message) {
        setDefenderMsg(data.defender_reaction);
      }
    } finally {
      setLoading(false);
    }
  };

  const encrypt = async () => {
    setStep("encrypting");
    setAnimProgress(0);

    // アニメーション
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += speed === "fast" ? 0.04 : 0.02;
      setAnimProgress(Math.min(p, 1));
      if (p >= 1) {
        clearInterval(intervalRef.current);
      }
    }, 60);

    setLoading(true);
    try {
      const targets = ["pc_tanaka", "file_server", "mail_server"];
      const data = await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "encrypt",
        target_nodes: targets,
        speed,
      });
      setEncryptedNodes(data.encrypted_nodes);
      onUpdateStealth(data.stealth);
      if (data.defender_reaction?.message) {
        setDefenderMsg(data.defender_reaction);
      }

      // アニメーション完了を待つ
      await new Promise((resolve) => {
        const check = setInterval(() => {
          setAnimProgress((current) => {
            if (current >= 1) {
              clearInterval(check);
              resolve();
              return current;
            }
            return current;
          });
        }, 100);
      });

      setStep("ransom");
    } finally {
      setLoading(false);
    }
  };

  const sendRansom = async () => {
    setLoading(true);
    try {
      await apiPost("/game/phase4/action", {
        session_id: session.session_id,
        action: "ransom_message",
        ransom_message: ransomMsg || "YOUR FILES HAVE BEEN ENCRYPTED. PAY 5 BTC.",
      });
      setStep("done");
      setTimeout(() => onFinish(), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 700, marginBottom: 12, letterSpacing: 1 }}>
        PHASE 4 — ランサムウェア展開
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <EncryptionGrid
          encryptedNodes={step === "encrypting" ? Math.floor(animProgress * 3) : encryptedNodes.length}
          totalNodes={3}
        />
      </div>

      {step === "plan" && (
        <div>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16, lineHeight: 1.6 }}>
            管理者権限を取得しました。ランサムウェアの展開準備をしましょう。
            バックアップを先に無効化すると、復旧を防げます。
          </p>

          {/* バックアップ無効化 */}
          <div
            style={{
              padding: 14,
              marginBottom: 12,
              background: backupDisabled
                ? "rgba(34,197,94,0.08)"
                : "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: `1px solid ${backupDisabled ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
                  💾 バックアップサーバー
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  {backupDisabled ? "無効化済み — 復旧不可能" : "稼働中 — 復旧される可能性あり"}
                </div>
              </div>
              {!backupDisabled && (
                <button
                  onClick={disableBackup}
                  disabled={loading}
                  style={{
                    padding: "6px 16px",
                    background: "rgba(239,68,68,0.2)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: 6,
                    color: "#f87171",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  無効化
                </button>
              )}
            </div>
          </div>

          {/* 暗号化速度選択 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>暗号化速度:</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["slow", "fast"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: speed === s ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${speed === s ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8,
                    color: speed === s ? "#f87171" : "#64748b",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {s === "slow" ? "🐢 低速（ステルス）" : "⚡ 高速（検知リスク高）"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={encrypt}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #dc2626, #991b1b)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            💀 ランサムウェアを展開する
          </button>
        </div>
      )}

      {step === "encrypting" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#ef4444", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            暗号化中... {Math.round(animProgress * 100)}%
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            {speed === "fast" ? "⚡ 高速暗号化 — 検知リスクが上昇中" : "🐢 低速暗号化 — ステルス維持中"}
          </div>
        </div>
      )}

      {step === "ransom" && (
        <div>
          <div
            style={{
              padding: 16,
              background: "rgba(220,38,38,0.12)",
              borderRadius: 10,
              border: "1px solid rgba(220,38,38,0.3)",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <p style={{ color: "#fca5a5", fontSize: 16, fontWeight: 800, margin: "0 0 6px" }}>
              ⚠️ 暗号化完了
            </p>
            <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
              {backupDisabled
                ? "バックアップ無効化済み — 完全な攻撃成功"
                : "⚠️ バックアップが残っています — 復旧される可能性あり"}
            </p>
          </div>

          {defenderMsg && (
            <div
              style={{
                padding: 12,
                background: "rgba(34,197,94,0.06)",
                borderRadius: 8,
                border: "1px solid rgba(34,197,94,0.15)",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#86efac" }}>
                {defenderMsg.emoji} バックアップン
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                「{defenderMsg.message}」
              </p>
            </div>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>
              💀 身代金要求メッセージ
            </label>
            <textarea
              value={ransomMsg}
              onChange={(e) => setRansomMsg(e.target.value)}
              placeholder="YOUR FILES HAVE BEEN ENCRYPTED. PAY 5 BTC TO DECRYPT."
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(220,38,38,0.06)",
                border: "1px solid rgba(220,38,38,0.2)",
                borderRadius: 8,
                color: "#fca5a5",
                fontSize: 13,
                fontFamily: "'Courier New', monospace",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            onClick={sendRansom}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            {loading ? "送信中..." : "📨 身代金要求を送信して攻撃完了"}
          </button>
        </div>
      )}

      {step === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏁</div>
          <p style={{ color: "#e2e8f0", fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
            MISSION COMPLETE
          </p>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>
            レポートを生成中...
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: コミット**

```bash
git add frontend/src/components/game/phases/RansomwarePhase.jsx
git commit -m "feat: add Phase 4 ransomware deployment UI"
```

---

## Task 8: StageSelect の修正 & 統合テスト

**Files:**
- Modify: `frontend/src/components/StageSelect.jsx`

**Step 1: StageSelect.jsx を修正して onStartGame props を受け取る**

既存の `StageSelect.jsx` を読み、`onStartGame` props をコンポーネント定義に追加し、ステージカード群の前にゲーム開始バナーを挿入する。

**Step 2: バックエンドの起動テスト**

```bash
cd /Users/ikeda_atsushi/workspace/github.com/Ai0202/cyber-security-game
source .venv/bin/activate
# .envにGEMINI_API_KEYを設定してから:
uvicorn backend.main:app --reload --port 8000
```

起動後、`http://localhost:8000/docs` でSwagger UIが開くことを確認。

**Step 3: フロントエンドの起動テスト**

```bash
cd /Users/ikeda_atsushi/workspace/github.com/Ai0202/cyber-security-game/frontend
npm run dev
```

`http://localhost:5173` を開き、ステージ選択画面に「OPERATION: RANSOMWARE」バナーが表示されることを確認。

**Step 4: ゲームフロー統合テスト**

1. 「プレイする」をクリック → ゲーム開始画面が表示
2. 「ミッション開始」→ Phase 1 遷移アニメーション → SNS調査画面
3. 情報収集 → メール作成 → 送信 → Phase 2へ
4. パスワード入力 → Phase 3へ
5. ネットワーク探索 → 管理者権限奪取 → Phase 4へ
6. ランサムウェア展開 → 攻撃完了 → レポート表示

**Step 5: コミット**

```bash
git add -A
git commit -m "feat: integrate game mode with stage select and polish"
```

---

## Task 9: .env の設定 & 最終確認

**Step 1: .env ファイルを作成（ユーザーが手動）**

```bash
# backend/.env
GEMINI_API_KEY=実際のキーをここに
```

**Step 2: ai_service.py のモック/API切替確認**

- `GEMINI_API_KEY` が設定されている場合 → Gemini API を使用
- 未設定の場合 → モックレスポンスにフォールバック

**Step 3: 最終コミット & プッシュ**

```bash
git push origin main
```
