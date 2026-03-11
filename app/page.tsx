"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
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
  ArrowUpRight,
  Wallet,
  BarChart3,
  Lock,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   ANIMATION VARIANTS
   ──────────────────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Section InView wrapper ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.section
      ref={ref}
      id={id}
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
    const step = Math.ceil(target / 50);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── Typing effect ─── */
function TypedText({ words }: { words: string[] }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    const timeout = deleting ? 40 : 80;

    if (!deleting && displayed === word) {
      setTimeout(() => setDeleting(true), 2000);
      return;
    }
    if (deleting && displayed === "") {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
      return;
    }

    const timer = setTimeout(() => {
      setDisplayed(
        deleting
          ? word.substring(0, displayed.length - 1)
          : word.substring(0, displayed.length + 1)
      );
    }, timeout);

    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, words]);

  return (
    <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
      {displayed}
      <span className="animate-pulse text-emerald-400">|</span>
    </span>
  );
}

/* ─── Floating particles background ─── */
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-emerald-500/20"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark by default
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
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
    { label: "Products", href: "#services" },
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const services = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Airtime Top-up",
      desc: "Instant recharge for all major networks. Zero downtime, instant delivery.",
      gradient: "from-emerald-500 to-teal-400",
      glow: "shadow-emerald-500/20",
      stat: "50ms avg",
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "Data Bundles",
      desc: "Affordable data plans at wholesale rates. Stay connected for less.",
      gradient: "from-cyan-500 to-blue-400",
      glow: "shadow-cyan-500/20",
      stat: "15% cheaper",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Electricity",
      desc: "Pay prepaid & postpaid bills instantly. Get your token in seconds.",
      gradient: "from-amber-500 to-orange-400",
      glow: "shadow-amber-500/20",
      stat: "Instant token",
    },
    {
      icon: <Tv className="w-6 h-6" />,
      title: "Cable TV",
      desc: "DSTV, GOtv, Startimes, Showmax — subscribe in one tap.",
      gradient: "from-violet-500 to-purple-400",
      glow: "shadow-violet-500/20",
      stat: "All providers",
    },
  ];

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Military-Grade Security",
      desc: "256-bit AES encryption, 2FA, and on-chain verification for every transaction.",
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Sub-Second Processing",
      desc: "Lightning-fast payment settlement. Most transactions complete in under 500ms.",
    },
    {
      icon: <Wallet className="w-5 h-5" />,
      title: "Pay with Crypto",
      desc: "Connect MetaMask or any Web3 wallet. Pay bills directly from your crypto balance.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Pan-African Coverage",
      desc: "Available across Nigeria, Ghana, Kenya — and expanding across the continent.",
    },
    {
      icon: <Fingerprint className="w-5 h-5" />,
      title: "Biometric Auth",
      desc: "Face ID, fingerprint, and transaction PIN for bank-grade account security.",
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: "Spending Analytics",
      desc: "Track your bills and spending patterns with real-time dashboards and insights.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Account",
      desc: "Sign up in 60 seconds with just your email. No paperwork, no delays.",
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      desc: "Add funds via bank transfer, card, or connect your crypto wallet directly.",
      icon: <Wallet className="w-6 h-6" />,
    },
    {
      number: "03",
      title: "Pay Any Bill",
      desc: "Select your service, enter details, confirm with PIN — done in 3 taps.",
      icon: <Zap className="w-6 h-6" />,
    },
    {
      number: "04",
      title: "Instant Confirmation",
      desc: "Get real-time delivery confirmation and digital receipts for all payments.",
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
  ];

  const testimonials = [
    {
      name: "Adebayo T.",
      role: "Business Owner, Lagos",
      text: "SliqPay transformed how I handle utility payments for all my stores. The speed and reliability are unmatched — I save hours every week.",
      avatar: "AT",
      rating: 5,
    },
    {
      name: "Chioma E.",
      role: "Software Engineer, Abuja",
      text: "The cleanest fintech UI I've ever used. Crypto payments for bills? Genius. This is how fintech should work in Africa.",
      avatar: "CE",
      rating: 5,
    },
    {
      name: "Fatima Y.",
      role: "Freelancer, Accra",
      text: "I pay my DSTV, electricity, and buy data all from my MetaMask wallet. No bank account needed. This is revolutionary.",
      avatar: "FY",
      rating: 5,
    },
    {
      name: "Emeka O.",
      role: "Entrepreneur, Port Harcourt",
      text: "The transaction speed is incredible. I funded my wallet with crypto and bought airtime in under 5 seconds. No waiting, no hassle.",
      avatar: "EO",
      rating: 5,
    },
  ];

  const stats = [
    { value: 10000, suffix: "+", label: "Active Users" },
    { value: 500, suffix: "K+", label: "Transactions" },
    { value: 99, suffix: ".9%", label: "Uptime SLA" },
    { value: 4, suffix: ".9★", label: "User Rating" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#080b12] text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden font-[Inter,system-ui,sans-serif]">

      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#080b12]/80 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/20 border-b border-gray-200/40 dark:border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/Sliqpay visual icon.png"
              alt="SliqPay"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              SliqPay
            </span>
          </Link>

          {/* desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* right controls */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <Button
              asChild
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all px-6 font-semibold"
            >
              <Link href="/auth/signup">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* mobile toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              transition={{ duration: 0.3 }}
              className="lg:hidden bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-2xl border-t border-gray-200/40 dark:border-white/5 overflow-hidden"
            >
              <div className="px-5 py-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-3 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    {l.label}
                  </a>
                ))}
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white w-full mt-3 font-semibold"
                >
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Gradient mesh */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-emerald-500/8 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 -right-20 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
          {/* Grid lines (subtle) */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <ParticleField />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left – Text */}
            <motion.div
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Africa&apos;s #1 Crypto-Powered Bill Pay
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold leading-[1.1] tracking-tight">
                Pay Bills with
                <br />
                <TypedText words={["Crypto.", "Speed.", "Confidence.", "SliqPay."]} />
              </h1>

              {/* Sub */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                Airtime, data, electricity, cable TV — powered by blockchain.
                Fast, transparent, and built for the next billion users.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all px-8 text-base font-semibold h-13"
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
                  className="rounded-full border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 px-8 text-base font-medium transition-all h-13 dark:text-gray-300"
                >
                  <a href="#how-it-works">
                    How it Works
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4 pt-4">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      <Counter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-500 mt-1 font-medium">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Premium Dashboard Preview */}
            <motion.div
              variants={slideInRight}
              initial="hidden"
              animate="visible"
              className="relative hidden lg:block"
            >
              {/* Glow effects */}
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-[2rem] blur-3xl opacity-60" />
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-[2rem] blur-xl" />

              <div className="relative bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-2xl rounded-3xl border border-gray-200/60 dark:border-white/[0.08] shadow-2xl shadow-black/5 dark:shadow-black/40 overflow-hidden">
                {/* Top bar */}
                <div className="px-6 py-4 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/30">
                      S
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">SliqPay Wallet</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-500">Premium • Verified</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="p-6 space-y-6">
                  {/* Balance */}
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 font-medium">
                      Total Balance
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        ₦247,580
                        <span className="text-lg font-normal text-gray-400 dark:text-gray-600">.00</span>
                      </p>
                      <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        +12.5%
                      </span>
                    </div>
                    {/* Mini chart (decorative) */}
                    <svg viewBox="0 0 280 40" className="w-full h-10 mt-2">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,35 Q20,30 40,28 T80,22 T120,25 T160,15 T200,18 T240,8 T280,5"
                        stroke="#10B981"
                        strokeWidth="2"
                        fill="none"
                      />
                      <path
                        d="M0,35 Q20,30 40,28 T80,22 T120,25 T160,15 T200,18 T240,8 T280,5 V40 H0 Z"
                        fill="url(#chartGrad)"
                      />
                    </svg>
                  </div>

                  {/* Quick actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: <Smartphone className="w-5 h-5" />, label: "Airtime", color: "text-emerald-500" },
                      { icon: <Wifi className="w-5 h-5" />, label: "Data", color: "text-cyan-500" },
                      { icon: <Zap className="w-5 h-5" />, label: "Power", color: "text-amber-500" },
                      { icon: <Tv className="w-5 h-5" />, label: "Cable", color: "text-violet-500" },
                    ].map((a, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ y: -3, scale: 1.03 }}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] hover:bg-emerald-50 dark:hover:bg-emerald-500/5 cursor-pointer transition-all border border-transparent hover:border-emerald-500/20"
                      >
                        <span className={a.color}>{a.icon}</span>
                        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          {a.label}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent transactions */}
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-500 font-medium mb-3">
                      Recent Activity
                    </p>
                    {[
                      { name: "MTN Airtime", amount: "-₦1,000", time: "2 min ago", color: "text-red-400", icon: "📱" },
                      { name: "Wallet Funded", amount: "+₦50,000", time: "1 hr ago", color: "text-emerald-400", icon: "💰" },
                      { name: "DSTV Premium", amount: "-₦18,400", time: "3 hrs ago", color: "text-red-400", icon: "📺" },
                    ].map((tx, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors -mx-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{tx.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.name}</p>
                            <p className="text-xs text-gray-500">{tx.time}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${tx.color}`}>
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ TRUST BAR ════════════════════════ */}
      <Section className="py-12 sm:py-16 border-y border-gray-100 dark:border-white/5">
        <motion.div variants={fadeUp} className="max-w-7xl mx-auto px-5 sm:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600 mb-8">
            Trusted by leading networks & billers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {["MTN", "Airtel", "Glo", "9mobile", "DSTV", "GOtv", "IKEDC", "Startimes"].map((brand) => (
              <span
                key={brand}
                className="text-lg sm:text-xl font-bold tracking-tight text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ════════════════════════ SERVICES ════════════════════════ */}
      <Section className="py-20 sm:py-28" id="services">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
              <Layers className="w-4 h-4" />
              Products
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              All your bills.{" "}
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                One platform.
              </span>
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              From airtime to electricity — pay all your utility bills in seconds with blockchain-powered speed and transparency.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {services.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-7 hover:border-emerald-500/30 dark:hover:border-emerald-500/20 transition-all hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/5"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg ${s.glow} mb-5`}
                  >
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{s.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {s.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      {s.stat}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════ FEATURES ════════════════════════ */}
      <Section className="py-20 sm:py-28 bg-gray-50/80 dark:bg-white/[0.015]" id="features">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-6">
              <Shield className="w-4 h-4" />
              Why SliqPay
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Built different.{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-emerald-400 bg-clip-text text-transparent">
                Built better.
              </span>
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
              Enterprise-grade infrastructure with consumer-grade simplicity.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-emerald-500/20 dark:hover:border-emerald-500/15 transition-all hover:shadow-lg hover:shadow-black/[0.02]"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-500/10">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <Section className="py-20 sm:py-28" id="how-it-works">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-sm font-medium text-violet-600 dark:text-violet-400 mb-6">
              <Sparkles className="w-4 h-4" />
              How it Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Three taps.{" "}
              <span className="bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent">
                That&apos;s it.
              </span>
            </h2>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400">
              From signup to your first bill payment in under 2 minutes.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="relative group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-emerald-500/30 to-transparent z-0" />
                )}
                <div className="relative p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] hover:border-emerald-500/20 transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-black text-emerald-500/20 dark:text-emerald-500/15 select-none">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-base font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ════════════════════════ TESTIMONIALS ════════════════════════ */}
      <Section className="py-20 sm:py-28 bg-gray-50/80 dark:bg-white/[0.015]" id="testimonials">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-medium text-amber-600 dark:text-amber-400 mb-6">
              <Star className="w-4 h-4" />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Loved by{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-400 bg-clip-text text-transparent">
                thousands.
              </span>
            </h2>
          </motion.div>

          {/* Desktop grid */}
          <motion.div variants={stagger} className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="relative rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] p-6 hover:border-amber-500/20 transition-all"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  &ldquo;{testimonials[activeTestimonial].text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{testimonials[activeTestimonial].name}</p>
                    <p className="text-xs text-gray-500">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeTestimonial
                      ? "bg-emerald-500 w-6"
                      : "bg-gray-300 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <Section className="py-20 sm:py-28">
        <motion.div variants={scaleIn} className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="relative rounded-[2rem] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117] via-[#101820] to-[#0d1117]" />
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: "radial-gradient(rgba(16,185,129,0.4) 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
            </div>

            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Ready to pay bills the{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  smart way?
                </span>
              </h2>
              <p className="mt-5 text-lg text-gray-400 max-w-2xl mx-auto">
                Join thousands of Africans using SliqPay to pay bills faster, smarter, and more securely — with fiat or crypto.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 px-10 text-base font-semibold"
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
                  className="rounded-full border-white/15 text-white hover:bg-white/5 px-10 text-base font-medium"
                >
                  <a href="mailto:support@sliqpay.com">Contact Sales</a>
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> 256-bit Encryption
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> SOC 2 Compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.9% Uptime
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer className="border-t border-gray-200/60 dark:border-white/5 bg-gray-50/50 dark:bg-[#080b12]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* brand */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="flex items-center gap-2.5">
                <img
                  src="/Sliqpay visual icon.png"
                  alt="SliqPay"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  SliqPay
                </span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed max-w-sm">
                Africa&apos;s first crypto-powered bill payment platform. Pay airtime, data, electricity, and cable TV with fiat or crypto — instantly.
              </p>
              {/* Social icons */}
              <div className="flex items-center gap-3">
                {[
                  { label: "Twitter", href: "#" },
                  { label: "Discord", href: "#" },
                  { label: "Telegram", href: "#" },
                  { label: "Github", href: "#" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-xs font-bold border border-transparent hover:border-emerald-500/20"
                  >
                    {social.label[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* products */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-900 dark:text-white mb-4">
                Products
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                {["Airtime Top-up", "Data Bundles", "Electricity Bills", "Cable TV", "Crypto Wallet"].map((item) => (
                  <li key={item} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-900 dark:text-white mb-4">
                Company
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                {["About Us", "Careers", "Blog", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* support */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-900 dark:text-white mb-4">
                Support
              </h4>
              <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
                {["Help Center", "API Docs", "Status Page", "Contact Us"].map((item) => (
                  <li key={item} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
                support@sliqpay.com
              </p>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-gray-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} SliqPay Africa Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-400 dark:text-gray-600">
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">Cookies</span>
              <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
