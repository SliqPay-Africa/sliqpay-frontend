"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Moon,
  Sun,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Shield,
  Clock,
  CreditCard,
  ArrowRight,
  Star,
  Menu,
  X,
  TrendingUp,
  Globe,
  Fingerprint,
  ChevronRight,
  Sparkles,
} from "lucide-react";

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── InView section wrapper ─── */
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Features", href: "#features" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const services = [
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: "Airtime Top-up",
      desc: "Instant airtime recharge for all major networks across Africa.",
      gradient: "from-emerald-500 to-teal-400",
    },
    {
      icon: <Wifi className="w-7 h-7" />,
      title: "Data Bundles",
      desc: "Affordable data plans. Stay connected with the best rates.",
      gradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Electricity Bills",
      desc: "Pay your electricity bills instantly— prepaid & postpaid.",
      gradient: "from-amber-500 to-yellow-400",
    },
    {
      icon: <Tv className="w-7 h-7" />,
      title: "Cable TV",
      desc: "Subscribe to DSTV, GOtv, Startimes and more in seconds.",
      gradient: "from-violet-500 to-purple-400",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Bank-Grade Security",
      desc: "256-bit encryption & multi-factor auth on every transaction.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Instant Processing",
      desc: "Lightning-fast payments settled in under 3 seconds.",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Multiple Payment Options",
      desc: "Cards, bank transfers, USSD, or crypto— we support it all.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Pan-African Coverage",
      desc: "Available across Nigeria, Ghana, Kenya and expanding fast.",
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Biometric Login",
      desc: "Use Face ID or fingerprint for quick, secure access.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Spending Insights",
      desc: "Track your bills & spending with beautiful analytics.",
    },
  ];

  const testimonials = [
    {
      name: "Adebayo T.",
      role: "Business Owner",
      text: "SliqPay has completely transformed how I handle utility payments for my stores. The speed is incredible.",
      avatar: "AT",
    },
    {
      name: "Chioma E.",
      role: "Software Engineer",
      text: "I love the clean interface and how fast everything processes. Best fintech app for bill payments hands down.",
      avatar: "CE",
    },
    {
      name: "Fatima Y.",
      role: "Freelancer",
      text: "The crypto payment option is a game-changer. I can pay my bills directly from my wallet. Brilliant!",
      avatar: "FY",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl shadow-sm border-b border-gray-200/40 dark:border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <img
                src="/Sliqpay visual icon.png"
                alt="SliqPay"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              SliqPay
            </span>
          </Link>

          {/* desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* right */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all px-6"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>

          {/* mobile toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {isDarkMode ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-gray-200/40 dark:border-white/5 overflow-hidden"
            >
              <div className="px-5 py-6 flex flex-col gap-4">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {l.label}
                  </a>
                ))}
                <hr className="border-gray-200 dark:border-white/10" />
                <Link
                  href="/auth/login"
                  className="text-base font-medium text-gray-700 dark:text-gray-300"
                >
                  Log in
                </Link>
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white w-full"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* bg glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* left */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Modern Fintech Platform
                </span>
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
                Pay Bills{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
                  Seamlessly.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Airtime, data, electricity, cable TV — everything in one
                beautifully secure platform. Fast, reliable, and built for
                Africa.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all px-8 text-base"
                >
                  <Link href="/auth/signup">
                    Start Paying Bills
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-gray-300 dark:border-white/15 hover:bg-gray-50 dark:hover:bg-white/5 px-8 text-base transition-all"
                >
                  <a href="#features">Learn More</a>
                </Button>
              </div>

              {/* stats */}
              <div className="flex items-center gap-10 pt-6">
                {[
                  { value: 10000, suffix: "+", label: "Happy Users" },
                  { value: 99, suffix: ".9%", label: "Uptime" },
                  { value: 500, suffix: "K+", label: "Transactions" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      <Counter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* right — mock dashboard card */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              className="relative hidden lg:block"
            >
              {/* glow ring */}
              <div className="absolute inset-0 m-auto w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 blur-3xl" />

              <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-gray-200/60 dark:border-white/10 shadow-2xl p-8 space-y-6">
                {/* card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold">SliqPay Wallet</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Premium Account
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    Active
                  </span>
                </div>

                {/* balance */}
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
                    Available Balance
                  </p>
                  <p className="text-4xl font-extrabold tracking-tight">
                    ₦247,580
                    <span className="text-lg font-normal text-gray-400">
                      .00
                    </span>
                  </p>
                </div>

                {/* quick actions */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { icon: <Smartphone className="w-5 h-5" />, label: "Airtime" },
                    { icon: <Wifi className="w-5 h-5" />, label: "Data" },
                    { icon: <Zap className="w-5 h-5" />, label: "Power" },
                    { icon: <Tv className="w-5 h-5" />, label: "Cable" },
                  ].map((a, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer transition-colors"
                    >
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {a.icon}
                      </span>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                        {a.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* recent txns */}
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500">
                    Recent Activity
                  </p>
                  {[
                    { name: "MTN Airtime", amount: "-₦1,000", time: "2 min ago", color: "text-red-500" },
                    { name: "Wallet Funded", amount: "+₦50,000", time: "1 hr ago", color: "text-emerald-500" },
                    { name: "DSTV Premium", amount: "-₦24,500", time: "3 hrs ago", color: "text-red-500" },
                  ].map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{tx.name}</p>
                        <p className="text-xs text-gray-500">{tx.time}</p>
                      </div>
                      <span className={`text-sm font-semibold ${tx.color}`}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED PARTNERS ─── */}
      <Section className="py-16 border-y border-gray-100 dark:border-white/5">
        <motion.div variants={fadeUp} className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-8">
            Trusted by leading brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 opacity-40 dark:opacity-20">
            {["MTN", "Airtel", "Glo", "9mobile", "DSTV", "IKEDC"].map((brand) => (
              <span
                key={brand}
                className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ─── SERVICES ─── */}
      <Section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8" id="services">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              What we offer
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Everything you need,{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                one platform.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              From airtime to electricity — pay all your bills in seconds with
              zero stress.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {services.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-8 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg mb-6`}
                >
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {s.desc}
                </p>
                <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-emerald-500 transition-colors mt-4" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ─── FEATURES ─── */}
      <Section className="py-24 sm:py-32 bg-gray-50/80 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8" id="features">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Why SliqPay
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Built different.{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Built better.
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Enterprise-grade infrastructure with consumer-grade simplicity.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ─── TESTIMONIALS ─── */}
      <Section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8" id="testimonials">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="text-sm font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                thousands.
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="relative rounded-3xl bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/5 p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <Section className="py-24 sm:py-32">
        <motion.div
          variants={scaleIn}
          className="max-w-5xl mx-auto px-5 sm:px-8"
        >
          <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-12 sm:p-16 text-center overflow-hidden">
            {/* bg pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Ready to simplify your payments?
              </h2>
              <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
                Join thousands of Africans using SliqPay to pay bills faster,
                smarter, and more securely.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-emerald-700 hover:bg-gray-100 shadow-xl shadow-black/10 px-8 text-base font-semibold"
                >
                  <Link href="/auth/signup">
                    Get Started Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 text-base"
                >
                  <a href="mailto:support@sliqpay.com">Contact Sales</a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <img
                    src="/Sliqpay visual icon.png"
                    alt="SliqPay"
                    className="w-5 h-5 object-contain"
                  />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  SliqPay
                </span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
                Modern fintech for seamless bill payments across Africa.
              </p>
            </div>

            {/* services */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Services
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Airtime Top-up
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Data Bundles
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Electricity Bills
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Cable TV
                </li>
              </ul>
            </div>

            {/* company */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  About Us
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Careers
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Privacy Policy
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Terms of Service
                </li>
              </ul>
            </div>

            {/* connect */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white mb-4">
                Connect
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Twitter
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  Instagram
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  LinkedIn
                </li>
                <li className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                  support@sliqpay.com
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-gray-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} SliqPay. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-600">
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                Privacy
              </span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                Terms
              </span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                Cookies
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
