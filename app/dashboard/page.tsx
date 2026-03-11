"use client";
import { useMemo, useState, useEffect } from "react";
import { SendIcon, ReceiveIcon, ConvertIcon, AirtimeIcon } from "@/components/icons";
import {
    Eye,
    EyeOff,
    X,
    ArrowUpRight,
    ArrowDownLeft,
    Copy,
    Check,
    Repeat,
    Receipt,
    ChevronDown,
    ChevronRight,
    Sparkles,
    TrendingUp,
    RefreshCw,
    Gift,
    Lock,
    Smartphone,
    Wifi,
    Zap,
    Tv,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getTransactionsByAccount, Transaction } from "@/lib/accounts";
import { useBalances, useTransactions, useCurrentUser } from "@/lib/api-hooks";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import TransactionPinScreen from "@/components/utilities/TransactionPinScreen";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

/* ───── Skeleton ───── */
function DashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="rounded-2xl h-52 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]" />
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[80px] rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]" />
                ))}
            </div>
            <div className="rounded-2xl bg-white dark:bg-white/[0.03] p-4 space-y-3 border border-gray-100 dark:border-white/[0.06]">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-2/3 bg-gray-100 dark:bg-white/5 rounded" />
                            <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/5 rounded" />
                        </div>
                        <div className="h-3.5 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───── Main ───── */
export default function DashboardHome() {
    const router = useRouter();
    const { user, balance, refreshAccount, account } = useUser();
    const [currency, setCurrency] = useState("NGN");
    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [accountsOpen, setAccountsOpen] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);
    const [hasPin, setHasPin] = useState<boolean | null>(null);
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinError, setPinError] = useState<string | null>(null);
    const [pinLoading, setPinLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("sliqpay_token");
        if (!token) return;
        axios
            .get(`${backendUrl}/user/pin/status`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setHasPin(res.data?.hasPin ?? false))
            .catch(() => setHasPin(null));
    }, []);

    const handleSetPin = async (pin: string) => {
        setPinLoading(true);
        setPinError(null);
        try {
            const token = localStorage.getItem("sliqpay_token");
            await axios.post(`${backendUrl}/user/pin/set`, { pin }, { headers: { Authorization: `Bearer ${token}` } });
            setHasPin(true);
            setShowPinModal(false);
        } catch (err: any) {
            setPinError(err?.response?.data?.error || "Failed to set PIN.");
        } finally {
            setPinLoading(false);
        }
    };

    const { data: web2Balances, isLoading: loadingWeb2Balances } = useBalances();
    const { data: web2Transactions, isLoading: loadingWeb2Transactions } = useTransactions(5);
    const { data: currentUser } = useCurrentUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    const wallet = user?.walletAddress
        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
        : "No wallet";

    const copyWalletAddress = () => {
        if (user?.walletAddress) {
            navigator.clipboard.writeText(user.walletAddress);
            setCopiedWallet(true);
            setTimeout(() => setCopiedWallet(false), 2000);
        }
    };

    const fetchTransactions = async () => {
        if (!account?.id) return;
        try {
            const { transactions: data } = await getTransactionsByAccount(account.id);
            setTransactions(
                data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)
            );
        } catch {}
    };

    useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 600);
        refreshAccount();
        return () => clearTimeout(t);
    }, [refreshAccount]);

    useEffect(() => {
        if (account?.id) fetchTransactions();
    }, [account?.id]);

    const currencyFlag = (code: string) => {
        const m: Record<string, string> = { NGN: "🇳🇬", GHS: "🇬🇭", USD: "🇺🇸", EUR: "🇪🇺", BTC: "₿", SOL: "◎", ETH: "Ξ" };
        return m[code] || "🏳️";
    };
    const currencySymbol = (code: string) => {
        const m: Record<string, string> = { NGN: "₦", GHS: "₵", USD: "$", EUR: "€" };
        return m[code] || "";
    };

    const services = [
        { label: "Airtime", icon: <Smartphone size={18} />, path: "/dashboard/utilities/airtime", gradient: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/20" },
        { label: "Data", icon: <Wifi size={18} />, path: "/dashboard/utilities/data", gradient: "from-cyan-500 to-blue-400", glow: "shadow-cyan-500/20" },
        { label: "Power", icon: <Zap size={18} />, path: "/dashboard/utilities/bills", gradient: "from-amber-500 to-orange-400", glow: "shadow-amber-500/20" },
        { label: "Cable TV", icon: <Tv size={18} />, path: "/dashboard/utilities/bills", gradient: "from-violet-500 to-purple-400", glow: "shadow-violet-500/20" },
    ];

    const quickActions = [
        { label: "Send", icon: <SendIcon size={18} />, path: "/dashboard/send", gradient: "from-emerald-500 to-teal-400" },
        { label: "Receive", icon: <ReceiveIcon size={18} />, path: "/dashboard/receive", gradient: "from-cyan-500 to-blue-400" },
        { label: "Convert", icon: <ConvertIcon size={18} />, path: "/dashboard/convert", gradient: "from-violet-500 to-purple-400" },
    ];

    const firstName = user?.name?.split(" ")[0] || "there";

    const currentBalance = useMemo(() => {
        if (loadingWeb2Balances) return null;
        if (web2Balances) {
            const b = web2Balances.find((b: any) => b.currency === currency);
            return b ? b.amount : 0;
        }
        return balance;
    }, [web2Balances, loadingWeb2Balances, currency, balance]);

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="space-y-4">
            {/* ─── PIN setup banner ─── */}
            {hasPin === false && !showPinModal && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-4"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                        <Lock size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Set up Transaction PIN</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400/70">Required for all payments</p>
                    </div>
                    <button
                        onClick={() => setShowPinModal(true)}
                        className="shrink-0 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
                    >
                        Set PIN
                    </button>
                </motion.div>
            )}

            {/* ─── PIN setup modal ─── */}
            <AnimatePresence>
                {showPinModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setShowPinModal(false); }}
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/[0.06] p-6 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">Create Transaction PIN</h3>
                                <button onClick={() => setShowPinModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={20} />
                                </button>
                            </div>
                            {pinError && (
                                <p className="mb-3 rounded-lg bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">{pinError}</p>
                            )}
                            <TransactionPinScreen
                                onBack={() => setShowPinModal(false)}
                                onSubmit={handleSetPin}
                                mode="create"
                                isLoading={pinLoading}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── Balance Card ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="rounded-2xl relative overflow-hidden">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f38] to-[#0a1628]" />
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: "radial-gradient(rgba(16,185,129,0.4) 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                            }}
                        />
                    </div>

                    <div className="relative p-5">
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-5">
                            <button
                                onClick={() => setAccountsOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/15 transition-colors backdrop-blur-sm"
                            >
                                <span className="text-sm">{currencyFlag(currency)}</span>
                                <span>{currency}</span>
                                <ChevronDown size={12} />
                            </button>
                            <button
                                onClick={() => setShowBalance((v) => !v)}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
                            >
                                {showBalance ? <Eye size={16} className="text-white/70" /> : <EyeOff size={16} className="text-white/70" />}
                            </button>
                        </div>

                        {/* Balance */}
                        <div className="mb-5">
                            <p className="text-[11px] text-white/40 font-medium uppercase tracking-widest mb-1">Available Balance</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                {showBalance ? (
                                    currentBalance !== null ? (
                                        <>{currencySymbol(currency)}{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                                    ) : (
                                        <span className="inline-block h-9 w-36 rounded-lg bg-white/10 animate-pulse" />
                                    )
                                ) : (
                                    <span className="text-white/40">••••••••</span>
                                )}
                            </h2>
                        </div>

                        {/* Mini wallet badge */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={copyWalletAddress}
                                disabled={!user?.walletAddress}
                                className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors disabled:cursor-not-allowed"
                            >
                                <span className="font-mono">{wallet}</span>
                                {user?.walletAddress && (copiedWallet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />)}
                            </button>
                            {/* Quick action row */}
                            <div className="flex gap-2">
                                {quickActions.map((a) => (
                                    <button
                                        key={a.label}
                                        onClick={() => router.push(a.path)}
                                        className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition-all"
                                    >
                                        <span className="text-white/70">{a.icon}</span>
                                        <span className="hidden sm:inline">{a.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Services Grid ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                <div className="grid grid-cols-4 gap-2.5">
                    {services.map((s) => (
                        <button
                            key={s.label}
                            onClick={() => router.push(s.path)}
                            className="flex flex-col items-center gap-2 py-3.5 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] hover:border-emerald-200 dark:hover:border-emerald-500/20 hover:shadow-sm transition-all active:scale-[0.97]"
                        >
                            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-lg ${s.glow}`}>
                                {s.icon}
                            </div>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-400">{s.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ─── Invite Banner ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-100/60 dark:border-emerald-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
                            <Gift size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Invite & Earn</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Share SliqPay with friends and earn rewards</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                </div>
            </motion.div>

            {/* ─── Exchange Rate + Wallet ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Exchange Rate */}
                    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Exchange Rate</h3>
                            </div>
                            <button className="p-1 rounded hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <RefreshCw size={12} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/5 px-2.5 py-2 flex-1 border border-gray-100 dark:border-white/[0.06]">
                                <span className="text-sm">🇪🇺</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">EUR</span>
                            </div>
                            <div className="text-gray-300 dark:text-gray-600">
                                <svg width="16" height="14" viewBox="0 0 24 20" fill="none"><path d="M20 5H4l3-3M4 15h16l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 dark:bg-white/5 px-2.5 py-2 flex-1 border border-gray-100 dark:border-white/[0.06]">
                                <span className="text-sm">🇳🇬</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">NGN</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-500 mb-3">1.00 EUR = 1,667.649 NGN</p>
                        <button
                            onClick={() => router.push("/dashboard/convert")}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-white font-semibold text-xs hover:from-emerald-600 hover:to-teal-500 transition-all shadow-sm shadow-emerald-500/20"
                        >
                            Convert Currencies
                        </button>
                    </div>

                    {/* Wallet */}
                    <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                                <span className="text-[10px]">⟠</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Crypto Wallet</h3>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] px-3 py-2.5 mb-3">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">Embedded Wallet</p>
                            <p className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300 truncate">{user?.walletAddress || 'Generating...'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyWalletAddress}
                                disabled={!user?.walletAddress}
                                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 py-2.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                {copiedWallet ? <Check size={12} /> : <Copy size={12} />}
                                {copiedWallet ? "Copied" : "Copy"}
                            </button>
                            {user?.walletAddress && (
                                <button
                                    onClick={() => window.open(`https://testnet.snowtrace.io/address/${user.walletAddress}`, '_blank')}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 text-xs font-semibold text-white hover:from-emerald-600 hover:to-teal-500 transition-all shadow-sm shadow-emerald-500/20"
                                >
                                    View Explorer
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── Transactions ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                <div className="rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                        <button
                            onClick={() => router.push("/dashboard/history")}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700"
                        >
                            View all
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        {loadingWeb2Transactions ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/5" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-2/3 bg-gray-100 dark:bg-white/5 rounded" />
                                            <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/5 rounded" />
                                        </div>
                                        <div className="h-3.5 w-16 bg-gray-100 dark:bg-white/5 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : web2Transactions && web2Transactions.length > 0 ? (
                            <div className="divide-y divide-gray-50 dark:divide-white/5">
                                {web2Transactions.map((tx: any) => {
                                    const isSender = currentUser && tx.from_user_id === currentUser.id;
                                    const isReceiver = currentUser && tx.to_user_id === currentUser.id;
                                    const txType = tx.type.toLowerCase();

                                    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
                                        send_out: { bg: "bg-red-50 dark:bg-red-500/10", icon: <ArrowUpRight size={16} className="text-red-500" strokeWidth={2} /> },
                                        send_in: { bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: <ArrowDownLeft size={16} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} /> },
                                        convert: { bg: "bg-cyan-50 dark:bg-cyan-500/10", icon: <Repeat size={16} className="text-cyan-600 dark:text-cyan-400" strokeWidth={2} /> },
                                        purchase: { bg: "bg-orange-50 dark:bg-orange-500/10", icon: <Receipt size={16} className="text-orange-500 dark:text-orange-400" strokeWidth={2} /> },
                                    };
                                    const key = txType === "send" && isSender ? "send_out" : txType === "send" && isReceiver ? "send_in" : txType === "convert" ? "convert" : "purchase";
                                    const v = styles[key] || styles.purchase;

                                    const label = txType === "send" && isSender && tx.to_user
                                        ? `Sent to ${tx.to_user.first_name}`
                                        : txType === "send" && isReceiver && tx.from_user
                                        ? `From ${tx.from_user.first_name}`
                                        : txType === "convert"
                                        ? `${tx.from_currency} → ${tx.to_currency}`
                                        : txType === "purchase" ? "Bill Payment" : tx.type;

                                    return (
                                        <div key={tx.id} className="flex items-center gap-3 py-3">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${v.bg}`}>
                                                {v.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{label}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                                    {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-sm font-semibold ${isSender ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                                                    {isSender ? "-" : "+"}{currencySymbol(tx.from_currency)}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                                                    tx.status === "COMPLETED" ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : tx.status === "PENDING" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                                                }`}>{tx.status}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="divide-y divide-gray-50 dark:divide-white/5">
                                {transactions.map((t) => (
                                    <div key={t.id} className="flex items-center gap-3 py-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === "receive" ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-red-50 dark:bg-red-500/10"}`}>
                                            {t.type === "receive" ? <ReceiveIcon size={16} className="text-emerald-600" strokeWidth={2} /> : <SendIcon size={16} className="text-red-500" strokeWidth={2} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{t.title}</p>
                                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{t.time}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.amount}</p>
                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 tracking-wide">{t.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto h-14 w-14 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-3">
                                    <Sparkles size={24} className="text-gray-300 dark:text-gray-600" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">No transactions yet</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Send or receive money to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ─── Accounts Modal ─── */}
            <AnimatePresence>
                {accountsOpen && (
                    <div className="fixed inset-0 z-50">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm"
                            onClick={() => setAccountsOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white dark:bg-[#161b22] border border-gray-100 dark:border-white/[0.06] shadow-2xl rounded-t-3xl md:rounded-3xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="md:hidden flex justify-center pt-3">
                                <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-white/10" />
                            </div>
                            <div className="flex items-center justify-between px-5 pt-4 pb-3">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Accounts</h3>
                                <button onClick={() => setAccountsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <X size={18} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                            <div className="px-5 pb-6 max-h-[70vh] overflow-y-auto">
                                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider mb-3 uppercase">Fiat Currencies</p>
                                <div className="space-y-1">
                                    {[{ code: "NGN", name: "Nigerian Naira" }, { code: "GHS", name: "Ghanaian Cedi" }, { code: "USD", name: "US Dollar" }].map((f) => (
                                        <button
                                            key={f.code}
                                            onClick={() => { setCurrency(f.code); setAccountsOpen(false); }}
                                            className={`w-full flex items-center justify-between rounded-2xl px-3 py-3 transition-colors ${currency === f.code ? "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20" : "hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-xl shadow-sm">{currencyFlag(f.code)}</div>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{f.name}</p>
                                                    <p className="text-[11px] text-gray-400 dark:text-gray-500">{f.code}</p>
                                                </div>
                                            </div>
                                            {currency === f.code && (
                                                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white grid place-items-center">
                                                    <Check size={14} />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase">Crypto</p>
                                    <button
                                        onClick={copyWalletAddress}
                                        disabled={!user?.walletAddress}
                                        className="inline-flex items-center gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2 py-1 rounded-lg transition-colors disabled:cursor-not-allowed"
                                    >
                                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{wallet}</p>
                                        {user?.walletAddress && (copiedWallet ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-emerald-600 dark:text-emerald-400" />)}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {[{ code: "SOL", name: "Solana" }, { code: "BTC", name: "Bitcoin" }, { code: "ETH", name: "Ethereum" }].map((c) => (
                                        <div key={c.code} className="w-full flex items-center gap-3 rounded-2xl px-3 py-3">
                                            <div className="h-10 w-10 rounded-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-xl shadow-sm">{currencyFlag(c.code)}</div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</p>
                                                <p className="text-[11px] text-gray-400 dark:text-gray-500">{c.code}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
