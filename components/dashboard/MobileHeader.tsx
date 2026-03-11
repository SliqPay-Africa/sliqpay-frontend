"use client";

import { Bell, Settings } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function MobileHeader() {
  const { user } = useUser();

  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-2xl border-b border-gray-100/60 dark:border-white/5">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: Logo + Greeting */}
        <div className="flex items-center gap-2.5">
          <img src="/Sliqpay visual icon.png" alt="SliqPay" className="w-7 h-7 object-contain" />
          <div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-none">Welcome back</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{user?.name?.split(" ")[0] || "User"}</p>
          </div>
        </div>

        {/* Right: Notifications + Settings */}
        <div className="flex items-center gap-1.5">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <Bell size={18} className="text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d1117]" />
          </button>
          <Link href="/dashboard" className="flex-shrink-0 p-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-[11px] font-bold shadow-sm shadow-emerald-500/20">
              {user?.initials || "U"}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
