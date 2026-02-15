import type { Metadata } from "next";
import { Noto_Sans_JP, JetBrains_Mono } from "next/font/google";
import { GameProvider } from "@/contexts/GameContext";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "せきゅトレ",
  description:
    "攻撃者の目線で学ぶ、サイバーセキュリティ体験学習ゲーム。攻撃者側を体験することで実践的なセキュリティリテラシーを身につけよう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSansJP.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
