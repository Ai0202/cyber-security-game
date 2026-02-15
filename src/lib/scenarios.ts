import { TargetProfile } from "@/lib/types";

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
  mail_server: { name: "メールサーバー", type: "server", hidden: false, files: [] as string[] },
  admin_pc: { name: "管理者端末", type: "admin", hidden: true, files: ["admin_config.json", "全社パスワード.enc"] },
  backup_server: { name: "バックアップサーバー", type: "backup", hidden: true, files: ["backup_2024.tar.gz"] },
  firewall: { name: "ファイアウォール (マモル)", type: "firewall", hidden: false, files: [] as string[] },
};
