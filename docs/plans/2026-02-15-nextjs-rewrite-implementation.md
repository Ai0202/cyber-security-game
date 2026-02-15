# Next.js 16 フルスタック書き換え実装計画

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** React+Vite+FastAPI構成のサイバーセキュリティ教育ゲームを、Next.js 16フルスタックTypeScriptアプリに書き換える

**Architecture:** Next.js 16 App Router でサーバー/クライアントのハイブリッド構成。静的ページはServer Components、ゲーム画面はClient Components、バックエンドAPIはRoute Handlersで提供。Gemini AI連携はサーバーサイドで実行。

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, React 19.2, Turbopack, Google Generative AI SDK

---

## Task 1: Next.js 16 プロジェクトセットアップ

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `.env.local`
- Delete: `frontend/` (後で), `backend/` (後で)

**Step 1: Next.js 16プロジェクトを初期化**

プロジェクトルートで実行:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --turbopack --src-dir --import-alias "@/*" --use-npm
```

もし既存ファイルとの衝突で失敗する場合は、一旦 `nextjs-app` ディレクトリに作成してファイルを移動する:

```bash
npx create-next-app@latest nextjs-app --typescript --tailwind --eslint --app --turbopack --src-dir --import-alias "@/*" --use-npm
```

その後、生成されたファイル群をルートに移動。

**Step 2: 追加の依存関係をインストール**

```bash
npm install @google/generative-ai uuid
npm install -D @types/uuid
```

**Step 3: `.env.local` を作成**

```
GEMINI_API_KEY=your_api_key_here
```

**Step 4: `next.config.ts` を確認・調整**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

**Step 5: `tailwind.config.ts` にダークテーマのカスタムカラーを追加**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#0a0e1a",
          text: "#e2e8f0",
          "text-dim": "#94a3b8",
          primary: "#22d3ee",
          accent: "#6366f1",
          surface: "rgba(255, 255, 255, 0.02)",
          "surface-hover": "rgba(255, 255, 255, 0.04)",
          border: "rgba(255, 255, 255, 0.06)",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans JP'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 6: `src/app/globals.css` を作成**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  background-color: #0a0e1a;
  color: #e2e8f0;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Grid Background Effect */
.bg-grid {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}
```

**Step 7: `src/app/layout.tsx` を作成**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberGuardians - サイバーセキュリティ体験学習",
  description: "攻撃者の目線で学ぶ、サイバーセキュリティ体験学習ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <div className="bg-grid" />
        <div className="relative z-10 max-w-[480px] mx-auto px-4 py-5">
          {children}
        </div>
      </body>
    </html>
  );
}
```

**Step 8: 動作確認**

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてダークテーマの空ページが表示されることを確認。

**Step 9: コミット**

```bash
git add -A
git commit -m "feat: initialize Next.js 16 project with TypeScript and Tailwind CSS"
```

---

## Task 2: 型定義とデータ層の移植

**Files:**
- Create: `src/lib/types.ts`, `src/data/characters.ts`, `src/data/stages.ts`, `src/data/passwords.ts`, `src/lib/scenarios.ts`

**Step 1: `src/lib/types.ts` を作成**

Python の Pydantic モデル + フロントエンドの型を TypeScript に変換:

```typescript
// ========== キャラクター ==========
export interface Character {
  name: string;
  role: string;
  emoji: string;
  color: string;
  desc: string;
}

export type CharacterMap = Record<string, Character>;

// ========== ステージ ==========
export interface Stage {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  mode: "attack" | "defense";
  color: string;
}

// ========== パスワードデモ ==========
export interface PasswordEntry {
  value: string;
  time: string;
  strength: number;
  label: string;
}

// ========== ゲームセッション ==========
export interface GameSession {
  id: string;
  currentPhase: 1 | 2 | 3 | 4;
  stealth: number;
  collectedClues: Clue[];
  discoveredNodes: string[];
  compromisedNodes: string[];
  hasAdmin: boolean;
  backupDisabled: boolean;
  passwordAttempts: number;
  detectionLevel: number;
  actionLog: ActionLogEntry[];
  phaseResults: Partial<Record<number, PhaseResult>>;
}

export interface Clue {
  id: string;
  type: string;
  description: string;
}

export interface ActionLogEntry {
  phase: number;
  action: string;
  detail: string;
  timestamp: number;
  stealth: number;
}

export interface PhaseResult {
  completed: boolean;
  score: number;
  details: Record<string, unknown>;
}

// ========== API リクエスト/レスポンス ==========
export interface ActionRequest {
  actionType: string;
  targetId?: string;
  inputValue?: string;
}

export interface CharacterReaction {
  character: string;
  reactionType: string;
  message: string;
  emoji: string;
}

export interface CollectClueRequest {
  sessionId: string;
  postId: string;
}

export interface CollectClueResponse {
  success: boolean;
  clueType: string;
  clueDescription: string;
  totalClues: number;
}

export interface PhishingEmailRequest {
  sessionId: string;
  subject: string;
  body: string;
  sender: string;
}

export interface PhishingEmailResponse {
  score: number;
  feedback: string;
  isSuccess: boolean;
  victimReaction: string;
  stealth: number;
}

export interface PasswordAttemptRequest {
  sessionId: string;
  password: string;
}

export interface PasswordAttemptResponse {
  success: boolean;
  message: string;
  attemptsRemaining: number;
  stealth: number;
  hint?: string;
  lockedOut: boolean;
}

export interface NetworkActionRequest {
  sessionId: string;
  action: "scan" | "access" | "exploit";
  nodeId: string;
}

export interface NetworkActionResponse {
  success: boolean;
  message: string;
  discoveredNodes: string[];
  filesFound: string[];
  stealth: number;
  defenderReaction?: string;
}

export interface RansomwareActionRequest {
  sessionId: string;
  action: "encrypt" | "ransom" | "exfiltrate";
  targetNodes?: string[];
  speed?: "fast" | "stealth";
  ransomMessage?: string;
}

export interface RansomwareActionResponse {
  success: boolean;
  message: string;
  encryptedNodes: string[];
  stealth: number;
  defenderReaction?: string;
  backupStatus: string;
}

export interface GameStartResponse {
  sessionId: string;
  phase: number;
  stealth: number;
  targetProfile: TargetProfile;
}

export interface TargetProfile {
  name: string;
  department: string;
  company: string;
  snsPosts: SnsPost[];
}

export interface SnsPost {
  id: string;
  content: string;
  image?: string;
  hasClue: boolean;
}

export interface FinalReport {
  rank: "S" | "A" | "B" | "C" | "D";
  summary: string;
  phaseFeedback: PhaseFeedback[];
  keyLearning: string[];
  stealth: number;
}

export interface PhaseFeedback {
  phase: number;
  title: string;
  score: number;
  feedback: string;
}
```

**Step 2: `src/data/characters.ts` を作成**

```typescript
import { CharacterMap } from "@/lib/types";

export const CHARACTERS: CharacterMap = {
  mamoru: { name: "マモル", role: "ファイアウォール", emoji: "🛡️", color: "#2563eb", desc: "真面目な門番。外部からの侵入を防ぐ" },
  passuwa: { name: "パスワ", role: "パスワード", emoji: "🔑", color: "#d97706", desc: "強さで姿が変わる鍵の番人" },
  crypto: { name: "クリプト", role: "暗号化", emoji: "🥷", color: "#7c3aed", desc: "データを暗号の衣で守る忍者" },
  mailer: { name: "メーラ", role: "メールクライアント", emoji: "📧", color: "#e11d48", desc: "おしゃべりで人を疑わない" },
  shadow: { name: "シャドウ", role: "攻撃者", emoji: "👤", color: "#1e293b", desc: "あなたが操る攻撃者" },
};
```

**Step 3: `src/data/stages.ts` を作成**

```typescript
import { Stage } from "@/lib/types";

export const STAGES: Stage[] = [
  { id: 1, title: "ショルダーハッキング", subtitle: "覗き見で情報を盗め", icon: "👁️", difficulty: 1, mode: "attack", color: "#f59e0b" },
  { id: 2, title: "パスワードクラッキング", subtitle: "弱いパスワードを突破せよ", icon: "🔓", difficulty: 2, mode: "attack", color: "#ef4444" },
  { id: 3, title: "フィッシング攻撃", subtitle: "偽メールで騙せ", icon: "🎣", difficulty: 2, mode: "attack", color: "#8b5cf6" },
  { id: 4, title: "ランサムウェア侵攻", subtitle: "サーバーを暗号化せよ", icon: "💀", difficulty: 3, mode: "attack", color: "#dc2626" },
  { id: 5, title: "ソーシャルエンジニアリング", subtitle: "人間の隙を突け", icon: "🎭", difficulty: 3, mode: "attack", color: "#6366f1" },
  { id: 6, title: "公衆Wi-Fi攻撃", subtitle: "偽アクセスポイントを仕掛けろ", icon: "📡", difficulty: 2, mode: "attack", color: "#0891b2" },
];

export const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: "カフェで仕事中の社員を観察し、画面の覗き見・付箋のパスワード・社員証の情報を見つけ出します。物理的なセキュリティの重要性を体感。",
  2: "盗んだパスワードハッシュに対して辞書攻撃・ブルートフォースを実行。弱いパスワードが0.001秒で突破される衝撃を体験。",
  3: "本物そっくりの偽メールを作成してターゲットに送信。キャラクター「メーラ」がうっかり開いてしまう場面を目撃。",
  4: "侵入後、クリプトの暗号化能力を悪用してサーバー内のファイルを次々と暗号化。身代金要求画面を作成し、バックアップの重要性を学ぶ。",
  5: "AIチャットで社員になりすまし、電話やメールで機密情報を聞き出す。相手の警戒レベルゲージが上がるとゲームオーバー。",
  6: "カフェに偽Wi-Fiアクセスポイントを設置し、接続してきた人の通信を傍受。VPNの重要性を理解。",
};
```

**Step 4: `src/data/passwords.ts` を作成**

```typescript
import { PasswordEntry } from "@/lib/types";

export const PASSWORDS: PasswordEntry[] = [
  { value: "password", time: "0.001秒", strength: 3, label: "辞書攻撃で瞬殺" },
  { value: "1234567890", time: "0.01秒", strength: 5, label: "数字だけは危険" },
  { value: "tanaka1985", time: "3分", strength: 20, label: "名前＋生年は推測可能" },
  { value: "Coffee#Mug42", time: "3ヶ月", strength: 55, label: "まあまあ強い" },
  { value: "Xk#9pL!2qW$m", time: "推定380年", strength: 95, label: "突破ほぼ不可能" },
];
```

**Step 5: `src/lib/scenarios.ts` を作成**

```typescript
import { TargetProfile, SnsPost } from "@/lib/types";

export const TARGET_PROFILE: TargetProfile = {
  name: "田中太郎",
  department: "経理部",
  company: "サイバーコーポレーション",
  snsPosts: [
    { id: "post1", content: "愛犬ポチと朝の散歩🐕 今日も元気！", hasClue: true },
    { id: "post2", content: "1985年生まれの同期会、楽しかった！🎂", hasClue: true },
    { id: "post3", content: "新しいオフィスで記念写真📸 メールは mail.cyberco.jp です", hasClue: true },
    { id: "post4", content: "パスワード覚えるの苦手...覚えやすいのにしちゃう😅", hasClue: true },
    { id: "post5", content: "鈴木部長の送別会、お疲れ様でした🍻", hasClue: true },
    { id: "post6", content: "今日のランチは蕎麦🍜 美味しかった", hasClue: false },
  ],
};

export const CORRECT_PASSWORDS = ["pochi1985", "Pochi1985", "pochi85"];

export const NETWORK_NODES = {
  pc_tanaka: { name: "田中のPC", type: "pc", hidden: false, files: ["経費報告.xlsx", "会議メモ.docx"] },
  file_server: { name: "ファイルサーバー", type: "server", hidden: false, files: ["売上データ.csv", "顧客リスト.xlsx"] },
  mail_server: { name: "メールサーバー", type: "server", hidden: false, files: [] },
  admin_pc: { name: "管理者端末", type: "admin", hidden: true, files: ["admin_config.json", "全社パスワード.enc"] },
  backup_server: { name: "バックアップサーバー", type: "backup", hidden: true, files: ["backup_2024.tar.gz"] },
  firewall: { name: "ファイアウォール (マモル)", type: "firewall", hidden: false, files: [] },
};
```

**Step 6: コミット**

```bash
git add src/lib/types.ts src/data/ src/lib/scenarios.ts
git commit -m "feat: add TypeScript type definitions and data layer"
```

---

## Task 3: 共有コンポーネントの移植 (Header, Navigation)

**Files:**
- Create: `src/components/header.tsx`, `src/components/navigation.tsx`

**Step 1: `src/components/header.tsx` を作成**

```tsx
export default function Header() {
  return (
    <div className="text-center mb-7">
      <div className="inline-flex items-center gap-2.5 px-[18px] py-2 bg-gradient-to-br from-cyan-400/10 to-indigo-500/10 rounded-full border border-cyan-400/15 mb-3.5">
        <span className="text-xl">🛡️</span>
        <span className="text-xl font-black bg-gradient-to-br from-cyan-400 to-indigo-400 bg-clip-text text-transparent tracking-widest">
          CyberGuardians
        </span>
      </div>
      <p className="text-slate-500 text-xs m-0 tracking-wider">
        攻撃者の目線で学ぶ、サイバーセキュリティ体験学習
      </p>
    </div>
  );
}
```

**Step 2: `src/components/navigation.tsx` を作成**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "ステージ", icon: "⚔️" },
  { href: "/characters", label: "キャラ", icon: "👥" },
  { href: "/demo", label: "体験デモ", icon: "🎮" },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex gap-1.5 mb-6 justify-center">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`px-[18px] py-2 rounded-lg text-[13px] font-semibold no-underline transition-all ${
            isActive(tab.href)
              ? "bg-cyan-400/[.12] border border-cyan-400/25 text-cyan-400"
              : "bg-transparent border border-white/[.06] text-slate-500 hover:border-white/[.12]"
          }`}
        >
          {tab.icon} {tab.label}
        </Link>
      ))}
    </div>
  );
}
```

**Step 3: `src/app/layout.tsx` を更新してHeader + Navigationを追加**

```tsx
import type { Metadata } from "next";
import Header from "@/components/header";
import Navigation from "@/components/navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberGuardians - サイバーセキュリティ体験学習",
  description: "攻撃者の目線で学ぶ、サイバーセキュリティ体験学習ゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <div className="bg-grid" />
        <div className="relative z-10 max-w-[480px] mx-auto px-4 py-5">
          <Header />
          <Navigation />
          {children}
          <div className="text-center mt-8 pb-5">
            <div className="text-[10px] text-slate-800 tracking-wider">
              CONCEPT PROTOTYPE — CyberGuardians v0.1
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
```

**Step 4: 動作確認**

```bash
npm run dev
```

ブラウザでヘッダーとナビゲーションが表示されることを確認。

**Step 5: コミット**

```bash
git add src/components/header.tsx src/components/navigation.tsx src/app/layout.tsx
git commit -m "feat: add Header and Navigation components with Tailwind CSS"
```

---

## Task 4: トップページ (ステージ選択) の移植

**Files:**
- Create: `src/app/page.tsx`

**Step 1: `src/app/page.tsx` を作成**

```tsx
"use client";

import { useState } from "react";
import { STAGES, STAGE_DESCRIPTIONS } from "@/data/stages";

export default function HomePage() {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  return (
    <div>
      {/* Attack Side Banner */}
      <div className="flex items-center gap-2.5 p-3.5 px-4 bg-red-500/[.06] rounded-xl border border-red-500/[.12] mb-5">
        <span className="text-[22px]">👤</span>
        <div>
          <div className="text-[13px] font-bold text-red-300">
            ATTACK SIDE — 攻撃者体験
          </div>
          <div className="text-[11px] text-slate-400">
            シャドウを操作して企業への侵入を試みよ
          </div>
        </div>
      </div>

      {/* Stage List */}
      <div className="flex flex-col gap-2.5">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
            className="p-4 rounded-[14px] text-left transition-all duration-[250ms] border cursor-pointer"
            style={{
              background: selectedStage === stage.id
                ? `linear-gradient(135deg, ${stage.color}15, ${stage.color}08)`
                : "rgba(255,255,255,0.02)",
              borderColor: selectedStage === stage.id
                ? `${stage.color}40`
                : "rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[22px] shrink-0"
                style={{ background: `${stage.color}18` }}
              >
                {stage.icon}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-200">
                  Stage {stage.id}: {stage.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {stage.subtitle}
                </div>
              </div>
              <div className="flex gap-[3px]">
                {[1, 2, 3].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: d <= stage.difficulty ? stage.color : "rgba(255,255,255,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>

            {selectedStage === stage.id && (
              <div className="mt-3.5 pt-3.5 border-t border-white/[.06] text-xs text-slate-400 leading-[1.7]">
                {STAGE_DESCRIPTIONS[stage.id]}
                <div
                  className="mt-2.5 py-2 px-3.5 rounded-lg text-center font-bold text-[13px] cursor-pointer"
                  style={{ background: `${stage.color}12`, color: stage.color }}
                >
                  ▶ ステージ開始
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 動作確認**

```bash
npm run dev
```

トップページにステージ一覧が表示され、クリックで展開されることを確認。

**Step 3: コミット**

```bash
git add src/app/page.tsx
git commit -m "feat: add stage selection home page"
```

---

## Task 5: キャラクターページの移植

**Files:**
- Create: `src/app/characters/page.tsx`

**Step 1: `src/app/characters/page.tsx` を作成**

```tsx
import { CHARACTERS } from "@/data/characters";

export default function CharactersPage() {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-center mb-2">
        <div className="text-[15px] font-bold text-slate-400">
          サイバーシティの住人たち
        </div>
        <div className="text-[11px] text-slate-600 mt-1">
          コンピュータの仕組みを擬人化したキャラクター
        </div>
      </div>

      {Object.values(CHARACTERS).map((char) => (
        <div
          key={char.name}
          className="p-[18px] rounded-[14px] flex items-center gap-3.5"
          style={{
            background: `linear-gradient(135deg, ${char.color}08, transparent)`,
            border: `1px solid ${char.color}20`,
          }}
        >
          <div
            className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[28px] shrink-0"
            style={{
              background: `${char.color}15`,
              border: `1px solid ${char.color}25`,
            }}
          >
            {char.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-200">
                {char.name}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded font-semibold"
                style={{
                  background: `${char.color}20`,
                  color: char.color,
                }}
              >
                {char.role}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 leading-normal">
              {char.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: 動作確認**

```bash
npm run dev
```

`/characters` ページに5キャラクターが表示されることを確認。

**Step 3: コミット**

```bash
git add src/app/characters/page.tsx
git commit -m "feat: add characters page"
```

---

## Task 6: デモページの移植 (ShoulderHack, Password, Ransomware)

**Files:**
- Create: `src/app/demo/page.tsx`, `src/components/demo/shoulder-hack-demo.tsx`, `src/components/demo/password-demo.tsx`, `src/components/demo/ransomware-demo.tsx`

**Step 1: `src/components/demo/shoulder-hack-demo.tsx` を作成**

```tsx
"use client";

import { useState } from "react";

const hints = [
  { id: "sticky", label: "付箋のパスワード", x: 72, y: 22, detail: "モニターに貼られた「pass1234」" },
  { id: "screen", label: "画面の機密情報", x: 38, y: 40, detail: "顧客リストが丸見え" },
  { id: "badge", label: "社員証の氏名", x: 55, y: 68, detail: "名前から社内システムIDを推測可能" },
];

export default function ShoulderHackDemo() {
  const [found, setFound] = useState<string[]>([]);

  const handleFind = (id: string) => {
    if (!found.includes(id)) setFound([...found, id]);
  };

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        カフェで仕事中の社員を観察。<br />
        危険な情報漏洩ポイントを3つ見つけてタップしよう。
      </p>

      {/* Cafe Scene */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl overflow-hidden border border-white/[.08] mb-3.5">
        {/* Table */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-[#2d1b11]" />
        <div className="absolute bottom-[30%] left-[20%] w-[60%] h-[8%] bg-[#5c3a1e] rounded-t" />
        {/* Laptop */}
        <div className="absolute bottom-[38%] left-[30%] w-[30%] h-[22%] bg-slate-700 rounded-t border-2 border-slate-600">
          <div className="absolute inset-[3px] bg-slate-800 rounded-sm flex items-center justify-center">
            <span className="text-slate-500 text-[8px]">顧客リスト.xlsx</span>
          </div>
        </div>
        {/* Sticky note */}
        <div className="absolute top-[15%] right-[18%] w-[50px] h-[40px] bg-yellow-300 rounded-sm rotate-[5deg] flex items-center justify-center">
          <span className="text-yellow-900 text-[7px] font-bold">pass1234</span>
        </div>
        {/* Person */}
        <div className="absolute bottom-[45%] left-[42%] w-7 h-7 bg-slate-500 rounded-full" />
        <div className="absolute bottom-[25%] left-[38%] w-9 h-8 bg-slate-600 rounded-t-lg" />
        {/* Badge */}
        <div className="absolute bottom-[30%] left-[50%] w-[22px] h-[14px] bg-white rounded-sm flex items-center justify-center">
          <span className="text-slate-800 text-[5px]">田中太郎</span>
        </div>

        {/* Clickable hotspots */}
        {hints.map((h) => (
          <button
            key={h.id}
            onClick={() => handleFind(h.id)}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 cursor-pointer"
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: found.includes(h.id) ? 36 : 28,
              height: found.includes(h.id) ? 36 : 28,
              background: found.includes(h.id) ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.0)",
              border: found.includes(h.id) ? "2px solid #22c55e" : "2px dashed rgba(239,68,68,0.4)",
              animation: found.includes(h.id) ? "none" : "pulse 2s infinite",
            }}
          />
        ))}
      </div>

      <div className="text-[13px] text-slate-400 mb-2.5">
        発見: {found.length} / {hints.length}
      </div>

      <div className="flex flex-col gap-1.5">
        {hints.map((h) => (
          <div
            key={h.id}
            className={`py-2 px-3 rounded-lg text-xs ${
              found.includes(h.id)
                ? "bg-green-500/[.08] border border-green-500/20 text-green-300"
                : "bg-white/[.03] border border-white/[.06] text-slate-600"
            }`}
          >
            {found.includes(h.id) ? `✅ ${h.label} — ${h.detail}` : "❓ ???"}
          </div>
        ))}
      </div>

      {found.length === 3 && (
        <div className="mt-3.5 p-3 bg-amber-400/10 rounded-[10px] border border-amber-400/20">
          <p className="text-amber-400 text-[13px] font-bold m-0 text-center">
            🎯 全て発見！覗き見防止フィルター＋画面ロック＋社員証は裏返して！
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: `src/components/demo/password-demo.tsx` を作成**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { PASSWORDS } from "@/data/passwords";

export default function PasswordDemo() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cracking, setCracking] = useState(false);
  const [crackProgress, setCrackProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCrack = (idx: number) => {
    setSelectedIdx(idx);
    setCracking(true);
    setCrackProgress(0);
    const pw = PASSWORDS[idx];
    const duration = Math.min(pw.strength * 30, 2500);
    const steps = 40;
    let step = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      step++;
      setCrackProgress(step / steps);
      if (step >= steps) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCracking(false);
      }
    }, duration / steps);
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "#ef4444";
    if (strength < 60) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        パスワードを選んで「クラッキング開始」をクリック。<br />
        弱いパスワードがいかに速く突破されるか体感しよう。
      </p>

      <div className="flex flex-col gap-2">
        {PASSWORDS.map((pw, i) => (
          <button
            key={i}
            onClick={() => startCrack(i)}
            disabled={cracking}
            className="flex items-center justify-between py-2.5 px-3.5 rounded-lg font-mono text-[13px] text-slate-200 transition-all border cursor-pointer disabled:cursor-wait"
            style={{
              background: selectedIdx === i ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
              borderColor: selectedIdx === i ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)",
            }}
          >
            <span>{pw.value}</span>
            {selectedIdx === i && !cracking && (
              <span className="text-red-500 text-xs font-sans">
                ⚡ {pw.time}で突破！
              </span>
            )}
            {selectedIdx === i && cracking && (
              <span className="text-amber-400 text-xs font-sans">
                解析中... {Math.round(crackProgress * 100)}%
              </span>
            )}
          </button>
        ))}
      </div>

      {selectedIdx !== null && !cracking && (
        <div className="mt-4 p-3.5 bg-red-500/[.08] rounded-[10px] border border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <span className="text-amber-400 font-bold text-sm">パスワの分析</span>
          </div>
          <p className="text-slate-300 text-[13px] leading-relaxed m-0">
            「{PASSWORDS[selectedIdx].value}」は{PASSWORDS[selectedIdx].time}で突破されました。
            <br />
            <span className="text-slate-400">{PASSWORDS[selectedIdx].label}</span>
          </p>
          <div className="mt-2.5">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>脆弱</span><span>強固</span>
            </div>
            <div className="h-1.5 bg-white/[.08] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-[600ms] ease-out"
                style={{
                  width: `${PASSWORDS[selectedIdx].strength}%`,
                  background: getStrengthColor(PASSWORDS[selectedIdx].strength),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 3: `src/components/demo/ransomware-demo.tsx` を作成**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";

function PixelGrid({ progress }: { progress: number }) {
  const cells = Array.from({ length: 64 }, (_, i) => {
    const isEncrypted = i < Math.floor(progress * 64);
    return (
      <div
        key={i}
        className="w-4 h-4 rounded-sm transition-colors"
        style={{
          backgroundColor: isEncrypted ? "#dc2626" : "#22c55e",
          transitionDelay: `${i * 15}ms`,
          opacity: 0.6 + Math.random() * 0.4,
        }}
      />
    );
  });

  return (
    <div className="grid grid-cols-8 gap-[3px]">
      {cells}
    </div>
  );
}

type Phase = "ready" | "encrypting" | "ransom" | "restoring" | "restored";

export default function RansomwareDemo() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAttack = () => {
    setPhase("encrypting");
    setProgress(0);
    let p = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p += 0.02;
      setProgress(Math.min(p, 1));
      if (p >= 1) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("ransom");
      }
    }, 60);
  };

  const restore = () => {
    setPhase("restoring");
    setProgress(1);
    let p = 1;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      p -= 0.03;
      setProgress(Math.max(p, 0));
      if (p <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPhase("restored");
      }
    }, 50);
  };

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p className="text-slate-400 text-[13px] mb-4 leading-relaxed">
        ランサムウェアがサーバーのファイルを暗号化する様子を体験。<br />
        🟢緑=安全 → 🔴赤=暗号化済み
      </p>

      <div className="flex justify-center mb-5">
        <PixelGrid progress={progress} />
      </div>

      <div className="flex items-center gap-2.5 mb-4 justify-center">
        <span className="text-xl">🥷</span>
        <span className="text-slate-400 text-xs">
          クリプトの暗号化能力が{phase === "encrypting" || phase === "ransom" ? "悪用" : "正常稼働"}中
        </span>
      </div>

      {phase === "ready" && (
        <button
          onClick={startAttack}
          className="w-full py-3 bg-gradient-to-br from-red-600 to-red-800 border-none rounded-[10px] text-white font-bold text-sm cursor-pointer tracking-wider"
        >
          💀 ランサムウェアを実行する
        </button>
      )}

      {phase === "encrypting" && (
        <div className="text-center text-red-500 text-sm font-semibold">
          暗号化中... {Math.round(progress * 100)}%
        </div>
      )}

      {phase === "ransom" && (
        <div className="p-4 bg-red-600/[.12] rounded-[10px] border border-red-600/30 text-center">
          <p className="text-red-300 text-lg font-extrabold m-0 mb-1.5">
            ⚠️ YOUR FILES HAVE BEEN ENCRYPTED
          </p>
          <p className="text-slate-400 text-xs m-0 mb-3.5">
            身代金 5 BTC を支払えばファイルを復号します
          </p>
          <button
            onClick={restore}
            className="py-2.5 px-6 bg-gradient-to-br from-green-500 to-green-700 border-none rounded-lg text-white font-bold text-[13px] cursor-pointer"
          >
            🛟 バックアップから復旧を頼む
          </button>
        </div>
      )}

      {phase === "restoring" && (
        <div className="text-center text-green-500 text-sm font-semibold">
          🛟 バックアップから復旧中... {Math.round((1 - progress) * 100)}%
        </div>
      )}

      {phase === "restored" && (
        <div className="p-3.5 bg-green-500/10 rounded-[10px] border border-green-500/25">
          <p className="text-green-300 text-sm font-bold m-0 mb-1.5 text-center">
            ✅ 復旧完了！
          </p>
          <p className="text-slate-400 text-xs m-0 text-center leading-relaxed">
            バックアップのおかげで身代金を払わずに済みました。<br />
            <strong className="text-amber-400">学び：定期バックアップは最後の砦</strong>
          </p>
        </div>
      )}
    </div>
  );
}
```

**Step 4: `src/app/demo/page.tsx` を作成**

```tsx
"use client";

import { useState } from "react";
import ShoulderHackDemo from "@/components/demo/shoulder-hack-demo";
import PasswordDemo from "@/components/demo/password-demo";
import RansomwareDemo from "@/components/demo/ransomware-demo";

const demos = [
  { id: "shoulder", label: "👁️ 覗き見", color: "#f59e0b" },
  { id: "password", label: "🔓 パスワード", color: "#ef4444" },
  { id: "ransom", label: "💀 ランサム", color: "#dc2626" },
] as const;

type DemoId = typeof demos[number]["id"];

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState<DemoId | null>(null);

  return (
    <div>
      <div className="flex gap-1.5 mb-[18px]">
        {demos.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDemo(d.id)}
            className="flex-1 py-2.5 px-1.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all border"
            style={{
              background: activeDemo === d.id ? `${d.color}15` : "rgba(255,255,255,0.02)",
              borderColor: activeDemo === d.id ? `${d.color}35` : "rgba(255,255,255,0.06)",
              color: activeDemo === d.id ? d.color : "#64748b",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {!activeDemo && (
        <div className="text-center py-10 px-5 text-slate-600">
          <div className="text-4xl mb-3">🎮</div>
          <div className="text-sm font-semibold">上のタブから体験デモを選択</div>
          <div className="text-xs mt-1.5">インタラクティブに攻撃を体験できます</div>
        </div>
      )}

      {activeDemo && (
        <div className="p-4 bg-white/[.02] rounded-[14px] border border-white/[.06]">
          <div className="text-[15px] font-extrabold mb-1" style={{
            color: demos.find(d => d.id === activeDemo)?.color
          }}>
            {activeDemo === "shoulder" && "👁️ ショルダーハッキング体験"}
            {activeDemo === "password" && "🔓 パスワードクラッキング体験"}
            {activeDemo === "ransom" && "💀 ランサムウェア体験"}
          </div>
          {activeDemo === "shoulder" && <ShoulderHackDemo />}
          {activeDemo === "password" && <PasswordDemo />}
          {activeDemo === "ransom" && <RansomwareDemo />}
        </div>
      )}
    </div>
  );
}
```

**Step 5: 動作確認**

```bash
npm run dev
```

`/demo` ページで3つのデモが全て動作することを確認。

**Step 6: コミット**

```bash
git add src/app/demo/ src/components/demo/
git commit -m "feat: add demo pages with shoulder hack, password crack, and ransomware demos"
```

---

## Task 7: バックエンドAPI (Route Handlers) の移植

**Files:**
- Create: `src/lib/ai-service.ts`, `src/lib/game-session.ts`, `src/app/api/game/start/route.ts`, `src/app/api/game/[sessionId]/state/route.ts`, `src/app/api/game/phase1/collect/route.ts`, `src/app/api/game/phase1/phishing/route.ts`, `src/app/api/game/phase2/attempt/route.ts`, `src/app/api/game/phase3/action/route.ts`, `src/app/api/game/phase4/action/route.ts`, `src/app/api/game/[sessionId]/report/route.ts`

**Step 1: `src/lib/ai-service.ts` を作成**

```typescript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface CharacterReactionResult {
  message: string;
  emoji: string;
  type: string;
}

interface PhishingEvalResult {
  score: number;
  feedback: string;
  isSuccess: boolean;
  victimReaction: string;
}

interface PasswordHintResult {
  hint: string;
  closeness: number;
}

interface DefenderReactionResult {
  message: string;
  action: string;
  detectionIncrease: number;
}

interface FinalReportResult {
  rank: "S" | "A" | "B" | "C" | "D";
  summary: string;
  phaseFeedback: { phase: number; title: string; score: number; feedback: string }[];
  keyLearning: string[];
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "";
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function getCharacterReaction(character: string, action: string): Promise<CharacterReactionResult> {
  const reactions: Record<string, CharacterReactionResult> = {
    mamoru: { message: "不審な通信を検知しました。アクセスログを確認します。", emoji: "🛡️", type: "alert" },
    passuwa: { message: "うぐぐ…そのパスワードは…強力すぎる…！", emoji: "🔑", type: "panicked" },
    mailer: { message: "わあ！素敵なメールが届いたよ！開いちゃおうかな？", emoji: "📧", type: "excited" },
  };
  return reactions[character] ?? { message: "...", emoji: "😐", type: "normal" };
}

export async function evaluatePhishing(subject: string, body: string, sender: string): Promise<PhishingEvalResult> {
  try {
    const response = await callGemini(
      `あなたはサイバーセキュリティの専門家です。以下のフィッシングメールを評価してください。
ターゲット: 田中太郎（経理部、サイバーコーポレーション）
件名: ${subject}
本文: ${body}
送信者: ${sender}
JSON形式で返してください: {"score": 0-100, "feedback": "フィードバック", "isSuccess": true/false, "victimReaction": "被害者の反応"}`
    );
    if (response) {
      const json = JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
      return json;
    }
  } catch {
    // fallback to mock
  }

  let score = 0;
  let feedback = "";
  if (subject.includes("緊急") || subject.includes("重要")) { score += 30; feedback += "緊急性を煽る件名は効果的です。 "; }
  if (body.includes("リンク") || body.includes("http")) { score += 40; feedback += "リンクへの誘導が自然です。 "; }
  return {
    score: Math.min(score, 100),
    feedback: feedback || "もう少し騙す要素を入れましょう。",
    isSuccess: score > 60,
    victimReaction: score > 60 ? "メーラがリンクをクリックしてしまいました..." : "メーラは怪しんでメールを閉じました。",
  };
}

export async function generatePasswordHint(attempts: string[], correctPasswords: string[], clues: string[]): Promise<PasswordHintResult> {
  try {
    const response = await callGemini(
      `あなたはパスワードのヒントを出すAIです。正解は教えないでください。
過去の試行: ${attempts.join(", ")}
収集済みの手がかり: ${clues.join(", ")}
ヒントを1つ、JSON形式で: {"hint": "ヒント文", "closeness": 0-100}`
    );
    if (response) {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
    }
  } catch {
    // fallback
  }
  return { hint: "ペットの名前と数字の組み合わせを試してみては？", closeness: 30 };
}

export async function getDefenderReaction(defender: string, action: string, detectionLevel: number): Promise<DefenderReactionResult> {
  if (detectionLevel < 30) {
    return { message: "...異常なし。", action: "none", detectionIncrease: 5 };
  } else if (detectionLevel < 60) {
    return { message: "何か怪しい動きを感知しました。監視を強化します。", action: "alert", detectionIncrease: 10 };
  }
  return { message: "侵入者を検知！セキュリティチームに通報します！", action: "lockdown", detectionIncrease: 20 };
}

export async function generateFinalReport(
  actionLog: { phase: number; action: string; detail: string }[],
  stealth: number,
  phaseResults: Record<string, unknown>,
): Promise<FinalReportResult> {
  try {
    const response = await callGemini(
      `あなたはサイバーセキュリティ教育の専門家です。以下のゲームプレイを分析してレポートを作成してください。
ステルス度: ${stealth}
アクションログ: ${JSON.stringify(actionLog)}
フェーズ結果: ${JSON.stringify(phaseResults)}
JSON形式で: {"rank": "S/A/B/C/D", "summary": "要約", "phaseFeedback": [{"phase": 1, "title": "偵察", "score": 0-100, "feedback": "..."}], "keyLearning": ["学び1", "学び2"]}`
    );
    if (response) {
      return JSON.parse(response.replace(/```json\n?|\n?```/g, ""));
    }
  } catch {
    // fallback
  }

  const rank = stealth > 70 ? "A" : stealth > 40 ? "B" : "C";
  return {
    rank: rank as "A" | "B" | "C",
    summary: `ステルス度${stealth}%で攻撃を完了しました。`,
    phaseFeedback: [
      { phase: 1, title: "偵察 & フィッシング", score: 70, feedback: "情報収集は適切でした。" },
      { phase: 2, title: "パスワード突破", score: 60, feedback: "推測力が試されました。" },
      { phase: 3, title: "ネットワーク侵入", score: 65, feedback: "慎重な動きが求められます。" },
      { phase: 4, title: "ランサムウェア展開", score: 55, feedback: "バックアップの脅威を理解しましょう。" },
    ],
    keyLearning: [
      "SNSの個人情報は攻撃に悪用される",
      "強固なパスワードは最初の防御線",
      "ネットワーク監視は侵入検知に重要",
      "定期バックアップがランサムウェアの最大の対策",
    ],
  };
}
```

**Step 2: `src/lib/game-session.ts` を作成**

```typescript
import { v4 as uuidv4 } from "uuid";
import { GameSession, Clue, ActionLogEntry } from "@/lib/types";

const sessions = new Map<string, GameSession>();

export function createSession(): GameSession {
  const session: GameSession = {
    id: uuidv4(),
    currentPhase: 1,
    stealth: 100,
    collectedClues: [],
    discoveredNodes: ["pc_tanaka", "file_server", "mail_server", "firewall"],
    compromisedNodes: [],
    hasAdmin: false,
    backupDisabled: false,
    passwordAttempts: 0,
    detectionLevel: 0,
    actionLog: [],
    phaseResults: {},
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): GameSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<GameSession>): GameSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

export function addClue(sessionId: string, clue: Clue): GameSession | undefined {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  if (!session.collectedClues.find((c) => c.id === clue.id)) {
    session.collectedClues.push(clue);
  }
  sessions.set(sessionId, session);
  return session;
}

export function addActionLog(sessionId: string, entry: Omit<ActionLogEntry, "timestamp" | "stealth">): void {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.actionLog.push({
    ...entry,
    timestamp: Date.now(),
    stealth: session.stealth,
  });
  sessions.set(sessionId, session);
}

export function decreaseStealth(sessionId: string, amount: number): number {
  const session = sessions.get(sessionId);
  if (!session) return 0;
  session.stealth = Math.max(0, session.stealth - amount);
  sessions.set(sessionId, session);
  return session.stealth;
}
```

**Step 3: `src/app/api/game/start/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { createSession } from "@/lib/game-session";
import { TARGET_PROFILE } from "@/lib/scenarios";

export async function POST() {
  const session = createSession();
  return NextResponse.json({
    sessionId: session.id,
    phase: session.currentPhase,
    stealth: session.stealth,
    targetProfile: TARGET_PROFILE,
  });
}
```

**Step 4: `src/app/api/game/[sessionId]/state/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/game-session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}
```

**Step 5: `src/app/api/game/phase1/collect/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession, addClue, addActionLog, decreaseStealth } from "@/lib/game-session";
import { TARGET_PROFILE } from "@/lib/scenarios";
import { CollectClueRequest } from "@/lib/types";

const CLUE_MAP: Record<string, { type: string; description: string }> = {
  post1: { type: "pet_name", description: "ペットの名前: ポチ" },
  post2: { type: "birth_year", description: "生年: 1985年" },
  post3: { type: "email_domain", description: "メールドメイン: mail.cyberco.jp" },
  post4: { type: "password_habit", description: "覚えやすいパスワードを好む" },
  post5: { type: "boss_name", description: "上司: 鈴木部長" },
};

export async function POST(request: Request) {
  const body: CollectClueRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const post = TARGET_PROFILE.snsPosts.find((p) => p.id === body.postId);
  if (!post || !post.hasClue) {
    return NextResponse.json({ success: false, clueType: "", clueDescription: "手がかりは見つかりませんでした", totalClues: session.collectedClues.length });
  }

  const clueInfo = CLUE_MAP[body.postId];
  if (!clueInfo) {
    return NextResponse.json({ success: false, clueType: "", clueDescription: "手がかりは見つかりませんでした", totalClues: session.collectedClues.length });
  }

  addClue(body.sessionId, { id: body.postId, ...clueInfo });
  addActionLog(body.sessionId, { phase: 1, action: "collect", detail: clueInfo.description });

  const updated = getSession(body.sessionId)!;
  return NextResponse.json({
    success: true,
    clueType: clueInfo.type,
    clueDescription: clueInfo.description,
    totalClues: updated.collectedClues.length,
  });
}
```

**Step 6: `src/app/api/game/phase1/phishing/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { evaluatePhishing } from "@/lib/ai-service";
import { PhishingEmailRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: PhishingEmailRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const result = await evaluatePhishing(body.subject, body.body, body.sender);

  addActionLog(body.sessionId, { phase: 1, action: "phishing", detail: `Score: ${result.score}` });

  if (result.isSuccess) {
    updateSession(body.sessionId, { currentPhase: 2, phaseResults: { ...session.phaseResults, 1: { completed: true, score: result.score, details: {} } } });
  } else {
    decreaseStealth(body.sessionId, 10);
  }

  const updated = getSession(body.sessionId)!;
  return NextResponse.json({
    score: result.score,
    feedback: result.feedback,
    isSuccess: result.isSuccess,
    victimReaction: result.victimReaction,
    stealth: updated.stealth,
  });
}
```

**Step 7: `src/app/api/game/phase2/attempt/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { generatePasswordHint } from "@/lib/ai-service";
import { CORRECT_PASSWORDS } from "@/lib/scenarios";
import { PasswordAttemptRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: PasswordAttemptRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const maxAttempts = 5;
  const attempts = session.passwordAttempts + 1;
  updateSession(body.sessionId, { passwordAttempts: attempts });

  const isCorrect = CORRECT_PASSWORDS.includes(body.password);

  addActionLog(body.sessionId, { phase: 2, action: "password_attempt", detail: `Attempt: ${body.password}, Correct: ${isCorrect}` });

  if (isCorrect) {
    updateSession(body.sessionId, { currentPhase: 3, phaseResults: { ...session.phaseResults, 2: { completed: true, score: Math.max(100 - (attempts - 1) * 20, 20), details: {} } } });
    return NextResponse.json({
      success: true,
      message: "パスワード突破成功！システムにアクセスしました。",
      attemptsRemaining: maxAttempts - attempts,
      stealth: session.stealth,
      lockedOut: false,
    });
  }

  decreaseStealth(body.sessionId, 5);
  const updated = getSession(body.sessionId)!;

  if (attempts >= maxAttempts) {
    return NextResponse.json({
      success: false,
      message: "アカウントがロックされました。",
      attemptsRemaining: 0,
      stealth: updated.stealth,
      lockedOut: true,
    });
  }

  const clueDescriptions = session.collectedClues.map((c) => c.description);
  const hint = await generatePasswordHint([body.password], CORRECT_PASSWORDS, clueDescriptions);

  return NextResponse.json({
    success: false,
    message: "パスワードが違います。",
    attemptsRemaining: maxAttempts - attempts,
    stealth: updated.stealth,
    hint: hint.hint,
    lockedOut: false,
  });
}
```

**Step 8: `src/app/api/game/phase3/action/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { getDefenderReaction } from "@/lib/ai-service";
import { NETWORK_NODES } from "@/lib/scenarios";
import { NetworkActionRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: NetworkActionRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  addActionLog(body.sessionId, { phase: 3, action: body.action, detail: `Node: ${body.nodeId}` });

  const node = NETWORK_NODES[body.nodeId as keyof typeof NETWORK_NODES];
  if (!node) {
    return NextResponse.json({ success: false, message: "ノードが見つかりません", discoveredNodes: [], filesFound: [], stealth: session.stealth });
  }

  if (node.hidden && !session.discoveredNodes.includes(body.nodeId)) {
    return NextResponse.json({ success: false, message: "まだ発見されていないノードです", discoveredNodes: [], filesFound: [], stealth: session.stealth });
  }

  let newDiscovered: string[] = [];
  let filesFound: string[] = [];

  if (body.action === "scan") {
    decreaseStealth(body.sessionId, 3);
    if (body.nodeId === "pc_tanaka" && !session.discoveredNodes.includes("admin_pc")) {
      newDiscovered = ["admin_pc"];
      const updated = getSession(body.sessionId)!;
      updateSession(body.sessionId, { discoveredNodes: [...updated.discoveredNodes, "admin_pc"] });
    }
  } else if (body.action === "access") {
    decreaseStealth(body.sessionId, 5);
    filesFound = node.files;
    if (body.nodeId === "admin_pc" && !session.discoveredNodes.includes("backup_server")) {
      newDiscovered = ["backup_server"];
      const updated = getSession(body.sessionId)!;
      updateSession(body.sessionId, { discoveredNodes: [...updated.discoveredNodes, "backup_server"], hasAdmin: true });
    }
  } else if (body.action === "exploit") {
    decreaseStealth(body.sessionId, 10);
    if (!session.compromisedNodes.includes(body.nodeId)) {
      const updated = getSession(body.sessionId)!;
      updateSession(body.sessionId, { compromisedNodes: [...updated.compromisedNodes, body.nodeId] });
    }
    if (session.compromisedNodes.length >= 3) {
      updateSession(body.sessionId, { currentPhase: 4, phaseResults: { ...session.phaseResults, 3: { completed: true, score: 70, details: {} } } });
    }
  }

  const defenderReaction = await getDefenderReaction("mamoru", body.action, session.detectionLevel);
  const finalSession = getSession(body.sessionId)!;

  return NextResponse.json({
    success: true,
    message: `${body.action}を実行しました`,
    discoveredNodes: newDiscovered,
    filesFound,
    stealth: finalSession.stealth,
    defenderReaction: defenderReaction.message,
  });
}
```

**Step 9: `src/app/api/game/phase4/action/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession, updateSession, addActionLog, decreaseStealth } from "@/lib/game-session";
import { getDefenderReaction } from "@/lib/ai-service";
import { RansomwareActionRequest } from "@/lib/types";

export async function POST(request: Request) {
  const body: RansomwareActionRequest = await request.json();
  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  addActionLog(body.sessionId, { phase: 4, action: body.action, detail: JSON.stringify(body.targetNodes ?? []) });

  if (body.action === "encrypt") {
    const stealthCost = body.speed === "fast" ? 15 : 5;
    decreaseStealth(body.sessionId, stealthCost);

    const targetNodes = body.targetNodes ?? [];
    const updated = getSession(body.sessionId)!;
    const newEncrypted = [...new Set([...updated.compromisedNodes, ...targetNodes])];
    updateSession(body.sessionId, { compromisedNodes: newEncrypted });

    const defenderReaction = await getDefenderReaction("backup", body.action, session.detectionLevel);

    return NextResponse.json({
      success: true,
      message: `${targetNodes.length}ノードを暗号化しました`,
      encryptedNodes: newEncrypted,
      stealth: getSession(body.sessionId)!.stealth,
      defenderReaction: defenderReaction.message,
      backupStatus: session.backupDisabled ? "disabled" : "active",
    });
  }

  if (body.action === "ransom") {
    updateSession(body.sessionId, {
      phaseResults: { ...session.phaseResults, 4: { completed: true, score: session.stealth, details: {} } },
    });

    return NextResponse.json({
      success: true,
      message: "ランサムウェア展開完了。ゲーム終了です。",
      encryptedNodes: session.compromisedNodes,
      stealth: session.stealth,
      defenderReaction: "",
      backupStatus: session.backupDisabled ? "disabled" : "active",
    });
  }

  return NextResponse.json({ success: false, message: "不明なアクション", encryptedNodes: [], stealth: session.stealth, defenderReaction: "", backupStatus: "active" });
}
```

**Step 10: `src/app/api/game/[sessionId]/report/route.ts` を作成**

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/lib/game-session";
import { generateFinalReport } from "@/lib/ai-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const report = await generateFinalReport(
    session.actionLog,
    session.stealth,
    session.phaseResults,
  );

  return NextResponse.json({ ...report, stealth: session.stealth });
}
```

**Step 11: 動作確認**

```bash
npm run dev
```

`curl -X POST http://localhost:3000/api/game/start` でセッションが作成されることを確認。

**Step 12: コミット**

```bash
git add src/lib/ai-service.ts src/lib/game-session.ts src/app/api/
git commit -m "feat: add game API route handlers with AI service and session management"
```

---

## Task 8: ゲーム画面の作成 (Game Container + Phase Components)

**Files:**
- Create: `src/app/game/page.tsx`, `src/app/game/[sessionId]/page.tsx`, `src/app/game/[sessionId]/report/page.tsx`, `src/components/ui/stealth-meter.tsx`, `src/components/ui/phase-transition.tsx`, `src/components/game/game-container.tsx`, `src/components/game/recon-phase.tsx`, `src/components/game/password-phase.tsx`, `src/components/game/network-phase.tsx`, `src/components/game/ransomware-phase.tsx`

**Step 1: `src/components/ui/stealth-meter.tsx` を作成**

```tsx
export default function StealthMeter({ stealth }: { stealth: number }) {
  const color = stealth > 70 ? "#22c55e" : stealth > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-white/[.02] rounded-lg border border-white/[.06]">
      <span className="text-xs text-slate-500 font-semibold">STEALTH</span>
      <div className="flex-1 h-2 bg-white/[.08] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${stealth}%`, background: color }}
        />
      </div>
      <span className="text-sm font-bold" style={{ color }}>{stealth}%</span>
    </div>
  );
}
```

**Step 2: `src/components/ui/phase-transition.tsx` を作成**

```tsx
"use client";

import { useEffect, useState } from "react";

const PHASE_TITLES = {
  1: { title: "Phase 1: 偵察 & フィッシング", icon: "🎣" },
  2: { title: "Phase 2: パスワード突破", icon: "🔓" },
  3: { title: "Phase 3: ネットワーク侵入", icon: "🌐" },
  4: { title: "Phase 4: ランサムウェア展開", icon: "💀" },
};

export default function PhaseTransition({ phase, onComplete }: { phase: 1 | 2 | 3 | 4; onComplete: () => void }) {
  const [visible, setVisible] = useState(true);
  const info = PHASE_TITLES[phase];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="text-center animate-pulse">
        <div className="text-6xl mb-4">{info.icon}</div>
        <div className="text-2xl font-black text-white tracking-wider">{info.title}</div>
      </div>
    </div>
  );
}
```

**Step 3: `src/components/game/recon-phase.tsx` を作成**

```tsx
"use client";

import { useState } from "react";
import type { TargetProfile, Clue } from "@/lib/types";

interface ReconPhaseProps {
  sessionId: string;
  targetProfile: TargetProfile;
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function ReconPhase({ sessionId, targetProfile, onPhaseComplete, onStealthChange }: ReconPhaseProps) {
  const [clues, setClues] = useState<Clue[]>([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sender, setSender] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const collectClue = async (postId: string) => {
    const res = await fetch("/api/game/phase1/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, postId }),
    });
    const data = await res.json();
    if (data.success) {
      setClues((prev) => [...prev, { id: postId, type: data.clueType, description: data.clueDescription }]);
    }
  };

  const sendPhishing = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase1/phishing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, subject, body, sender }),
    });
    const data = await res.json();
    setFeedback(`スコア: ${data.score}/100 — ${data.feedback}\n${data.victimReaction}`);
    onStealthChange(data.stealth);
    if (data.isSuccess) {
      setTimeout(onPhaseComplete, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-cyan-400">🎣 ターゲットのSNSを調査せよ</div>

      {/* SNS Posts */}
      <div className="flex flex-col gap-2">
        {targetProfile.snsPosts.map((post) => {
          const isCollected = clues.some((c) => c.id === post.id);
          return (
            <button
              key={post.id}
              onClick={() => collectClue(post.id)}
              disabled={isCollected}
              className={`p-3 rounded-lg text-left text-xs leading-relaxed border transition-all cursor-pointer disabled:cursor-default ${
                isCollected
                  ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-300"
                  : "bg-white/[.02] border-white/[.06] text-slate-400 hover:border-white/[.12]"
              }`}
            >
              {isCollected && "✅ "}{post.content}
            </button>
          );
        })}
      </div>

      {/* Collected Clues */}
      {clues.length > 0 && (
        <div className="p-3 bg-amber-400/10 rounded-lg border border-amber-400/20">
          <div className="text-xs font-bold text-amber-400 mb-2">収集した手がかり ({clues.length})</div>
          {clues.map((c) => (
            <div key={c.id} className="text-xs text-slate-300">• {c.description}</div>
          ))}
        </div>
      )}

      {/* Phishing Email Form */}
      {clues.length >= 3 && !showEmailForm && (
        <button
          onClick={() => setShowEmailForm(true)}
          className="py-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-bold cursor-pointer"
        >
          📧 フィッシングメールを作成する
        </button>
      )}

      {showEmailForm && (
        <div className="flex flex-col gap-3 p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
          <div className="text-sm font-bold text-purple-400">📧 フィッシングメール作成</div>
          <input
            placeholder="送信者名 (例: IT部門)"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40"
          />
          <input
            placeholder="件名"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40"
          />
          <textarea
            placeholder="本文"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="px-3 py-2 bg-white/[.04] border border-white/[.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-purple-500/40 resize-none"
          />
          <button
            onClick={sendPhishing}
            disabled={loading || !subject || !body}
            className="py-2.5 bg-gradient-to-br from-red-500 to-red-700 border-none rounded-lg text-white text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "評価中..." : "🎯 メール送信"}
          </button>
          {feedback && (
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-slate-300 whitespace-pre-line">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 4: `src/components/game/password-phase.tsx` を作成**

```tsx
"use client";

import { useState } from "react";
import type { Clue } from "@/lib/types";

interface PasswordPhaseProps {
  sessionId: string;
  clues: Clue[];
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function PasswordPhase({ sessionId, clues, onPhaseComplete, onStealthChange }: PasswordPhaseProps) {
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);

  const attemptPassword = async () => {
    if (!password.trim() || lockedOut) return;
    setLoading(true);
    const res = await fetch("/api/game/phase2/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, password }),
    });
    const data = await res.json();
    setAttempts((prev) => [...prev, password]);
    setMessage(data.message);
    setHint(data.hint ?? null);
    onStealthChange(data.stealth);
    setPassword("");

    if (data.success) {
      setTimeout(onPhaseComplete, 2000);
    }
    if (data.lockedOut) {
      setLockedOut(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-amber-400">🔓 パスワードを推測せよ</div>

      {/* Clues reminder */}
      <div className="p-3 bg-white/[.02] rounded-lg border border-white/[.06]">
        <div className="text-xs font-semibold text-slate-500 mb-1">手がかり:</div>
        {clues.map((c) => (
          <div key={c.id} className="text-xs text-slate-400">• {c.description}</div>
        ))}
      </div>

      {/* Terminal-style input */}
      <div className="p-4 bg-black/50 rounded-xl border border-green-500/20 font-mono">
        <div className="text-xs text-green-500/60 mb-2">CyberCo Login System v2.1</div>
        <div className="text-xs text-green-400 mb-3">User: tanaka.taro@cyberco.jp</div>

        {attempts.map((a, i) => (
          <div key={i} className="text-xs mb-1">
            <span className="text-green-500">Password: </span>
            <span className="text-red-400">{"*".repeat(a.length)} ✗</span>
          </div>
        ))}

        {!lockedOut && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-green-500">Password:</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptPassword()}
              className="flex-1 bg-transparent border-none outline-none text-xs text-green-400 font-mono"
              placeholder="パスワードを入力..."
              disabled={loading}
            />
          </div>
        )}

        <div className="text-xs text-slate-600 mt-2">
          残り試行回数: {5 - attempts.length}
        </div>
      </div>

      <button
        onClick={attemptPassword}
        disabled={loading || lockedOut || !password.trim()}
        className="py-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg text-amber-300 text-sm font-bold cursor-pointer disabled:opacity-50"
      >
        {loading ? "認証中..." : "⏎ ログイン試行"}
      </button>

      {message && (
        <div className={`p-3 rounded-lg border text-xs ${
          message.includes("成功") ? "bg-green-500/10 border-green-500/20 text-green-300" : "bg-red-500/10 border-red-500/20 text-red-300"
        }`}>
          {message}
        </div>
      )}

      {hint && (
        <div className="p-3 bg-cyan-400/10 rounded-lg border border-cyan-400/20 text-xs text-cyan-300">
          💡 ヒント: {hint}
        </div>
      )}
    </div>
  );
}
```

**Step 5: `src/components/game/network-phase.tsx` を作成**

```tsx
"use client";

import { useState } from "react";

interface NetworkPhaseProps {
  sessionId: string;
  onPhaseComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

interface NodeInfo {
  name: string;
  compromised: boolean;
  files: string[];
}

export default function NetworkPhase({ sessionId, onPhaseComplete, onStealthChange }: NetworkPhaseProps) {
  const [nodes, setNodes] = useState<Record<string, NodeInfo>>({
    pc_tanaka: { name: "田中のPC", compromised: false, files: [] },
    file_server: { name: "ファイルサーバー", compromised: false, files: [] },
    mail_server: { name: "メールサーバー", compromised: false, files: [] },
    firewall: { name: "マモル (FW)", compromised: false, files: [] },
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [defenderMsg, setDefenderMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const performAction = async (action: "scan" | "access" | "exploit") => {
    if (!selectedNode) return;
    setLoading(true);
    const res = await fetch("/api/game/phase3/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action, nodeId: selectedNode }),
    });
    const data = await res.json();
    setMessage(data.message);
    setDefenderMsg(data.defenderReaction);
    onStealthChange(data.stealth);

    if (data.discoveredNodes?.length > 0) {
      setNodes((prev) => {
        const updated = { ...prev };
        for (const nodeId of data.discoveredNodes) {
          if (!updated[nodeId]) {
            updated[nodeId] = { name: nodeId === "admin_pc" ? "管理者端末" : "バックアップサーバー", compromised: false, files: [] };
          }
        }
        return updated;
      });
    }

    if (data.filesFound?.length > 0) {
      setNodes((prev) => ({
        ...prev,
        [selectedNode]: { ...prev[selectedNode], files: data.filesFound },
      }));
    }

    if (action === "exploit") {
      setNodes((prev) => ({
        ...prev,
        [selectedNode]: { ...prev[selectedNode], compromised: true },
      }));
      const compromisedCount = Object.values(nodes).filter((n) => n.compromised).length + 1;
      if (compromisedCount >= 3) {
        setTimeout(onPhaseComplete, 2000);
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-blue-400">🌐 ネットワークを探索せよ</div>

      {/* Network Map */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(nodes).map(([id, node]) => (
          <button
            key={id}
            onClick={() => setSelectedNode(id)}
            className={`p-3 rounded-lg text-left text-xs border transition-all cursor-pointer ${
              selectedNode === id
                ? "bg-blue-500/15 border-blue-500/30"
                : node.compromised
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-white/[.02] border-white/[.06]"
            }`}
          >
            <div className="font-bold text-slate-300">
              {node.compromised ? "💀" : "🖥️"} {node.name}
            </div>
            {node.files.length > 0 && (
              <div className="text-slate-500 mt-1">
                {node.files.map((f) => <div key={f}>📄 {f}</div>)}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Actions */}
      {selectedNode && (
        <div className="flex gap-2">
          <button onClick={() => performAction("scan")} disabled={loading} className="flex-1 py-2 bg-cyan-400/10 border border-cyan-400/20 rounded-lg text-cyan-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            🔍 スキャン
          </button>
          <button onClick={() => performAction("access")} disabled={loading} className="flex-1 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            📂 アクセス
          </button>
          <button onClick={() => performAction("exploit")} disabled={loading} className="flex-1 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold cursor-pointer disabled:opacity-50">
            ⚡ 攻撃
          </button>
        </div>
      )}

      {message && <div className="p-2 bg-white/[.03] rounded-lg text-xs text-slate-400">{message}</div>}
      {defenderMsg && (
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
          🛡️ マモル: {defenderMsg}
        </div>
      )}
    </div>
  );
}
```

**Step 6: `src/components/game/ransomware-phase.tsx` を作成**

```tsx
"use client";

import { useState } from "react";

interface RansomwarePhaseProps {
  sessionId: string;
  onGameComplete: () => void;
  onStealthChange: (stealth: number) => void;
}

export default function RansomwarePhase({ sessionId, onGameComplete, onStealthChange }: RansomwarePhaseProps) {
  const [targets, setTargets] = useState<string[]>([]);
  const [speed, setSpeed] = useState<"fast" | "stealth">("stealth");
  const [encrypted, setEncrypted] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [defenderMsg, setDefenderMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const allNodes = ["pc_tanaka", "file_server", "mail_server", "admin_pc", "backup_server"];

  const toggleTarget = (nodeId: string) => {
    setTargets((prev) => prev.includes(nodeId) ? prev.filter((n) => n !== nodeId) : [...prev, nodeId]);
  };

  const encrypt = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase4/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "encrypt", targetNodes: targets, speed }),
    });
    const data = await res.json();
    setEncrypted(data.encryptedNodes);
    setMessage(data.message);
    setDefenderMsg(data.defenderReaction);
    onStealthChange(data.stealth);
    setTargets([]);
    setLoading(false);
  };

  const deployRansom = async () => {
    setLoading(true);
    const res = await fetch("/api/game/phase4/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "ransom" }),
    });
    const data = await res.json();
    setMessage(data.message);
    setGameEnded(true);
    setLoading(false);
    setTimeout(onGameComplete, 2000);
  };

  const nodeNames: Record<string, string> = {
    pc_tanaka: "田中のPC",
    file_server: "ファイルサーバー",
    mail_server: "メールサーバー",
    admin_pc: "管理者端末",
    backup_server: "バックアップサーバー",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-bold text-red-400">💀 ランサムウェアを展開せよ</div>

      {/* Speed selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setSpeed("stealth")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${speed === "stealth" ? "bg-green-500/15 border-green-500/30 text-green-400" : "bg-white/[.02] border-white/[.06] text-slate-500"}`}
        >
          🥷 ステルス
        </button>
        <button
          onClick={() => setSpeed("fast")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer ${speed === "fast" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-white/[.02] border-white/[.06] text-slate-500"}`}
        >
          ⚡ 高速
        </button>
      </div>

      {/* Target selection */}
      <div className="flex flex-col gap-1.5">
        {allNodes.map((nodeId) => {
          const isEncrypted = encrypted.includes(nodeId);
          const isSelected = targets.includes(nodeId);
          return (
            <button
              key={nodeId}
              onClick={() => !isEncrypted && toggleTarget(nodeId)}
              disabled={isEncrypted || gameEnded}
              className={`p-3 rounded-lg text-left text-xs border transition-all cursor-pointer disabled:cursor-default ${
                isEncrypted
                  ? "bg-red-500/15 border-red-500/25 text-red-400"
                  : isSelected
                    ? "bg-amber-400/15 border-amber-400/25 text-amber-300"
                    : "bg-white/[.02] border-white/[.06] text-slate-400"
              }`}
            >
              {isEncrypted ? "🔒" : isSelected ? "🎯" : "🖥️"} {nodeNames[nodeId]}
              {isEncrypted && " — 暗号化済み"}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {!gameEnded && (
        <div className="flex gap-2">
          <button
            onClick={encrypt}
            disabled={loading || targets.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-br from-red-500/20 to-red-700/20 border border-red-500/30 rounded-lg text-red-300 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? "暗号化中..." : "🔐 暗号化実行"}
          </button>
          <button
            onClick={deployRansom}
            disabled={loading || encrypted.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-bold cursor-pointer disabled:opacity-50"
          >
            💰 身代金要求
          </button>
        </div>
      )}

      {message && <div className="p-2 bg-white/[.03] rounded-lg text-xs text-slate-400">{message}</div>}
      {defenderMsg && (
        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
          🛟 バックアップ: {defenderMsg}
        </div>
      )}
    </div>
  );
}
```

**Step 7: `src/components/game/game-container.tsx` を作成**

```tsx
"use client";

import { useState, useCallback } from "react";
import StealthMeter from "@/components/ui/stealth-meter";
import PhaseTransition from "@/components/ui/phase-transition";
import ReconPhase from "@/components/game/recon-phase";
import PasswordPhase from "@/components/game/password-phase";
import NetworkPhase from "@/components/game/network-phase";
import RansomwarePhase from "@/components/game/ransomware-phase";
import type { TargetProfile, Clue } from "@/lib/types";

interface GameContainerProps {
  sessionId: string;
  initialTargetProfile: TargetProfile;
}

export default function GameContainer({ sessionId, initialTargetProfile }: GameContainerProps) {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [stealth, setStealth] = useState(100);
  const [showTransition, setShowTransition] = useState(true);
  const [clues, setClues] = useState<Clue[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const advancePhase = useCallback(() => {
    if (phase < 4) {
      const nextPhase = (phase + 1) as 2 | 3 | 4;
      setPhase(nextPhase);
      setShowTransition(true);
    }
  }, [phase]);

  const refreshState = async () => {
    const res = await fetch(`/api/game/${sessionId}/state`);
    const data = await res.json();
    setStealth(data.stealth);
    setClues(data.collectedClues);
  };

  const handleStealthChange = (newStealth: number) => {
    setStealth(newStealth);
  };

  const handlePhaseComplete = () => {
    refreshState();
    advancePhase();
  };

  const handleGameComplete = () => {
    setGameComplete(true);
  };

  if (gameComplete) {
    return (
      <div className="text-center py-10">
        <div className="text-4xl mb-4">🏁</div>
        <div className="text-xl font-bold text-white mb-2">ゲーム完了！</div>
        <a
          href={`/game/${sessionId}/report`}
          className="inline-block mt-4 py-2.5 px-6 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold no-underline"
        >
          📊 レポートを見る
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showTransition && (
        <PhaseTransition phase={phase} onComplete={() => setShowTransition(false)} />
      )}

      <StealthMeter stealth={stealth} />

      {/* Phase indicator */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((p) => (
          <div
            key={p}
            className={`flex-1 h-1 rounded-full ${p === phase ? "bg-cyan-400" : p < phase ? "bg-green-500" : "bg-white/[.08]"}`}
          />
        ))}
      </div>

      {phase === 1 && (
        <ReconPhase
          sessionId={sessionId}
          targetProfile={initialTargetProfile}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 2 && (
        <PasswordPhase
          sessionId={sessionId}
          clues={clues}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 3 && (
        <NetworkPhase
          sessionId={sessionId}
          onPhaseComplete={handlePhaseComplete}
          onStealthChange={handleStealthChange}
        />
      )}
      {phase === 4 && (
        <RansomwarePhase
          sessionId={sessionId}
          onGameComplete={handleGameComplete}
          onStealthChange={handleStealthChange}
        />
      )}
    </div>
  );
}
```

**Step 8: `src/app/game/page.tsx` を作成**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GameStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    setLoading(true);
    const res = await fetch("/api/game/start", { method: "POST" });
    const data = await res.json();
    router.push(`/game/${data.sessionId}`);
  };

  return (
    <div className="text-center py-10">
      <div className="text-6xl mb-6">👤</div>
      <div className="text-2xl font-black text-white mb-2">
        ランサムウェア攻撃チェーン
      </div>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        あなたは攻撃者「シャドウ」。<br />
        4つのフェーズを通じてサイバー攻撃を体験し、<br />
        防御の重要性を学びましょう。
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {[
          { phase: 1, title: "偵察 & フィッシング", icon: "🎣" },
          { phase: 2, title: "パスワード突破", icon: "🔓" },
          { phase: 3, title: "ネットワーク侵入", icon: "🌐" },
          { phase: 4, title: "ランサムウェア展開", icon: "💀" },
        ].map((p) => (
          <div key={p.phase} className="flex items-center gap-3 p-3 bg-white/[.02] rounded-lg border border-white/[.06] text-left">
            <span className="text-xl">{p.icon}</span>
            <div>
              <div className="text-xs text-slate-500">Phase {p.phase}</div>
              <div className="text-sm font-bold text-slate-300">{p.title}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={startGame}
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-br from-red-500 to-red-700 border-none rounded-xl text-white text-base font-black cursor-pointer tracking-wider disabled:opacity-50"
      >
        {loading ? "準備中..." : "⚔️ ゲーム開始"}
      </button>
    </div>
  );
}
```

**Step 9: `src/app/game/[sessionId]/page.tsx` を作成**

```tsx
import GameContainer from "@/components/game/game-container";
import { TARGET_PROFILE } from "@/lib/scenarios";

interface GamePageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { sessionId } = await params;

  return <GameContainer sessionId={sessionId} initialTargetProfile={TARGET_PROFILE} />;
}
```

**Step 10: `src/app/game/[sessionId]/report/page.tsx` を作成**

```tsx
import type { FinalReport } from "@/lib/types";

interface ReportPageProps {
  params: Promise<{ sessionId: string }>;
}

async function getReport(sessionId: string): Promise<FinalReport & { stealth: number }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/game/${sessionId}/report`, { cache: "no-store" });
  return res.json();
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;
  const report = await getReport(sessionId);

  const rankColors: Record<string, string> = {
    S: "#f59e0b", A: "#22c55e", B: "#3b82f6", C: "#a855f7", D: "#ef4444",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center py-6">
        <div className="text-5xl mb-3" style={{ color: rankColors[report.rank] }}>
          {report.rank}
        </div>
        <div className="text-lg font-bold text-white">攻撃完了レポート</div>
        <div className="text-xs text-slate-500 mt-1">ステルス度: {report.stealth}%</div>
      </div>

      <div className="p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
        <div className="text-sm font-bold text-slate-300 mb-2">概要</div>
        <p className="text-xs text-slate-400 leading-relaxed m-0">{report.summary}</p>
      </div>

      {report.phaseFeedback.map((pf) => (
        <div key={pf.phase} className="p-4 bg-white/[.02] rounded-xl border border-white/[.06]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-slate-300">Phase {pf.phase}: {pf.title}</div>
            <div className="text-xs font-bold text-cyan-400">{pf.score}点</div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed m-0">{pf.feedback}</p>
        </div>
      ))}

      <div className="p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
        <div className="text-sm font-bold text-amber-400 mb-2">学んだこと</div>
        {report.keyLearning.map((learning, i) => (
          <div key={i} className="text-xs text-slate-300 mb-1">• {learning}</div>
        ))}
      </div>

      <a
        href="/"
        className="text-center py-2.5 bg-gradient-to-br from-cyan-400/20 to-indigo-500/20 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-bold no-underline"
      >
        🏠 トップに戻る
      </a>
    </div>
  );
}
```

**Step 11: 動作確認**

```bash
npm run dev
```

`/game` でゲーム開始 → Phase 1-4 を通してプレイ → レポート表示まで確認。

**Step 12: コミット**

```bash
git add src/app/game/ src/components/game/ src/components/ui/
git commit -m "feat: add game pages with 4-phase attack chain game flow"
```

---

## Task 9: 旧ファイルの削除と最終確認

**Files:**
- Delete: `frontend/`, `backend/`

**Step 1: 全ページの動作確認**

```bash
npm run dev
```

- `/` — ステージ選択が表示される
- `/characters` — キャラクター一覧が表示される
- `/demo` — 3つのデモが動作する
- `/game` — ゲーム開始画面が表示される
- `/game/[sessionId]` — 4フェーズが順に進行する
- `/game/[sessionId]/report` — レポートが表示される

**Step 2: ビルド確認**

```bash
npm run build
```

エラーがないことを確認。

**Step 3: 旧ファイルを削除**

```bash
rm -rf frontend/ backend/
```

**Step 4: コミット**

```bash
git add -A
git commit -m "chore: remove old frontend and backend directories after Next.js migration"
```

---

## Task 10: 設計ドキュメントの更新

**Step 1: `docs/plans/2026-02-15-nextjs-rewrite-design.md` にNext.js 16と明記**

設計ドキュメントのNext.js 15 → 16に更新。

**Step 2: コミット**

```bash
git add docs/
git commit -m "docs: update design doc for Next.js 16"
```
