"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { z } from "zod";
import { signupSchema, loginSchema, sanitizePhone } from "@/lib/validation/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { Eye, EyeOff, ArrowRight, Loader2, Mail, Lock, User, Phone, AtSign, Gift } from "lucide-react";
import Link from "next/link";

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
  const [showCPassword, setShowCPassword] = useState(false);
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

  const heading = isLogin
    ? { title: "Welcome back", sub: "Sign in to your SliqPay account" }
    : isSignup
    ? { title: "Create account", sub: "Join thousands using SliqPay across Africa" }
    : { title: "Reset password", sub: "We'll send you a reset link" };

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
          const fe: Record<string, string> = {};
          const f = parsed.error.flatten();
          Object.entries(f.fieldErrors).forEach(([k, v]) => { if (v && v.length) fe[k] = v[0]!; });
          setFieldErrors(fe);
          setErrorMsg("Please fix the highlighted fields");
          return;
        }
        const v = parsed.data;
        payload = { fname: v.fname, lname: v.lname, email: v.email, password: v.password, phone: v.phone || undefined, sliqId: formInfos.sliqId?.trim() || undefined, refCode: formInfos.refCode?.trim() || undefined };
      } else if (isLogin) {
        const parsed = loginSchema.safeParse({ email: formInfos.email, password: formInfos.password });
        if (!parsed.success) {
          const fe: Record<string, string> = {};
          const f = parsed.error.flatten();
          Object.entries(f.fieldErrors).forEach(([k, v]) => { if (v && v.length) fe[k] = v[0]!; });
          setFieldErrors(fe);
          setErrorMsg("Please fix the highlighted fields");
          return;
        }
        payload = { email: parsed.data.email, password: parsed.data.password };
      } else {
        const emailOnly = z.object({ email: z.string().trim().email("Enter a valid email address") });
        const parsed = emailOnly.safeParse({ email: formInfos.email });
        if (!parsed.success) {
          const fe: Record<string, string> = {};
          const f = parsed.error.flatten();
          Object.entries(f.fieldErrors).forEach(([k, v]) => { if (v && v.length) fe[k] = v[0]!; });
          setFieldErrors(fe);
          setErrorMsg("Please provide a valid email");
          return;
        }
        payload = { email: parsed.data.email };
      }

      const endpoint = isSignup ? '/auth/signup' : isLogin ? '/auth/login' : '/auth/forgotpassword';
      const response = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });

      if (isForgot) {
        setSuccessMsg('Check your email for a password reset link.');
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

      setSuccessMsg(isSignup ? 'Account created! Redirecting...' : 'Welcome back! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: any) {
      const message = err.message || 'Something went wrong';
      toast({ title: "Error", description: message, variant: "destructive" });
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full bg-gray-50 dark:bg-white/[0.04] border ${
      fieldErrors[field]
        ? "border-red-400 dark:border-red-500/50"
        : "border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/50"
    } rounded-xl px-4 py-3 pl-11 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all text-sm`;

  const labelCls = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 dark:from-[#080b12] dark:via-[#0d1117] dark:to-[#080b12] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* BG Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/3 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 relative z-10">
        <img src="/Sliqpay visual icon.png" alt="SliqPay" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          SliqPay
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-6 sm:p-8 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">{heading.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{heading.sub}</p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400">
              {successMsg}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* SignUp: First & Last Name side by side */}
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>First Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={inputCls("fname")}
                      placeholder="John"
                      value={formInfos.fname}
                      onChange={(e) => setFormInfos({ ...formInfos, fname: e.target.value })}
                    />
                  </div>
                  {fieldErrors.fname && <p className="text-xs text-red-500 mt-1">{fieldErrors.fname}</p>}
                </div>
                <div>
                  <label className={labelCls}>Last Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className={inputCls("lname")}
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
              <label className={labelCls}>Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" className={inputCls("email")} placeholder="you@example.com"
                  value={formInfos.email} onChange={(e) => setFormInfos({ ...formInfos, email: e.target.value })} />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            {/* SignUp: Phone */}
            {isSignup && (
              <div>
                <label className={labelCls}>Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" className={inputCls("phone")} placeholder="+2348012345678"
                    value={formInfos.phone} onChange={(e) => setFormInfos({ ...formInfos, phone: e.target.value })}
                    inputMode="tel" autoComplete="tel" />
                </div>
                {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
              </div>
            )}

            {/* SignUp: SliqID */}
            {isSignup && (
              <div>
                <label className={labelCls}>SliqID <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <div className="relative">
                  <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" className={inputCls("sliqId")} placeholder="swift_trader"
                    value={formInfos.sliqId}
                    onChange={(e) => setFormInfos({ ...formInfos, sliqId: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() })}
                    maxLength={30} />
                </div>
              </div>
            )}

            {/* Password */}
            {!isForgot && (
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className={inputCls("password")}
                    placeholder="••••••••"
                    value={formInfos.password}
                    onChange={(e) => setFormInfos({ ...formInfos, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>
            )}

            {/* SignUp: Confirm Password */}
            {isSignup && (
              <div>
                <label className={labelCls}>Confirm Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showCPassword ? "text" : "password"}
                    className={inputCls("cPassword")}
                    placeholder="••••••••"
                    value={formInfos.cPassword}
                    onChange={(e) => setFormInfos({ ...formInfos, cPassword: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowCPassword(!showCPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    {showCPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.cPassword && <p className="text-xs text-red-500 mt-1">{fieldErrors.cPassword}</p>}
              </div>
            )}

            {/* SignUp: Referral Code */}
            {isSignup && (
              <div>
                <label className={labelCls}>Referral Code <span className="text-gray-400 font-normal normal-case">(optional)</span></label>
                <div className="relative">
                  <Gift size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" className={inputCls("refCode")} placeholder="REF123"
                    value={formInfos.refCode} onChange={(e) => setFormInfos({ ...formInfos, refCode: e.target.value })} />
                </div>
              </div>
            )}

            {/* Login: Forgot Password link */}
            {isLogin && (
              <div className="flex justify-end">
                <Link href="/auth/forgotpassword" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-white font-semibold py-3.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Please wait...</>
              ) : (
                <>{isLogin ? "Sign In" : isSignup ? "Create Account" : "Send Reset Link"}<ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {isSignup ? (
              <p>Already have an account? <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Sign in</Link></p>
            ) : isLogin ? (
              <p>Don&apos;t have an account? <Link href="/auth/signup" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Sign up</Link></p>
            ) : (
              <p>Remember your password? <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Sign in</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}