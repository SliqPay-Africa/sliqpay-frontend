"use client";

import { Bell } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function MobileHeader() {
    const { user } = useUser();

    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/60">
            <div className="flex items-center justify-between px-4 h-14">
                {/* Left: Greeting */}
                <div>
                    <p className="text-[11px] text-gray-400 font-medium leading-none">Welcome back</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{user?.name || "User"}</p>
                </div>

                {/* Right: Notifications + Profile avatar */}
                <div className="flex items-center gap-2">
                    <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <Bell size={18} className="text-gray-500" />
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </button>
                    <Link href="/dashboard/utilities" className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold">
                            {user?.initials || "U"}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}
