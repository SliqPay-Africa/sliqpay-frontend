"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";
import {
    LayoutDashboard,
    ArrowUpRight,
    ArrowDownLeft,
    Repeat2,
    Zap,
    Clock,
    Settings,
    LogOut,
    HelpCircle,
    ChevronRight,
    User,
    X,
} from "lucide-react";

type SidebarProps = {
    className?: string;
    variant?: "desktop" | "mobile";
    onClose?: () => void;
};

const mainNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Send Money", href: "/dashboard/send", icon: ArrowUpRight },
    { label: "Receive Money", href: "/dashboard/receive", icon: ArrowDownLeft },
    { label: "Convert", href: "/dashboard/convert", icon: Repeat2 },
    { label: "Utilities", href: "/dashboard/utilities", icon: Zap },
    { label: "History", href: "/dashboard/history", icon: Clock },
];

const bottomNavItems = [
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
];

export default function Sidebar({ className, variant = "desktop", onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, clearUser } = useUser();
    const [loggingOut, setLoggingOut] = useState(false);

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    async function handleLogout() {
        try {
            setLoggingOut(true);
            const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";
            await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
            clearUser();
            document.cookie = "sliqpay_logged_in=; path=/; max-age=0";
        } catch {
            clearUser();
            document.cookie = "sliqpay_logged_in=; path=/; max-age=0";
        } finally {
            setLoggingOut(false);
            setTimeout(() => router.push("/auth/login"), 100);
        }
    }

    return (
        <aside
            className={cn(
                "flex flex-col h-full bg-white",
                variant === "desktop"
                    ? "w-72 border-r border-gray-100"
                    : "w-full overflow-y-auto",
                className
            )}
        >
            {/* Header */}
            <div className="px-6 pt-8 pb-2">
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img
                            src="/Sliqpayvisual12.png"
                            alt="SliqPay"
                            className="h-7"
                        />
                    </Link>
                    {variant === "mobile" && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    )}
                </div>
            </div>

            {/* User card */}
            <div className="px-5 py-4">
                <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 border border-emerald-100/60">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-emerald-200/50">
                        {user?.initials || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name || "User"}
                        </p>
                        {user?.sliqId && (
                            <p className="text-xs text-emerald-600 font-medium truncate mt-0.5">
                                {user.sliqId}
                            </p>
                        )}
                    </div>
                    <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </div>
            </div>

            {/* Main navigation */}
            <nav className="flex-1 px-3 py-2">
                <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Menu
                </p>
                <div className="space-y-0.5">
                    {mainNavItems.map((item) => {
                        const active = isActive(item.href, item.exact);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    active
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/40"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon
                                    size={19}
                                    strokeWidth={active ? 2.2 : 1.8}
                                    className={active ? "text-white" : "text-gray-400"}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Secondary nav */}
                <div className="mt-6">
                    <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        General
                    </p>
                    <div className="space-y-0.5">
                        {bottomNavItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                        active
                                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/40"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon
                                        size={19}
                                        strokeWidth={active ? 2.2 : 1.8}
                                        className={active ? "text-white" : "text-gray-400"}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6 pt-2 border-t border-gray-100 mt-auto">
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                >
                    <LogOut size={19} strokeWidth={1.8} />
                    <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                </button>
            </div>
        </aside>
    );
}