# ストーリー＋コンポーネント アーキテクチャ実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 既存の React+Vite/FastAPI 構成を Next.js App Router に移行し、ストーリー＋コンポーネントのゲーム基盤を構築する

**Architecture:** Next.js App Router でフロントエンド＋API Routes を一体化。ストーリー・コンポーネント・フェーズの定義は `src/data/` の JSON ファイルで管理し、ゲーム状態は React Context で保持。Gemini API 呼び出しは API Routes 経由。

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Zod, Google Gemini API (`@google/generative-ai`)

**設計ドキュメント:** `docs/plans/2026-02-15-story-component-architecture-design.md`

---

## Task 1: Next.js プロジェクト初期セットアップ

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Modify: `.gitignore`

**Step 1: Next.js プロジェクトを作成**

プロジェクトルートに Next.js をセットアップする。既存の `frontend/` と `backend/` は残したまま並行で構築する。

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

> Note: 既存ファイルとの競合が出た場合、Next.js 側の設定を優先しつつ既存ファイルを保持する

**Step 2: 追加パッケージのインストール**

```bash
npm install framer-motion zod @google/generative-ai
npm install -D @types/node
```

**Step 3: Tailwind CSS にサイバーパンクテーマを設定**

`src/app/globals.css` にカラーパレット（背景 `#0a0a1a`、カード `#1a1a2e`、ネオングリーン・マゼンタ）を定義。

**Step 4: ルートレイアウトにフォント設定**

`src/app/layout.tsx` に Noto Sans JP + JetBrains Mono を設定。

**Step 5: 動作確認**

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスし、サイバーパンクテーマの背景が表示されることを確認。

**Step 6: コミット**

```bash
git add -A && git commit -m "feat: Next.js プロジェクト初期セットアップ"
```

---

## Task 2: 型定義とデータファイル

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/phases.json`
- Create: `src/data/components.json`
- Create: `src/data/stories.json`

**Step 1: TypeScript 型定義を作成**

`src/types/index.ts` に以下の型を定義:
- `PhaseId`, `Rank`, `Difficulty`
- `StoryDefinition`, `StoryContext`, `PhaseDefinition`
- `ComponentDefinition`
- `GameSession`, `PhaseResult`, `ScoreBreakdown`

設計ドキュメントの「データモデル」セクションに準拠すること。

**Step 2: フェーズ定義 JSON を作成**

`src/data/phases.json`:
```json
[
  { "id": "recon", "name": "情報収集", "displayName": "RECONNAISSANCE", "description": "ターゲットの情報を集める", "order": 0 },
  { "id": "credential", "name": "認証窃取", "displayName": "CREDENTIAL THEFT", "description": "ID/パスワード等を手に入れる", "order": 1 },
  { "id": "intrusion", "name": "侵入", "displayName": "INTRUSION", "description": "システムに侵入・権限昇格", "order": 2 },
  { "id": "objective", "name": "目的達成", "displayName": "OBJECTIVE", "description": "最終目的を遂行", "order": 3 }
]
```

**Step 3: コンポーネント定義 JSON を作成**

`src/data/components.json` に5つのコンポーネントを定義:
- `shoulder-hacking` (recon)
- `password-cracking` (credential)
- `phishing` (credential)
- `network-intrusion` (intrusion)
- `ransomware` (objective)

各コンポーネントに `id`, `name`, `displayName`, `phaseId`, `description`, `difficulty`, `estimatedMinutes`, `learningPoints` を含める。内容は `docs/features.md` に準拠。

**Step 4: ストーリー定義 JSON を作成**

`src/data/stories.json` に最初のストーリー `hospital-data-theft` を定義。設計ドキュメントのサンプル定義に準拠。

**Step 5: 型定義のテスト**

`src/data/` の JSON が型定義と整合することを確認するヘルパー（`src/lib/data.ts`）を作成し、`import` が通ることを確認。

```typescript
// src/lib/data.ts
import storiesData from '@/data/stories.json';
import componentsData from '@/data/components.json';
import phasesData from '@/data/phases.json';
import type { StoryDefinition, ComponentDefinition } from '@/types';

export const stories: StoryDefinition[] = storiesData;
export const components: ComponentDefinition[] = componentsData;
export const phases = phasesData;

export function getStory(id: string) { return stories.find(s => s.id === id); }
export function getComponent(id: string) { return components.find(c => c.id === id); }
export function getComponentsByPhase(phaseId: string) { return components.filter(c => c.phaseId === phaseId); }
```

**Step 6: コミット**

```bash
git add src/types/ src/data/ src/lib/data.ts && git commit -m "feat: 型定義とデータファイル（ストーリー・コンポーネント・フェーズ）"
```

---

## Task 3: GameContext（ゲーム状態管理）

**Files:**
- Create: `src/contexts/GameContext.tsx`
- Create: `src/lib/session.ts`

**Step 1: セッション管理ロジックを作成**

`src/lib/session.ts`:
- `createSession(storyId: string): GameSession` — ストーリーのフェーズごとにコンポーネントプールからランダムに1つ選び、`selectedComponents` を決定
- `generateSessionId(): string` — UUID生成
- `advancePhase(session: GameSession, result: PhaseResult): GameSession` — フェーズを進め、結果を記録
- `isSessionComplete(session: GameSession): boolean`

**Step 2: GameContext を作成**

`src/contexts/GameContext.tsx`:
- `GameProvider` コンポーネント
- `useGame()` フック
- 状態: `session: GameSession | null`, `isLoading: boolean`
- アクション: `startStory(storyId)`, `completePhase(result)`, `resetSession()`
- 現在のフェーズ情報を導出: `currentPhase`, `currentComponent`, `previousResults`, `accumulatedContext`（全フェーズの contextOutput をマージ）

**Step 3: 動作確認**

`src/app/page.tsx` で `useGame()` を呼び出し、コンソールに状態が出力されることを確認。

**Step 4: コミット**

```bash
git add src/contexts/ src/lib/session.ts && git commit -m "feat: GameContext とセッション管理"
```

---

## Task 4: コンポーネントレジストリ

**Files:**
- Create: `src/lib/component-registry.ts`
- Create: `src/components/game/components/index.ts`
- Create: `src/components/game/components/PlaceholderComponent.tsx`

**Step 1: プレースホルダーコンポーネントを作成**

各攻撃コンポーネントの実装前に、共通インターフェースを持つプレースホルダーを作成:

```typescript
// src/components/game/components/PlaceholderComponent.tsx
'use client';
import type { StoryContext, PhaseResult } from '@/types';

export interface GameComponentProps {
  storyContext: StoryContext;
  previousContext: Record<string, unknown>; // 前フェーズからの引き継ぎ
  onComplete: (result: Omit<PhaseResult, 'componentId' | 'phaseId' | 'completedAt'>) => void;
}
```

**Step 2: コンポーネントレジストリを作成**

`src/lib/component-registry.ts`:
- コンポーネントIDから React コンポーネントへのマッピング
- `getGameComponent(componentId: string): React.ComponentType<GameComponentProps>`
- 未実装のコンポーネントにはプレースホルダーを返す

**Step 3: コミット**

```bash
git add src/lib/component-registry.ts src/components/game/ && git commit -m "feat: コンポーネントレジストリとプレースホルダー"
```

---

## Task 5: UI 共通コンポーネント

**Files:**
- Create: `src/components/ui/CyberButton.tsx`
- Create: `src/components/ui/GlowCard.tsx`
- Create: `src/components/ui/TerminalText.tsx`
- Create: `src/components/ui/NeonBadge.tsx`

**Step 1: CyberButton を作成**

サイバーパンク風ボタン。ネオングリーン/マゼンタのグロー効果、Framer Motion の whileHover/whileTap アニメーション付き。variant: `primary`, `secondary`, `danger`。

**Step 2: GlowCard を作成**

グロー効果付きカード。背景 `#1a1a2e`、ホバー時にネオンボーダーが光る。

**Step 3: TerminalText を作成**

JetBrains Mono フォントでタイプライターエフェクト。Framer Motion で1文字ずつ表示。

**Step 4: NeonBadge を作成**

難易度やフェーズ名を表示する小さなバッジ。色をプロパティで切り替え可能。

**Step 5: 動作確認**

`src/app/page.tsx` に各コンポーネントを仮配置して表示確認。

**Step 6: コミット**

```bash
git add src/components/ui/ && git commit -m "feat: UI共通コンポーネント（CyberButton, GlowCard, TerminalText, NeonBadge）"
```

---

## Task 6: トップ画面（ストーリー選択）

**Files:**
- Create: `src/components/story/StoryCard.tsx`
- Modify: `src/app/page.tsx`

**Step 1: StoryCard コンポーネントを作成**

ストーリーカード。ストーリーのタイトル・説明・難易度・業界を表示。GlowCard をベースに、Framer Motion のホバーアニメーション付き。タップで `/story/[storyId]` へ遷移。

**Step 2: トップ画面を実装**

`src/app/page.tsx`:
- ストーリー一覧セクション: `stories.json` から読み込み、StoryCard で表示
- 練習モードセクション（後から実装するため、セクションヘッダーだけ）
- サイバーパンク風のヘッダー（「CyberGuardians」タイトル）

**Step 3: 動作確認**

ブラウザでストーリーカードが表示され、タップで遷移することを確認。

**Step 4: コミット**

```bash
git add src/components/story/ src/app/page.tsx && git commit -m "feat: トップ画面（ストーリー選択）"
```

---

## Task 7: ストーリー詳細・ゲーム開始画面

**Files:**
- Create: `src/app/story/[storyId]/page.tsx`
- Create: `src/components/story/StoryDetail.tsx`
- Create: `src/components/story/PhaseTimeline.tsx`

**Step 1: PhaseTimeline コンポーネントを作成**

4フェーズの進行タイムライン。各フェーズに選ばれたコンポーネント名を表示。現在のフェーズをハイライト。Framer Motion でアニメーション。

**Step 2: StoryDetail コンポーネントを作成**

ストーリーのタイトル、説明、ターゲット組織情報、PhaseTimeline、START ボタンを含む。START ボタン押下で `GameContext.startStory()` を呼び出し、`/story/[storyId]/play` へ遷移。

**Step 3: ストーリー詳細ページを作成**

`src/app/story/[storyId]/page.tsx`: params からストーリーを取得し、StoryDetail を表示。

**Step 4: 動作確認**

ストーリーカードタップ → 詳細画面表示 → コンポーネント構成（ランダム）が表示されることを確認。

**Step 5: コミット**

```bash
git add src/app/story/ src/components/story/ && git commit -m "feat: ストーリー詳細・ゲーム開始画面"
```

---

## Task 8: ゲーム進行画面（GameContainer + PhaseTransition）

**Files:**
- Create: `src/app/story/[storyId]/play/page.tsx`
- Create: `src/components/game/GameContainer.tsx`
- Create: `src/components/game/PhaseTransition.tsx`

**Step 1: PhaseTransition コンポーネントを作成**

フェーズ間の遷移演出。サイバーパンク風グリッチエフェクト + 次のフェーズ名表示。Framer Motion の `AnimatePresence` で制御。2秒程度の演出。

**Step 2: GameContainer コンポーネントを作成**

ゲーム全体の進行を管理:
- `useGame()` から現在のフェーズとコンポーネントを取得
- コンポーネントレジストリからゲームコンポーネントを動的ロード
- コンポーネント完了時に `completePhase()` を呼び、PhaseTransition を表示
- 全フェーズ完了時に `/result` へ遷移
- 上部にフェーズ進行バー（PhaseTimeline の小型版）を表示

**Step 3: ゲーム進行ページを作成**

`src/app/story/[storyId]/play/page.tsx`: GameContainer をレンダリング。セッションがなければストーリー詳細に戻す。

**Step 4: 動作確認**

プレースホルダーコンポーネントが順番に表示され、フェーズ遷移演出が動作することを確認。

**Step 5: コミット**

```bash
git add src/app/story/ src/components/game/ && git commit -m "feat: ゲーム進行画面（GameContainer + PhaseTransition）"
```

---

## Task 9: API Route（ゲーム開始 + フェーズアクション）

**Files:**
- Create: `src/app/api/game/start/route.ts`
- Create: `src/app/api/game/phase/[phaseId]/action/route.ts`
- Create: `src/lib/gemini.ts`
- Create: `src/lib/prompts/common.ts`

**Step 1: Gemini API クライアントを作成**

`src/lib/gemini.ts`:
- `@google/generative-ai` SDK を使用
- 環境変数 `GEMINI_API_KEY` から取得
- `generateContent()` と `generateContentStream()` のラッパー関数
- JSON レスポンスのパースヘルパー

**Step 2: 共通プロンプトを作成**

`src/lib/prompts/common.ts`:
- `buildStoryContextPrompt(context: StoryContext): string` — ストーリーコンテキストをプロンプトに注入するテンプレート
- `buildPhaseContextPrompt(previousResults: PhaseResult[]): string` — 前フェーズの成果をプロンプトに注入

**Step 3: ゲーム開始 API を作成**

`POST /api/game/start`:
- リクエスト: `{ storyId: string }`
- ストーリー定義を取得、コンポーネントをランダム選択
- レスポンス: `{ sessionId, selectedComponents, storyContext }`

**Step 4: フェーズアクション API を作成**

`POST /api/game/phase/[phaseId]/action`:
- リクエスト: `{ componentId, action, storyContext, previousContext }`
- コンポーネントに応じたプロンプトで Gemini API を呼び出し
- レスポンス: コンポーネント固有の結果（Zod でバリデーション）

**Step 5: 動作確認**

```bash
curl -X POST http://localhost:3000/api/game/start -H 'Content-Type: application/json' -d '{"storyId":"hospital-data-theft"}'
```

**Step 6: コミット**

```bash
git add src/app/api/ src/lib/gemini.ts src/lib/prompts/ && git commit -m "feat: API Route（ゲーム開始 + フェーズアクション + Gemini連携）"
```

---

## Task 10: セッション結果画面

**Files:**
- Create: `src/app/result/page.tsx`
- Create: `src/components/result/SessionReport.tsx`
- Create: `src/components/result/PhaseScoreCard.tsx`
- Create: `src/components/result/RankBadge.tsx`
- Create: `src/components/result/AIFeedback.tsx`

**Step 1: RankBadge コンポーネントを作成**

S/A/B/C/D ランクをサイバーパンク風に表示。Framer Motion で登場アニメーション。ランクに応じた色分け。

**Step 2: PhaseScoreCard を作成**

各フェーズのスコア内訳をカード形式で表示。コンポーネント名、スコア、breakdown を含む。

**Step 3: AIFeedback を作成**

Gemini API のストリーミングレスポンスを表示するコンポーネント。タイプライターエフェクトで1文字ずつ表示。

**Step 4: SessionReport を作成**

全体を統合:
- 総合スコア（円形プログレスバー）
- ランク表示（RankBadge）
- フェーズ別スコア（PhaseScoreCard × 4）
- AIフィードバック（AIFeedback）
- 「もう一度プレイ」「ストーリー選択に戻る」ボタン

**Step 5: 結果ページを作成**

`src/app/result/page.tsx`: GameContext からセッション結果を取得し、SessionReport を表示。

**Step 6: コミット**

```bash
git add src/app/result/ src/components/result/ && git commit -m "feat: セッション結果画面"
```

---

## Task 11: 練習モード（コンポーネント単体プレイ）

**Files:**
- Create: `src/app/component/[componentId]/page.tsx`
- Modify: `src/app/page.tsx` （練習モードセクションを追加）

**Step 1: コンポーネント練習ページを作成**

`src/app/component/[componentId]/page.tsx`:
- コンポーネント定義を取得
- ストーリーコンテキストなしのデフォルトコンテキストを生成
- GameContainer の簡易版（単一コンポーネントのみ）
- 完了後にコンポーネント単体の結果を表示

**Step 2: トップ画面に練習モードを追加**

`src/app/page.tsx` の練習モードセクションにコンポーネント一覧を表示。フェーズごとにグループ化。

**Step 3: コミット**

```bash
git add src/app/component/ src/app/page.tsx && git commit -m "feat: 練習モード（コンポーネント単体プレイ）"
```

---

## Task 12〜16: 各攻撃コンポーネントの実装

以降は各コンポーネントを個別に実装する。優先度順に:

### Task 12: フィッシング攻撃コンポーネント
- `src/components/game/components/Phishing.tsx`
- `src/lib/prompts/phishing.ts`
- メーラー風UI、メール作成フォーム、Gemini による評価

### Task 13: パスワードクラッキングコンポーネント
- `src/components/game/components/PasswordCracking.tsx`
- `src/lib/prompts/password-cracking.ts`
- ターミナル風UI、プロフィール表示、3つの攻撃モード

### Task 14: ショルダーハッキングコンポーネント
- `src/components/game/components/ShoulderHacking.tsx`
- `src/lib/prompts/shoulder-hacking.ts`
- 制限時間つき画像探索UI

### Task 15: ネットワーク侵入コンポーネント
- `src/components/game/components/NetworkIntrusion.tsx`
- `src/lib/prompts/network-intrusion.ts`
- ネットワークマップ探索UI

### Task 16: ランサムウェア展開コンポーネント
- `src/components/game/components/Ransomware.tsx`
- `src/lib/prompts/ransomware.ts`
- ファイル暗号化シミュレーション + 脅迫文作成UI

---

## 備考

- 各タスクの詳細な実装コードは、実装時に `docs/features.md` と `docs/plans/2026-02-15-story-component-architecture-design.md` を参照すること
- Task 1〜11 が基盤、Task 12〜16 が個別コンポーネントの実装
- Task 12〜16 は並列実装可能（互いに依存しない）
- 既存の `frontend/` と `backend/` は Next.js 移行完了まで残しておく
