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
