"use client";

import { useRouter } from "next/navigation";
import { Smartphone, Globe, Receipt, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function UtilitiesLanding() {
  const router = useRouter();

  const items = [
    { id: "airtime", title: "Buy Airtime", desc: "Instant top-up for all networks", icon: Smartphone, href: "/dashboard/utilities/airtime", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" },
    { id: "data", title: "Buy Data", desc: "Affordable data bundles", icon: Globe, href: "/dashboard/utilities/data", gradient: "from-cyan-500 to-blue-400", glow: "shadow-cyan-500/20" },
    { id: "bills", title: "Pay Bills", desc: "Electricity & cable TV", icon: Receipt, href: "/dashboard/utilities/bills", gradient: "from-amber-500 to-orange-400", glow: "shadow-amber-500/20" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-emerald-500" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Utilities</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Select a service to get started
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onClick={() => router.push(item.href)}
              className="w-full rounded-2xl border border-gray-200/80 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] px-4 py-4 text-left hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} text-white grid place-items-center shadow-lg ${item.glow}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white">{item.title}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
