# Next.js フルスタック書き換え設計

## 概要

現在のReact+Vite (フロントエンド) + FastAPI (バックエンド) 構成を、Next.js 15 App Router によるフルスタック TypeScript アプリケーションに書き換える。

## 決定事項

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **アプローチ**: Server Components + Client Components ハイブリッド
- **バックエンド統合**: FastAPI → Next.js API Routes / Server Actions

## プロジェクト構造

```
cyber-security-game/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # トップページ (ステージ選択)
│   │   ├── globals.css               # Tailwind base styles
│   │   ├── characters/
│   │   │   └── page.tsx              # キャラクター紹介
│   │   ├── demo/
│   │   │   ├── page.tsx              # デモ一覧
│   │   │   └── [stageId]/
│   │   │       └── page.tsx          # 各ステージデモ
│   │   ├── game/
│   │   │   ├── page.tsx              # ゲーム開始画面
│   │   │   └── [sessionId]/
│   │   │       ├── page.tsx          # ゲーム進行画面
│   │   │       └── report/
│   │   │           └── page.tsx      # 最終レポート
│   │   └── api/
│   │       └── game/
│   │           ├── start/route.ts
│   │           ├── [sessionId]/
│   │           │   ├── state/route.ts
│   │           │   └── report/route.ts
│   │           ├── phase1/
│   │           │   ├── collect/route.ts
│   │           │   └── phishing/route.ts
│   │           ├── phase2/
│   │           │   └── attempt/route.ts
│   │           ├── phase3/
│   │           │   └── action/route.ts
│   │           └── phase4/
│   │               └── action/route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── stealth-meter.tsx
│   │   │   └── phase-transition.tsx
│   │   ├── header.tsx
│   │   ├── navigation.tsx
│   │   └── stage-card.tsx
│   ├── components/game/
│   │   ├── game-container.tsx
│   │   ├── recon-phase.tsx
│   │   ├── password-phase.tsx
│   │   ├── network-phase.tsx
│   │   └── ransomware-phase.tsx
│   ├── lib/
│   │   ├── ai-service.ts
│   │   ├── game-session.ts
│   │   ├── scenarios.ts
│   │   └── types.ts
│   └── data/
│       └── characters.ts
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── docs/
```

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| AI連携 | Google Gemini API (`@google/generative-ai`) |
| 状態管理 | React hooks + Server Actions |
| セッション管理 | インメモリ Map |

## データフロー

```
[ブラウザ] Client Component
    ↓ fetch / Server Action
[Next.js Server] API Route / Server Action
    ↓ セッション更新
[GameSessionManager] インメモリMap
    ↓ AI呼び出し
[Gemini API]
    ↓ レスポンス
[Next.js Server] → [ブラウザ] UI更新
```

## API設計

| FastAPI (現在) | Next.js Route Handler (新) |
|---------------|---------------------------|
| `POST /game/start` | `POST /api/game/start` |
| `GET /game/{id}/state` | `GET /api/game/[sessionId]/state` |
| `POST /game/phase1/collect` | `POST /api/game/phase1/collect` |
| `POST /game/phase1/phishing` | `POST /api/game/phase1/phishing` |
| `POST /game/phase2/attempt` | `POST /api/game/phase2/attempt` |
| `POST /game/phase3/action` | `POST /api/game/phase3/action` |
| `POST /game/phase4/action` | `POST /api/game/phase4/action` |
| `GET /game/{id}/report` | `GET /api/game/[sessionId]/report` |

## ページ構成

| パス | 種類 | 説明 |
|------|------|------|
| `/` | Server Component | ステージ選択画面 |
| `/characters` | Server Component | キャラクター紹介 |
| `/demo/[stageId]` | Client Component | ステージデモ |
| `/game` | Server Component | ゲーム開始画面 |
| `/game/[sessionId]` | Client Component | メインゲーム |
| `/game/[sessionId]/report` | Server Component | 最終レポート |

## Server/Client 分離方針

- **Server Component**: 静的ページ (トップ、キャラクター)、レポート表示
- **Client Component**: ゲーム全インタラクティブ部分 (`"use client"`)
- **Server Actions**: AI評価呼び出し (フィッシングメール評価など)
- **API Routes**: セッション管理、ステート取得

## 移植対応表

### バックエンド (Python → TypeScript)

| Python ファイル | TypeScript ファイル | 内容 |
|----------------|-------------------|------|
| `backend/main.py` | `next.config.ts` + `src/app/layout.tsx` | アプリ設定、CORS |
| `backend/schemas.py` | `src/lib/types.ts` | 型定義 |
| `backend/routers/game.py` | `src/app/api/game/*/route.ts` | APIエンドポイント |
| `backend/services/ai_service.py` | `src/lib/ai-service.ts` | Gemini AI連携 |
| `backend/scenarios/` | `src/lib/scenarios.ts` | シナリオデータ |

### フロントエンド (React+Vite → Next.js)

| 現在のファイル | 移植先 | 変更点 |
|--------------|--------|--------|
| `frontend/src/App.jsx` | `src/app/layout.tsx` + 各ページ | ルーティングをApp Routerに |
| `frontend/src/data.js` | `src/data/characters.ts` | TypeScript化 |
| `frontend/src/components/Header.jsx` | `src/components/header.tsx` | Tailwind化 |
| `frontend/src/components/Navigation.jsx` | `src/components/navigation.tsx` | Next.js Link使用 |
| `frontend/src/components/StageSelect.jsx` | `src/app/page.tsx` | Server Component化 |
| `frontend/src/components/Characters.jsx` | `src/app/characters/page.tsx` | Server Component化 |
| `frontend/src/components/*Demo.jsx` | `src/app/demo/[stageId]/page.tsx` | Tailwind化 |
| `frontend/src/game/*.jsx` (計画中) | `src/components/game/*.tsx` | TypeScript + Tailwind |
