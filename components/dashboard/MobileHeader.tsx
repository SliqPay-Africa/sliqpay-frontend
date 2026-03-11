"use client";

import { Bell, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function MobileHeader() {
    const { user } = useUser();
    const firstName = user?.name?.split(" ")[0] || "User";

    return (
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-2xl border-b border-gray-100/60 dark:border-white/5">
            <div className="flex items-center justify-between px-4 h-16">
                {/* Left: Avatar + Greeting */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
                        {user?.initials || "U"}
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-none">Welcome back</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{firstName} 👋</p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1">
                    <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1117]" />
                    </button>
                    <Link href="/dashboard/settings" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <Settings size={20} className="text-gray-500 dark:text-gray-400" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
