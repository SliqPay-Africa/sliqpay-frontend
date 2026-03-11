"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Repeat2, Clock, Zap, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Home", href: "/dashboard", icon: Home, exact: true },
  { label: "Convert", href: "/dashboard/convert", icon: Repeat2 },
  { label: "History", href: "/dashboard/history", icon: Clock },
  { label: "Utilities", href: "/dashboard/utilities", icon: Zap },
  { label: "More", href: "/dashboard/history", icon: MoreHorizontal },
];

export default function BottomTabNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden px-3 pb-[env(safe-area-inset-bottom)]">
      <div className="bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-2xl border border-gray-200/60 dark:border-white/[0.06] rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 mb-2 mx-auto max-w-lg">
        <div className="flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const active = isActive(tab.href, tab.exact);
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[52px] rounded-xl transition-all duration-200",
                  active
                    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                )}
              >
                <tab.icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.6}
                />
                <span className={cn("text-[10px]", active ? "font-semibold" : "font-medium")}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
