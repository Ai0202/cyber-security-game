# 006: Stage 4 — ランサムウェア侵攻

## 概要

攻撃者として、企業のネットワークに侵入しランサムウェアを展開、身代金を要求する攻撃チェーン全体を体験する。4フェーズのストーリー分岐型ゲーム。

## 要件ソース

- docs/features.md#Stage 4: ランサムウェア侵攻
- docs/index.md#各ステージ共通レイアウト
- docs/openapi.yaml#/gemini/generate-scenario, /gemini/evaluate, /gemini/chat

## 既存実装の活用

| 流用元ブランチ | 内容 | 備考 |
|---------------|------|------|
| `feature/ransomware-chain-game` | 全フェーズコンポーネント (ReconPhase, PasswordPhase, NetworkPhase, RansomwarePhase) | JSX→TSX変換 + Tailwindスタイリング。ロジック・UXはほぼ流用可能 |
| `feature/ransomware-chain-game` | GameContainer.jsx, PhaseManager.jsx | ゲームライフサイクル管理。TSX化 |
| `feature/ransomware-chain-game` | StealthMeter.jsx, PhaseTransition.jsx | UI部品。TSX化 |
| `feature/ransomware-chain-game` | `backend/services/ai_service.py` | Gemini連携ロジック + モックフォールバック。TypeScriptに移植 |
| `feature/ransomware-chain-game` | `backend/scenarios/ransomware_chain.py` | シナリオデータ。TypeScriptに移植 |

## タスク

### ゲームコンポーネント (`src/components/stages/ransomware/`)

- [ ] `RansomwareGame.tsx`: ゲーム全体の制御
  - 4フェーズの進行管理（初期侵入 → 内部偵察 → 権限昇格・暗号化 → 身代金要求）
  - フェーズ間のコンテキスト引き継ぎ（Gemini会話履歴として維持）
  - ステルスメーター管理（検知レベル）
  - `feature/ransomware-chain-game` の GameContainer + PhaseManager を統合・TSX化

- [ ] `PhaseNavigator.tsx`: フェーズ進行表示
  - 4フェーズのステップインジケーター
  - 現在のフェーズをハイライト
  - フェーズ遷移時のアニメーション（PhaseTransition から移植）

- [ ] `Phase1Intrusion.tsx`: フェーズ1 — 初期侵入
  - 認証情報入力UI（Stage 3の成果として入手済みの設定）
  - ログイン試行アニメーション
  - システム構成表示（Gemini APIが動的生成）
  - `feature/ransomware-chain-game` の ReconPhase から移植・改修

- [ ] `Phase2Recon.tsx`: フェーズ2 — 内部偵察
  - 選択肢表示:「共有フォルダを探索」「メールサーバーにアクセス」「管理者権限を探す」等
  - 選択結果の表示（発見した情報、次のアクション提示）
  - ネットワークマップのビジュアル表示
  - `feature/ransomware-chain-game` の NetworkPhase から移植・改修

- [ ] `Phase3Encrypt.tsx`: フェーズ3 — 権限昇格 → 暗号化実行
  - 権限昇格の選択肢（パスワードファイル発見、脆弱性利用等）
  - 暗号化対象の選択UI
  - `EncryptionAnimation.tsx`: ファイルアイコンが次々とロックアイコンに変わるアニメーション（Framer Motion staggerChildren）
  - `feature/ransomware-chain-game` の RansomwarePhase から移植・改修

- [ ] `Phase4Ransom.tsx`: フェーズ4 — 身代金要求
  - 脅迫文テンプレートのカスタマイズUI
  - 要求額・支払期限・連絡手段の設定
  - 被害企業の反応表示（Gemini APIシミュレーション）

- [ ] `StealthMeter.tsx`: ステルスメーター（検知レベル表示）
  - `feature/ransomware-chain-game` の StealthMeter.jsx からTSX化

### Gemini APIプロンプト (`src/lib/prompts/ransomware.ts`)

- [ ] シナリオ生成プロンプト: 企業のシステム構成・データ内容を動的生成
- [ ] 各フェーズの選択肢と結果をストーリー分岐形式で生成するプロンプト
- [ ] 攻撃の各段階での「検知される可能性があったポイント」を記録するプロンプト
- [ ] クリア後の攻撃チェーン全体の振り返り + 各段階の防御策解説プロンプト
- [ ] `feature/ransomware-chain-game` の ai_service.py からプロンプトパターンを移植

### モックデータ

- [ ] `feature/ransomware-chain-game` の `scenarios/ransomware_chain.py` からシナリオデータを移植
- [ ] 各フェーズのモック応答データ（ai_service.py のモックフォールバックから移植）

### ステージページ (`src/app/stage/ransomware/page.tsx`)

- [ ] 共通レイアウト適用
- [ ] RansomwareGame コンポーネントの配置
- [ ] ターミナル風UIのベースデザイン

## 受け入れ条件

- 4フェーズが順序通りに進行すること
- 各フェーズで選択肢が表示され、選択に応じてストーリーが分岐すること
- ステルスメーターが行動に応じて変動すること
- 暗号化アニメーション（ファイル→ロックアイコン）が表示されること
- フェーズ間のコンテキスト（発見情報・行動履歴）が引き継がれること
- Gemini会話履歴が維持され、一貫したストーリーが展開すること
- 各フェーズのスコアリングが正しいこと（初期侵入: 20pt, 偵察: 0-30pt, 権限昇格: 0-25pt, 暗号化: 0-15pt, 脅迫文: 0-10pt）
- モックモードで動作すること

## 備考

- このステージは `feature/ransomware-chain-game` の既存実装を最大限活用する。JSX→TSX変換 + Tailwindスタイリングが主な作業
- フェーズ構成が既存実装と docs/features.md で若干異なる（既存: Recon→Password→Network→Ransomware、docs: 初期侵入→内部偵察→権限昇格・暗号化→身代金要求）。docs側に合わせて調整する
