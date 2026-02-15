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
    message = ""

    if request.action == "scan":
        session.detection_level += PHASE_CONFIG["phase3"]["detection_increase_per_action"]
        for n in NETWORK_NODES:
            if not n["visible"] and n["id"] not in session.discovered_nodes:
                if request.node_id == "pc_tanaka" and n["id"] == "admin_pc":
                    session.discovered_nodes.append(n["id"])
                    message = f"ログを解析中… {n.get('discovery_hint', '')} 新しいノード「{n['name']}」を発見！"
                    break
                elif request.node_id == "admin_pc" and n["id"] == "backup_server":
                    session.discovered_nodes.append(n["id"])
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
