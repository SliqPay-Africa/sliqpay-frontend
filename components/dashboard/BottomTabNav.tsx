"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Repeat2, Clock, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Convert", href: "/dashboard/convert", icon: Repeat2 },
    { label: "Utilities", href: "/dashboard/utilities", icon: Zap },
    { label: "History", href: "/dashboard/history", icon: Clock },
    { label: "Profile", href: "/dashboard/settings", icon: User },
];

export default function BottomTabNav() {
    const pathname = usePathname();

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
            <div className="bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-2xl border-t border-gray-100 dark:border-white/5 shadow-[0_-2px_20px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href, tab.exact);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 py-2.5 px-3 min-w-[52px] transition-all duration-200",
                                    active ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                                )}
                            >
                                {active && (
                                    <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                                )}
                                <div className={cn(
                                    "flex items-center justify-center w-7 h-7 rounded-lg transition-all",
                                    active && "bg-emerald-50 dark:bg-emerald-500/10"
                                )}>
                                    <tab.icon
                                        size={18}
                                        strokeWidth={active ? 2.3 : 1.6}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[10px]",
                                    active ? "font-bold" : "font-medium"
                                )}>
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
