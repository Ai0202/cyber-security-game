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
