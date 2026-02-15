# 004: Stage 2 — パスワードクラッキング

## 概要

攻撃者として、ターゲットの弱いパスワードを推測・突破する体験を提供する。ターミナル風UIでのパスワード推測シミュレーション。

## 要件ソース

- docs/features.md#Stage 2: パスワードクラッキング
- docs/index.md#各ステージ共通レイアウト
- docs/openapi.yaml#/gemini/generate-scenario, /gemini/evaluate

## 既存実装の活用

| 流用元ブランチ | 内容 | 備考 |
|---------------|------|------|
| `feature/ransomware-chain-game` | `PasswordPhase.jsx` | ターミナル風UI、クラッキングアニメーション、ヒント機能あり。TSX化 + 拡張 |
| `feature/nextjs-rewrite` | `src/data/passwords.ts` | パスワードデモデータ。参考程度 |

## タスク

### ゲームコンポーネント (`src/components/stages/password-cracking/`)

- [ ] `PasswordCrackingGame.tsx`: ゲーム全体の制御
  - ゲーム状態: 'briefing' | 'playing' | 'cracked' | 'failed'
  - Gemini API でターゲット情報 + 正解パスワード取得
  - 試行回数の管理
  - 3つの攻撃モードの切り替え
  - スコア計算と結果画面への遷移

- [ ] `ProfileCard.tsx`: ターゲットのSNSプロフィール表示
  - アバター、名前、職種
  - SNS投稿（誕生日・ペット名・趣味等のヒント情報）
  - カード形式でスクロール可能

- [ ] `TerminalUI.tsx`: ターミナル風入力エリア
  - コマンドプロンプト風のUI（`$` プロンプト、グリーンテキスト、ブリンキングカーソル）
  - テキスト入力でパスワード候補を入力
  - 実行結果表示（「Access Denied」「Access Granted!」等）
  - ログ履歴の表示

- [ ] `AttackModeSelector.tsx`: 攻撃手法選択
  - **手動推測**: テキスト入力フィールド（高得点）
  - **辞書攻撃**: よくあるパスワード一覧からの選択UI（中得点）
  - **総当たり**: 文字種・長さ指定 → かかる時間をシミュレーション表示（低得点だが教育効果大）

- [ ] `CrackingAnimation.tsx`: ハッキング風アニメーション
  - パスワード入力後のクラッキング演出（ランダム文字が高速で切り替わる）
  - 成功時: 緑の「ACCESS GRANTED」表示
  - 失敗時: 赤の「ACCESS DENIED」表示 + 残り試行回数

### Gemini APIプロンプト (`src/lib/prompts/password-cracking.ts`)

- [ ] シナリオ生成プロンプト:
  - ターゲットのSNSプロフィール（名前、職種、誕生日、趣味、ペット名、好きなもの等）を生成
  - プロフィールから推測可能な正解パスワード（複数候補 + 推測理由）を内部保持
  - 辞書攻撃用のパスワードリスト（正解を含む20個程度）を生成

- [ ] 評価プロンプト:
  - 試行回数と使用した攻撃手法から「なぜこのパスワードは弱かったのか」の解説を生成
  - 「強いパスワードの作り方」のアドバイスを生成

### モックデータ

- [ ] `feature/ransomware-chain-game` の `scenarios/ransomware_chain.py` からターゲットプロフィール・パスワードデータを移植
- [ ] フォールバック用ハードコードシナリオ（2〜3パターン）

### ステージページ (`src/app/stage/password-cracking/page.tsx`)

- [ ] 共通レイアウト適用
- [ ] 上半分: ProfileCard、下半分: TerminalUI のレイアウト
- [ ] PasswordCrackingGame コンポーネントの配置

## 受け入れ条件

- Gemini APIでターゲットプロフィールが動的生成されること
- 3つの攻撃モード（手動推測・辞書攻撃・総当たり）が切り替え可能なこと
- ターミナル風UIでパスワード入力・結果表示が動作すること
- 試行回数に応じたスコアリングが正しいこと（1回目: 100pt, 2-3回: 70pt, 4-5回: 40pt, 総当たり: 10pt, 辞書: 20pt）
- クラッキングアニメーションが表示されること
- モックモードで動作すること

## 備考

- `feature/ransomware-chain-game` の PasswordPhase.jsx のUIパターン・ロジックを参考にするが、独立したステージとして動作するよう拡張する
- 総当たり攻撃の時間シミュレーションは、文字種・長さに基づく計算式で算出（実際のクラッキング時間の目安を表示し、教育効果を高める）
