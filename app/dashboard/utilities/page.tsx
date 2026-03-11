"use client";

import { useRouter } from "next/navigation";
import { Smartphone, Globe, Receipt, ChevronRight, Zap, Tv } from "lucide-react";

export default function UtilitiesLanding() {
  const router = useRouter();

  const items = [
    {
      id: "airtime",
      title: "Buy Airtime",
      desc: "Instant recharge for all networks",
      icon: Smartphone,
      href: "/dashboard/utilities/airtime",
      gradient: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      id: "data",
      title: "Buy Data",
      desc: "Affordable data plans at the best rates",
      icon: Globe,
      href: "/dashboard/utilities/data",
      gradient: "from-cyan-500 to-blue-400",
      bg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
    {
      id: "bills",
      title: "Pay Bills",
      desc: "Electricity, cable TV & more",
      icon: Receipt,
      href: "/dashboard/utilities/bills",
      gradient: "from-violet-500 to-purple-400",
      bg: "bg-violet-50 dark:bg-violet-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Utilities</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Pay bills and buy airtime instantly
        </p>
      </div>

      {/* Service cards */}
      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className="w-full rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] px-4 py-4 text-left hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-md transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white block">{item.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">{item.desc}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
