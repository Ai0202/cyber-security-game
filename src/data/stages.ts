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
