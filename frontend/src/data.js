export const CHARACTERS = {
  mamoru: { name: "マモル", role: "ファイアウォール", emoji: "🛡️", color: "#2563eb", desc: "真面目な門番。外部からの侵入を防ぐ" },
  passuwa: { name: "パスワ", role: "パスワード", emoji: "🔑", color: "#d97706", desc: "強さで姿が変わる鍵の番人" },
  crypto: { name: "クリプト", role: "暗号化", emoji: "🥷", color: "#7c3aed", desc: "データを暗号の衣で守る忍者" },
  mailer: { name: "メーラ", role: "メールクライアント", emoji: "📧", color: "#e11d48", desc: "おしゃべりで人を疑わない" },
  shadow: { name: "シャドウ", role: "攻撃者", emoji: "👤", color: "#1e293b", desc: "あなたが操る攻撃者" },
};

export const STAGES = [
  {
    id: 1,
    title: "ショルダーハッキング",
    subtitle: "覗き見で情報を盗め",
    icon: "👁️",
    difficulty: 1,
    mode: "attack",
    color: "#f59e0b",
  },
  {
    id: 2,
    title: "パスワードクラッキング",
    subtitle: "弱いパスワードを突破せよ",
    icon: "🔓",
    difficulty: 2,
    mode: "attack",
    color: "#ef4444",
  },
  {
    id: 3,
    title: "フィッシング攻撃",
    subtitle: "偽メールで騙せ",
    icon: "🎣",
    difficulty: 2,
    mode: "attack",
    color: "#8b5cf6",
  },
  {
    id: 4,
    title: "ランサムウェア侵攻",
    subtitle: "サーバーを暗号化せよ",
    icon: "💀",
    difficulty: 3,
    mode: "attack",
    color: "#dc2626",
  },
  {
    id: 5,
    title: "ソーシャルエンジニアリング",
    subtitle: "人間の隙を突け",
    icon: "🎭",
    difficulty: 3,
    mode: "attack",
    color: "#6366f1",
  },
  {
    id: 6,
    title: "公衆Wi-Fi攻撃",
    subtitle: "偽アクセスポイントを仕掛けろ",
    icon: "📡",
    difficulty: 2,
    mode: "attack",
    color: "#0891b2",
  },
];

export const PASSWORDS = [
  { value: "password", time: "0.001秒", strength: 3, label: "辞書攻撃で瞬殺" },
  { value: "1234567890", time: "0.01秒", strength: 5, label: "数字だけは危険" },
  { value: "tanaka1985", time: "3分", strength: 20, label: "名前＋生年は推測可能" },
  { value: "Coffee#Mug42", time: "3ヶ月", strength: 55, label: "まあまあ強い" },
  { value: "Xk#9pL!2qW$m", time: "推定380年", strength: 95, label: "突破ほぼ不可能" },
];
