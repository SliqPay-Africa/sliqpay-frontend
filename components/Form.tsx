"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { z } from "zod";
import { signupSchema, loginSchema, sanitizePhone } from "@/lib/validation/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, User, Phone, AtSign, Gift } from "lucide-react";

type FormInfos = {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  password: string;
  cPassword: string;
  refCode: string;
  sliqId: string;
};

export type FormType = "signup" | "login" | "forgot";

interface FormProp {
  formtype: FormType;
}

export default function Form({ formtype }: FormProp) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formInfos, setFormInfos] = useState<FormInfos>({
        fname: "", lname: "", email: "", phone: "",
        password: "", cPassword: "", refCode: "", sliqId: "",
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const { toast } = useToast();
    const { setUser } = useUser();

    const isLogin = formtype === "login";
    const isSignup = formtype === "signup";
    const isForgot = formtype === "forgot";

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setSuccessMsg(null);
        setFieldErrors({});
        try {
            setLoading(true);
            let payload: any;
            if (isSignup) {
              const parsed = signupSchema.safeParse({ ...formInfos, phone: sanitizePhone(formInfos.phone) });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please fix the highlighted fields");
                return;
              }
              const v = parsed.data;
              payload = { fname: v.fname, lname: v.lname, email: v.email, password: v.password, phone: v.phone || undefined, sliqId: formInfos.sliqId?.trim() || undefined, refCode: formInfos.refCode?.trim() || undefined };
            } else if (isLogin) {
              const parsed = loginSchema.safeParse({ email: formInfos.email, password: formInfos.password });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please fix the highlighted fields");
                return;
              }
              payload = { email: parsed.data.email, password: parsed.data.password };
            } else {
              const emailOnly = z.object({ email: z.string().trim().email("Enter a valid email address") });
              const parsed = emailOnly.safeParse({ email: formInfos.email });
              if (!parsed.success) {
                const fe: Record<string,string> = {};
                const f = parsed.error.flatten();
                Object.entries(f.fieldErrors).forEach(([k,v]) => { if (v && v.length) fe[k] = v[0]!; });
                setFieldErrors(fe);
                setErrorMsg("Please provide a valid email");
                return;
              }
              payload = { email: parsed.data.email };
            }

            const endpoint = isSignup ? '/auth/signup' : isLogin ? '/auth/login' : '/auth/forgotpassword';
            const response = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
            
            if (isForgot) {
              setSuccessMsg('If the email exists, a reset link has been sent.');
              return;
            }
            
            setFormInfos({ fname: "", lname: "", email: "", phone: "", password: "", cPassword: "", refCode: "", sliqId: "" });

            if (response?.user) {
              const userData = {
                sliqId: response.user.sliqId || '',
                email: response.user.email,
                name: `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim(),
                initials: `${response.user.firstName?.[0] || ''}${response.user.lastName?.[0] || ''}`.toUpperCase(),
                userId: response.user.id,
                walletAddress: response.user.walletAddress || undefined,
                walletType: response.user.walletType || undefined,
              };
              localStorage.setItem('sliqpay_user', JSON.stringify(userData));
              if (response?.token) localStorage.setItem('sliqpay_token', response.token);
              document.cookie = `sliqpay_logged_in=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
              setUser(userData);
            }

            if (isSignup) {
              setSuccessMsg('Account created! Setting up your wallet...');
            } else {
              setSuccessMsg('Login successful! Redirecting...');
            }
            setTimeout(() => router.push('/dashboard'), 1000);
        } catch (err: any) {
            const message = err.message || 'Something went wrong';
            toast({ title: "Error", description: message, variant: "destructive" });
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = (field: string) =>
      `w-full rounded-xl px-4 py-3.5 pl-11 outline-none transition-all duration-200 text-sm font-medium bg-gray-50 dark:bg-white/5 border ${
        fieldErrors[field]
          ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
      } text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500`;

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafb] dark:bg-[#080b12]">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/5 via-teal-500/3 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-500/3 rounded-full blur-3xl" />
            </div>

            {/* Top bar with logo */}
            <div className="relative z-10 px-6 pt-6">
                <Link href="/" className="inline-flex items-center gap-2 group">
                    <img src="/Sliqpay visual icon.png" alt="SliqPay" className="w-8 h-8 object-contain" />
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                        SliqPay
                    </span>
                </Link>
            </div>

            {/* Main form area */}
            <div className="relative z-10 flex-1 flex items-center justify-center px-5 py-8">
                <div className="w-full max-w-[420px]">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20 mb-5">
                            {isLogin ? <Lock className="w-6 h-6 text-white" /> : isSignup ? <User className="w-6 h-6 text-white" /> : <Mail className="w-6 h-6 text-white" />}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            {isLogin ? 'Welcome back' : isSignup ? 'Create your account' : 'Reset password'}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            {isLogin ? 'Sign in to access your dashboard' : isSignup ? 'Join thousands using SliqPay for bill payments' : 'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    {/* Error/Success */}
                    {errorMsg && (
                        <div className="mb-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                            {errorMsg}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mb-5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {successMsg}
                        </div>
                    )}

                    {/* Form card */}
                    <form onSubmit={onSubmit} className="bg-white dark:bg-white/[0.02] rounded-2xl border border-gray-200/80 dark:border-white/[0.06] p-6 shadow-sm space-y-4">
                        
                        {/* Name row for signup */}
                        {isSignup && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className={inputClasses('fname')}
                                            placeholder="John"
                                            value={formInfos.fname}
                                            onChange={(e) => setFormInfos({ ...formInfos, fname: e.target.value })}
                                        />
                                    </div>
                                    {fieldErrors.fname && <p className="text-xs text-red-500 mt-1">{fieldErrors.fname}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Last Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            className={inputClasses('lname')}
                                            placeholder="Doe"
                                            value={formInfos.lname}
                                            onChange={(e) => setFormInfos({ ...formInfos, lname: e.target.value })}
                                        />
                                    </div>
                                    {fieldErrors.lname && <p className="text-xs text-red-500 mt-1">{fieldErrors.lname}</p>}
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    className={inputClasses('email')}
                                    placeholder="you@example.com"
                                    value={formInfos.email}
                                    onChange={(e) => setFormInfos({ ...formInfos, email: e.target.value })}
                                />
                            </div>
                            {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                        </div>

                        {/* Phone (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="tel"
                                        className={inputClasses('phone')}
                                        placeholder="+2348012345678"
                                        value={formInfos.phone}
                                        onChange={(e) => setFormInfos({ ...formInfos, phone: e.target.value })}
                                        inputMode="tel"
                                    />
                                </div>
                                {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                            </div>
                        )}

                        {/* SliqID (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                    SliqID <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className={inputClasses('sliqId')}
                                        placeholder="swift_trader"
                                        value={formInfos.sliqId}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '');
                                            setFormInfos({ ...formInfos, sliqId: cleaned.toLowerCase() });
                                        }}
                                        maxLength={30}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        {!isForgot && (
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Password</label>
                                    {isLogin && (
                                        <Link href="/auth/forgotpassword" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`${inputClasses('password')} pr-11`}
                                        placeholder="••••••••"
                                        value={formInfos.password}
                                        onChange={(e) => setFormInfos({ ...formInfos, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        onClick={() => setShowPassword(v => !v)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                            </div>
                        )}

                        {/* Confirm Password (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`${inputClasses('cPassword')} pr-11`}
                                        placeholder="••••••••"
                                        value={formInfos.cPassword}
                                        onChange={(e) => setFormInfos({ ...formInfos, cPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowConfirmPassword(v => !v)}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {fieldErrors.cPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.cPassword}</p>}
                            </div>
                        )}

                        {/* Referral (signup only) */}
                        {isSignup && (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                                    Referral Code <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Gift className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        className={inputClasses('refCode')}
                                        placeholder="REF123"
                                        value={formInfos.refCode}
                                        onChange={(e) => setFormInfos({ ...formInfos, refCode: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white py-3.5 font-semibold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait...</>
                            ) : (
                                <>{isLogin ? 'Sign In' : isSignup ? 'Create Account' : 'Send Reset Link'}<ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                        {isSignup ? (
                            <>Already have an account?{' '}<Link href="/auth/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">Sign in</Link></>
                        ) : isLogin ? (
                            <>Don&apos;t have an account?{' '}<Link href="/auth/signup" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">Sign up</Link></>
                        ) : (
                            <>Remember your password?{' '}<Link href="/auth/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">Sign in</Link></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}