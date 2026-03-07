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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { getTransactionsByAccount, Transaction } from "@/lib/accounts";
import { useBalances, useTransactions, useCurrentUser } from "@/lib/api-hooks";
import { motion, AnimatePresence } from "framer-motion";

/* ───── Skeleton ───── */
function DashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="rounded-2xl bg-white h-48 border border-gray-100" />
            <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-[76px] rounded-2xl bg-white border border-gray-100" />
                ))}
            </div>
            <div className="rounded-2xl bg-white p-4 space-y-3 border border-gray-100">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
                            <div className="h-3 w-1/3 bg-gray-100 rounded" />
                        </div>
                        <div className="h-3.5 w-16 bg-gray-100 rounded" />
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
        const t = setTimeout(() => setIsLoading(false), 800);
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

    const quickActions = [
        { label: "Send", icon: <SendIcon size={20} />, path: "/dashboard/send", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Receive", icon: <ReceiveIcon size={20} />, path: "/dashboard/receive", bg: "bg-teal-50", iconColor: "text-teal-600" },
        { label: "Convert", icon: <ConvertIcon size={20} />, path: "/dashboard/convert", bg: "bg-cyan-50", iconColor: "text-cyan-600" },
        { label: "Utilities", icon: <AirtimeIcon size={20} />, path: "/dashboard/utilities", bg: "bg-emerald-50", iconColor: "text-emerald-600" },
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
            {/* Desktop greeting */}
            <div className="hidden lg:flex items-center justify-between mb-1">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Welcome back, {firstName} 👋</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Here&apos;s your financial overview</p>
                </div>
                <button
                    onClick={copyWalletAddress}
                    disabled={!user?.walletAddress}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{wallet}</span>
                    {user?.walletAddress && (copiedWallet ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-emerald-600" />)}
                </button>
            </div>

            {/* ─── Balance Card ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm relative overflow-hidden">
                    {/* Decorative accent */}
                    <div className="absolute -top-20 -right-20 h-44 w-44 rounded-full bg-emerald-500/5 blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-teal-500/5 blur-2xl" />

                    <div className="relative z-10">
                        {/* Top row: currency + eye toggle */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setAccountsOpen(true)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                                <span className="text-sm">{currencyFlag(currency)}</span>
                                <span>{currency} Account</span>
                                <ChevronDown size={12} />
                            </button>
                            <button
                                onClick={() => setShowBalance((v) => !v)}
                                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                {showBalance ? <Eye size={16} className="text-gray-600" /> : <EyeOff size={16} className="text-gray-600" />}
                            </button>
                        </div>

                        {/* Balance */}
                        <div>
                            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-1">Available Balance</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
                                {showBalance ? (
                                    currentBalance !== null ? (
                                        <>{currencySymbol(currency)}{Number(currentBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
                                    ) : (
                                        <span className="inline-block h-9 w-36 rounded-lg bg-gray-100 animate-pulse" />
                                    )
                                ) : (
                                    <span className="text-gray-400">••••••••</span>
                                )}
                            </h2>
                        </div>

                        {/* Income / Expense row */}
                        <div className="flex gap-3 mt-4">
                            <div className="flex-1 rounded-xl bg-emerald-50/60 border border-emerald-100/60 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <ArrowDownLeft size={11} className="text-emerald-600" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">Income</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{showBalance ? `${currencySymbol(currency)}0.00` : "••••"}</p>
                            </div>
                            <div className="flex-1 rounded-xl bg-red-50/60 border border-red-100/60 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                                        <ArrowUpRight size={11} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">Expense</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-900">{showBalance ? `${currencySymbol(currency)}0.00` : "••••"}</p>
                            </div>
                        </div>

                        {/* Currency pills */}
                        {web2Balances && web2Balances.length > 0 && (
                            <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                                {web2Balances.map((bal: any) => (
                                    <button
                                        key={bal.currency}
                                        onClick={() => setCurrency(bal.currency)}
                                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition-all border ${
                                            currency === bal.currency
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : "bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50"
                                        }`}
                                    >
                                        <span className="text-xs">{currencyFlag(bal.currency)}</span>
                                        <span>{bal.currency}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ─── Quick Actions ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                <div className="grid grid-cols-4 gap-2.5">
                    {quickActions.map((a) => (
                        <button
                            key={a.label}
                            onClick={() => router.push(a.path)}
                            className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all active:scale-[0.97]"
                        >
                            <div className={`h-10 w-10 rounded-xl ${a.bg} flex items-center justify-center ${a.iconColor}`}>
                                {a.icon}
                            </div>
                            <span className="text-[11px] font-medium text-gray-700">{a.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ─── Invite Banner ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100/60 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/40">
                            <Gift size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">Invite & Earn</p>
                            <p className="text-xs text-gray-500 mt-0.5">Share SliqPay with friends and earn rewards</p>
                        </div>
                        <ChevronRight size={18} className="text-gray-400 flex-shrink-0" />
                    </div>
                </div>
            </motion.div>

            {/* ─── Two-column: Exchange Rate + Wallet ─── */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Exchange Rate Card */}
                    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} className="text-emerald-600" />
                                <h3 className="text-sm font-semibold text-gray-900">Exchange Rate</h3>
                            </div>
                            <button className="p-1 rounded hover:bg-gray-50 transition-colors">
                                <RefreshCw size={12} className="text-gray-400" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 flex-1 border border-gray-100">
                                <span className="text-sm">🇪🇺</span>
                                <span className="text-xs font-medium text-gray-700">EUR</span>
                            </div>
                            <div className="text-gray-300">
                                <svg width="16" height="14" viewBox="0 0 24 20" fill="none"><path d="M20 5H4l3-3M4 15h16l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-2 flex-1 border border-gray-100">
                                <span className="text-sm">🇳🇬</span>
                                <span className="text-xs font-medium text-gray-700">NGN</span>
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">1.00 EUR = 1,667.649 NGN</p>
                        <button
                            onClick={() => router.push("/dashboard/convert")}
                            className="w-full rounded-xl bg-emerald-600 py-2 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
                        >
                            Convert Currencies
                        </button>
                    </div>

                    {/* Wallet Card */}
                    <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-[10px]">⟠</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Crypto Wallet</h3>
                        </div>
                        <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 mb-3">
                            <p className="text-[11px] text-gray-400">Embedded Wallet</p>
                            <p className="text-xs font-mono font-medium text-gray-700 truncate">{user?.walletAddress || 'Generating...'}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={copyWalletAddress}
                                disabled={!user?.walletAddress}
                                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gray-50 border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                {copiedWallet ? <Check size={12} /> : <Copy size={12} />}
                                {copiedWallet ? "Copied" : "Copy"}
                            </button>
                            {user?.walletAddress && (
                                <button
                                    onClick={() => window.open(`https://testnet.snowtrace.io/address/${user.walletAddress}`, '_blank')}
                                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700 transition-colors"
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
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Recent Transactions</h3>
                        <button
                            onClick={() => router.push("/dashboard/history")}
                            className="text-xs text-emerald-600 font-semibold hover:text-emerald-700"
                        >
                            View all
                        </button>
                    </div>

                    <div className="px-4 pb-4">
                        {loadingWeb2Transactions ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 animate-pulse">
                                        <div className="h-10 w-10 rounded-full bg-gray-100" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="h-3.5 w-2/3 bg-gray-100 rounded" />
                                            <div className="h-3 w-1/3 bg-gray-100 rounded" />
                                        </div>
                                        <div className="h-3.5 w-16 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : web2Transactions && web2Transactions.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {web2Transactions.map((tx: any) => {
                                    const isSender = currentUser && tx.from_user_id === currentUser.id;
                                    const isReceiver = currentUser && tx.to_user_id === currentUser.id;
                                    const txType = tx.type.toLowerCase();

                                    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
                                        send_out: { bg: "bg-red-50", icon: <ArrowUpRight size={16} className="text-red-500" strokeWidth={2} /> },
                                        send_in: { bg: "bg-emerald-50", icon: <ArrowDownLeft size={16} className="text-emerald-600" strokeWidth={2} /> },
                                        convert: { bg: "bg-cyan-50", icon: <Repeat size={16} className="text-cyan-600" strokeWidth={2} /> },
                                        purchase: { bg: "bg-orange-50", icon: <Receipt size={16} className="text-orange-500" strokeWidth={2} /> },
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
                                                <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {new Date(tx.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-sm font-semibold ${isSender ? "text-red-500" : "text-emerald-600"}`}>
                                                    {isSender ? "-" : "+"}{currencySymbol(tx.from_currency)}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                                <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide ${
                                                    tx.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600" : tx.status === "PENDING" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                                }`}>{tx.status}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : transactions.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {transactions.map((t) => (
                                    <div key={t.id} className="flex items-center gap-3 py-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === "receive" ? "bg-emerald-50" : "bg-red-50"}`}>
                                            {t.type === "receive" ? <ReceiveIcon size={16} className="text-emerald-600" strokeWidth={2} /> : <SendIcon size={16} className="text-red-500" strokeWidth={2} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{t.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{t.time}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-semibold text-gray-900">{t.amount}</p>
                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase bg-emerald-50 text-emerald-600 tracking-wide">{t.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto h-14 w-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                                    <Sparkles size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-semibold text-gray-900">No transactions yet</p>
                                <p className="text-xs text-gray-400 mt-1">Send or receive money to get started</p>
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
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setAccountsOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="absolute left-0 right-0 bottom-0 mx-auto w-full max-w-md bg-white shadow-2xl rounded-t-3xl md:rounded-3xl md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="md:hidden flex justify-center pt-3">
                                <div className="h-1 w-10 rounded-full bg-gray-200" />
                            </div>
                            <div className="flex items-center justify-between px-5 pt-4 pb-3">
                                <h3 className="text-base font-bold text-gray-900">Accounts</h3>
                                <button onClick={() => setAccountsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={18} className="text-gray-500" />
                                </button>
                            </div>
                            <div className="px-5 pb-6 max-h-[70vh] overflow-y-auto">
                                <p className="text-[10px] font-semibold text-gray-400 tracking-wider mb-3 uppercase">Fiat Currencies</p>
                                <div className="space-y-1">
                                    {[{ code: "NGN", name: "Nigerian Naira" }, { code: "GHS", name: "Ghanaian Cedi" }, { code: "USD", name: "US Dollar" }].map((f) => (
                                        <button
                                            key={f.code}
                                            onClick={() => { setCurrency(f.code); setAccountsOpen(false); }}
                                            className={`w-full flex items-center justify-between rounded-2xl px-3 py-3 transition-colors ${currency === f.code ? "bg-emerald-50 border border-emerald-100" : "hover:bg-gray-50"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">{currencyFlag(f.code)}</div>
                                                <div className="text-left">
                                                    <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                                                    <p className="text-[11px] text-gray-400">{f.code}</p>
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
                                    <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Crypto</p>
                                    <button
                                        onClick={copyWalletAddress}
                                        disabled={!user?.walletAddress}
                                        className="inline-flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors disabled:cursor-not-allowed"
                                    >
                                        <p className="text-[10px] font-semibold text-emerald-600">{wallet}</p>
                                        {user?.walletAddress && (copiedWallet ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} className="text-emerald-600" />)}
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {[{ code: "SOL", name: "Solana" }, { code: "BTC", name: "Bitcoin" }, { code: "ETH", name: "Ethereum" }].map((c) => (
                                        <div key={c.code} className="w-full flex items-center gap-3 rounded-2xl px-3 py-3">
                                            <div className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-xl shadow-sm">{currencyFlag(c.code)}</div>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                                                <p className="text-[11px] text-gray-400">{c.code}</p>
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

