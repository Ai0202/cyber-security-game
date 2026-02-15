# 001: 共通基盤

## 概要

MVP全体の土台となる共通基盤を構築する。プロジェクト構成の整理、共通UIコンポーネント、Gemini API連携基盤、ゲーム状態管理、デザインシステムの実装を行う。

## 要件ソース

- docs/architecture.md: ディレクトリ構成、技術的判断
- docs/index.md: デザインシステム（カラーパレット、フォント、アニメーション方針）
- docs/er-diagram.md: 型定義（クライアントサイド状態構造）
- docs/openapi.yaml: API仕様（4エンドポイント）

## 既存実装の活用

| 流用元ブランチ | 内容 | 備考 |
|---------------|------|------|
| `feature/nextjs-rewrite` | TypeScript型定義 (`src/lib/types.ts`) | ほぼそのまま利用可能。docs/er-diagram.md の型と統合 |
| `feature/nextjs-rewrite` | 静的データ (`src/data/`, `src/lib/scenarios.ts`) | そのまま利用可能 |
| `feature/nextjs-rewrite` | レイアウト (`src/app/layout.tsx`) | デザインシステムに合わせて調整 |
| `feature/ransomware-chain-game` | AI Service (`backend/services/ai_service.py`) | Next.js API Routes + TypeScriptに移植。モックフォールバックも移植 |

## タスク

### プロジェクト構成

- [ ] `feature/nextjs-rewrite` ブランチをベースに新ブランチを作成
- [ ] docs/architecture.md のディレクトリ構成に合わせてファイル・フォルダを整理
- [ ] 不要なファイルの削除、必要なディレクトリの作成

### デザインシステム

- [ ] `src/styles/globals.css` にサイバーパンクテーマのCSS変数を定義（docs/index.md のカラーパレット準拠）
- [ ] Noto Sans JP + JetBrains Mono フォントの設定（`next/font` 使用）
- [ ] Tailwind CSS のカスタムテーマ設定（`tailwind.config.ts` にカラー・フォント追加）

### 共通UIコンポーネント (`src/components/ui/`)

- [ ] `CyberButton.tsx`: サイバーパンク風ボタン（グラデーション、ホバーグロー、タップアニメーション）
- [ ] `GlowCard.tsx`: グロー効果付きカード（ホバーでスケール1.02 + グロー強化）
- [ ] `TerminalText.tsx`: ターミナル風テキスト表示（1文字ずつタイプライター表示、Framer Motion）
- [ ] `NeonBadge.tsx`: ネオンバッジ（ランク表示等に使用）

### 型定義の統合 (`src/types/index.ts`)

- [ ] `feature/nextjs-rewrite` の型定義をベースに、docs/er-diagram.md の `GameState`, `StageResult`, `ScoreBreakdown` 型を統合
- [ ] `StageId`, `Rank`, `Difficulty` の型定義
- [ ] 各ステージ固有の型定義（シナリオ、アクション）

### ゲーム状態管理 (`src/contexts/GameContext.tsx`)

- [ ] `GameContext` の作成（React Context API）
- [ ] `GameState` の管理: `currentStage`, `scores`, `isOperationMode`
- [ ] ステージ開始、スコア記録、リセットのアクション
- [ ] Provider コンポーネントの作成と `layout.tsx` への組み込み

### Gemini API 基盤

- [ ] `src/lib/gemini.ts`: Gemini API クライアント（`@google/generative-ai` SDK 使用）
- [ ] `src/app/api/gemini/generate-scenario/route.ts`: シナリオ生成エンドポイント
- [ ] `src/app/api/gemini/evaluate/route.ts`: プレイヤー行動評価エンドポイント
- [ ] `src/app/api/gemini/feedback/route.ts`: AIフィードバックストリーミングエンドポイント
- [ ] `src/app/api/gemini/chat/route.ts`: ソーシャルエンジニアリング対話エンドポイント
- [ ] 各エンドポイントにモックフォールバックを実装（`feature/ransomware-chain-game` のモックデータを移植）
- [ ] 環境変数 `GEMINI_API_KEY` の設定（`.env.local.example` に記載）

### プロンプトテンプレート (`src/lib/prompts/`)

- [ ] `shoulder-hacking.ts`: Stage 1 用プロンプト（シチュエーション生成、情報配置、評価）
- [ ] `password-cracking.ts`: Stage 2 用プロンプト（SNSプロフィール生成、パスワード推測評価）
- [ ] `phishing.ts`: Stage 3 用プロンプト（ターゲット情報生成、メール評価）
- [ ] `ransomware.ts`: Stage 4 用プロンプト（システム構成生成、フェーズ進行、評価）
- [ ] 共通: JSON形式レスポンスの指示、Zodバリデーションスキーマ

### スコアリングロジック (`src/lib/scoring.ts`)

- [ ] ランク判定関数: S (90-100), A (70-89), B (50-69), C (30-49), D (0-29)
- [ ] 各ステージのスコア計算ヘルパー（docs/features.md のスコアリング表に基づく）

### ステージメタデータ (`src/lib/stages.ts`)

- [ ] 各ステージの定義（ID、名前、説明、難易度、アイコン、パス）
- [ ] `feature/nextjs-rewrite` の `src/data/stages.ts` を統合・拡張

## 受け入れ条件

- docs/architecture.md のディレクトリ構成と一致していること
- 共通UIコンポーネントが単体で描画・アニメーション動作すること
- GameContext で状態管理ができること（ステージ開始→スコア記録→リセットの一連の操作）
- Gemini API エンドポイントが動作すること（モックモードで）
- `GEMINI_API_KEY` 未設定時にモックフォールバックが動作すること
- TypeScript strict mode でエラーがないこと
- サイバーパンク風のダークテーマがdocs/index.mdのカラーパレットと一致していること

## 備考

- `feature/nextjs-rewrite` の既存コードを最大限活用する
- `feature/ransomware-chain-game` のPython実装はロジック参考として利用（特にAI ServiceとGame State）
- この基盤が完成すれば、各ステージと結果画面を並行して実装可能
