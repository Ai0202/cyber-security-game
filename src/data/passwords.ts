import { PasswordEntry } from "@/lib/types";

export const PASSWORDS: PasswordEntry[] = [
  { value: "password", time: "0.001秒", strength: 3, label: "辞書攻撃で瞬殺" },
  { value: "1234567890", time: "0.01秒", strength: 5, label: "数字だけは危険" },
  { value: "tanaka1985", time: "3分", strength: 20, label: "名前＋生年は推測可能" },
  { value: "Coffee#Mug42", time: "3ヶ月", strength: 55, label: "まあまあ強い" },
  { value: "Xk#9pL!2qW$m", time: "推定380年", strength: 95, label: "突破ほぼ不可能" },
];
