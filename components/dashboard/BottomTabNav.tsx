"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Repeat2, Clock, Zap, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Convert", href: "/dashboard/convert", icon: Repeat2 },
    { label: "History", href: "/dashboard/history", icon: Clock },
    { label: "Utilities", href: "/dashboard/utilities", icon: Zap },
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
            <div className="bg-white border-t border-gray-100 shadow-[0_-1px_12px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom)]">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href, tab.exact);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] transition-colors duration-150",
                                    active ? "text-emerald-600" : "text-gray-400"
                                )}
                            >
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-emerald-500" />
                                )}
                                <tab.icon
                                    size={20}
                                    strokeWidth={active ? 2.2 : 1.6}
                                />
                                <span className="text-[10px] font-medium">
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
