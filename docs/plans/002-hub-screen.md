# 002: ハブ画面

## 概要

ゲーム全体のメインナビゲーションとなるハブ画面を実装する。3つのタブ（ステージ / キャラ / 体験デモ）の切り替え、OPERATIONカード、ステージカード一覧を構築する。

## 要件ソース

- docs/features.md#ハブ画面（ステージ選択）
- docs/index.md#ハブ画面（`/`）

## 既存実装の活用

| 流用元ブランチ | 内容 | 備考 |
|---------------|------|------|
| `feature/nextjs-rewrite` | `src/app/page.tsx` | ステージ選択UIあり。タブ切替に改修が必要 |
| `feature/nextjs-rewrite` | `src/components/navigation.tsx` | タブナビゲーションあり。Framer Motionアニメーション追加 |
| `feature/nextjs-rewrite` | `src/app/characters/page.tsx` | キャラクターページ。タブ内に統合 |
| `feature/nextjs-rewrite` | `src/data/characters.ts`, `src/data/stages.ts` | 静的データ |

## タスク

### タブナビゲーション (`src/components/hub/TabNav.tsx`)

- [ ] 3タブ構成: ⚔️ ステージ（デフォルト）/ 👥 キャラ / 🖥️ 体験デモ
- [ ] Framer Motion の `AnimatePresence` でタブ切り替えアニメーション
- [ ] 現在のページルーティング方式からクライアントサイドのタブ切り替え方式に変更

### OPERATIONカード (`src/components/hub/OperationCard.tsx`)

- [ ] 紫グラデーション枠、⚔️アイコン
- [ ] 「OPERATION: RANSOMWARE」タイトル + 説明テキスト
- [ ] 「プレイする →」ピンクグラデーションボタン（CyberButton使用）
- [ ] タップで `/stage/ransomware?mode=operation` へ遷移

### ステージカード一覧 (`src/components/hub/StageCard.tsx`)

- [ ] 「ATTACK SIDE — 攻撃者体験」セクションヘッダー + サブテキスト
- [ ] 各ステージカード: アイコン、ステージ番号+名前、説明、難易度ドット（色分け）
- [ ] カードホバー: スケール 1.02 + グロー強化（GlowCard使用）
- [ ] カードタップ: `/stage/[stageId]` へ遷移

### キャラタブ (`src/components/hub/CharacterTab.tsx`)

- [ ] 「シャドウ」のプロフィール表示（アバター、名前、説明）
- [ ] スキルレベル表示（MVP: 静的な表示のみ）
- [ ] `feature/nextjs-rewrite` のキャラクターページから移植・統合

### 体験デモタブ (`src/components/hub/DemoTab.tsx`)

- [ ] 各ステージの簡単な操作チュートリアル・説明カード
- [ ] ゲームの遊び方説明
- [ ] セキュリティ用語集（MVPではハードコードリスト。将来的にGemini APIで質問可能に）

### ハブ画面統合 (`src/app/page.tsx`)

- [ ] TabNav + 各タブコンテンツの統合
- [ ] ヘッダー: 🛡️ CyberGuardians ロゴ + サブタイトル
- [ ] ページ全体のフェードイン + スライドアップアニメーション

## 受け入れ条件

- 3つのタブがスムーズに切り替わること（Framer Motionアニメーション付き）
- OPERATIONカードが紫グラデーション枠で目立つこと
- 各ステージカードに難易度ドット（色分け: 黄/赤/紫/赤）が表示されること
- ステージカードタップでゲーム画面へ正しく遷移すること
- モバイルファーストのレスポンシブデザインであること

## 備考

- 現在の `feature/nextjs-rewrite` ではルーティングベースのナビゲーション（`/`, `/characters`）だが、docs仕様ではタブ切り替え方式。クライアントサイドのタブ切り替えに変更する
