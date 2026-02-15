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

    async def get_character_reaction(self, character: str, action: str) -> dict:
        """既存互換: キャラクターリアクション"""
        reactions = {
            "mamoru": {
                "message": "不審な通信を検知しました。アクセスログを確認します。",
                "emoji": "🛡️",
                "type": "alert",
            },
            "passuwa": {
                "message": "うぐぐ…そのパスワードは…強力すぎる…！",
                "emoji": "🔑",
                "type": "panicked",
            },
            "mailer": {
                "message": "わあ！素敵なメールが届いたよ！開いちゃおうかな？",
                "emoji": "📧",
                "type": "excited",
            },
        }
        return reactions.get(character, {"message": "...", "emoji": "😐", "type": "normal"})

    async def chat_with_employee(self, messages: list) -> dict:
        """既存互換: ソーシャルエンジニアリングチャット"""
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
            "is_game_over": alert_level >= 100,
        }

    async def evaluate_phishing(self, subject: str, body: str) -> dict:
        """既存互換: フィッシング評価"""
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
            "is_success": score > 60,
        }

    # --- 新規: ゲーム用メソッド ---

    async def evaluate_phishing_email(
        self, email_subject: str, email_body: str, email_sender: str, target_info: dict
    ) -> dict:
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
            result = json.loads(
                response.text.strip().removeprefix("```json").removesuffix("```").strip()
            )
            return result
        except Exception:
            return self._mock_phishing_eval(email_subject, email_body)

    async def generate_password_hint(
        self, attempts: list[str], correct_passwords: list[str], clues: list[str]
    ) -> dict:
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
            return json.loads(
                response.text.strip().removeprefix("```json").removesuffix("```").strip()
            )
        except Exception:
            return self._mock_password_hint(attempts)

    async def get_defender_reaction(
        self, defender: str, player_action: str, detection_level: int, context: dict
    ) -> dict:
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
            return json.loads(
                response.text.strip().removeprefix("```json").removesuffix("```").strip()
            )
        except Exception:
            return self._mock_defender_reaction(defender, detection_level)

    async def generate_final_report(
        self, action_log: list, stealth: int, phase_results: dict
    ) -> dict:
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
            return json.loads(
                response.text.strip().removeprefix("```json").removesuffix("```").strip()
            )
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
            "feedback": " ".join(feedback_parts)
            if feedback_parts
            else "もう少しターゲットの情報を活用して、説得力のあるメールを作りましょう。",
            "is_success": score >= 60,
            "victim_reaction": "うーん、ちょっと怪しいかも…"
            if score < 60
            else "大変だ！すぐ対応しなきゃ！",
        }

    def _mock_password_hint(self, attempts: list[str]) -> dict:
        if not attempts:
            return {
                "hint": "SNSの投稿をよく見て、個人情報を組み合わせてみましょう。",
                "closeness": 0,
            }
        last = attempts[-1].lower()
        if "pochi" in last:
            return {
                "hint": "ペットの名前はいい線いってます！他の情報と組み合わせてみては？",
                "closeness": 60,
            }
        if "1985" in last:
            return {
                "hint": "生年の情報を見つけましたね。他にも使えそうな情報がありませんか？",
                "closeness": 50,
            }
        return {
            "hint": "SNSの投稿から、ペットの名前や生年月日を探してみましょう。",
            "closeness": 10,
        }

    def _mock_defender_reaction(self, defender: str, detection_level: int) -> dict:
        if detection_level < 30:
            return {
                "message": "特に異常なし。通常通り監視中。",
                "action": "none",
                "detection_increase": 5,
                "emoji": "🛡️",
            }
        if detection_level < 60:
            return {
                "message": "ん？少し怪しい通信がありますね…ログを確認します。",
                "action": "alert",
                "detection_increase": 8,
                "emoji": "🤔",
            }
        if detection_level < 80:
            return {
                "message": "不審なアクセスを検知！一部ポートを閉鎖します！",
                "action": "block_port",
                "detection_increase": 10,
                "emoji": "😠",
            }
        return {
            "message": "侵入者だ！全システムをロックダウン！",
            "action": "lockdown",
            "detection_increase": 15,
            "emoji": "🚨",
        }

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
            "summary": f"ステルス度{stealth}で攻撃を完了しました。"
            + (
                "非常に巧妙な攻撃でした。"
                if stealth >= 60
                else "検知されやすい攻撃でした。セキュリティ対策の重要性を感じてください。"
            ),
            "phase_feedback": [
                {
                    "phase": 1,
                    "title": "偵察&フィッシング",
                    "feedback": "SNS情報を活用したフィッシングを実行しました。",
                    "defense_tip": "SNSでの個人情報公開を最小限にし、不審メールの見分け方を学びましょう。",
                },
                {
                    "phase": 2,
                    "title": "パスワード突破",
                    "feedback": "推測可能なパスワードを突破しました。",
                    "defense_tip": "12文字以上のランダムなパスワードと多要素認証を使いましょう。",
                },
                {
                    "phase": 3,
                    "title": "ネットワーク侵入",
                    "feedback": "社内ネットワークを探索しました。",
                    "defense_tip": "ネットワーク分離と異常検知システムを導入しましょう。",
                },
                {
                    "phase": 4,
                    "title": "ランサムウェア展開",
                    "feedback": "ファイルの暗号化を試みました。",
                    "defense_tip": "オフラインバックアップと定期的な復旧テストが最後の砦です。",
                },
            ],
            "key_learning": "攻撃は複数のステップで進行します。どこか1箇所でも防げれば、被害を食い止められます。",
        }


ai_service = AIService()
