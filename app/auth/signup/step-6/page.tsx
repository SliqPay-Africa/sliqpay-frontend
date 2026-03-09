"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SignupProgress from "@/components/SignupProgress";
import TransactionPinScreen from "@/components/utilities/TransactionPinScreen";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

export default function Step6() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handlePinSubmit = async (pin: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("sliqpay_token");
      await axios.post(
        `${backendUrl}/user/pin/set`,
        { pin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDone(true);
      // Brief success state then redirect
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to set PIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#f7fbff] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-xl font-extrabold text-green-700">PIN Created!</h2>
          <p className="text-sm text-gray-500 mt-2">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/auth/signup/step-5" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
          <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Skip for now
        </button>
      </div>

      <div className="max-w-md mx-auto mt-6">
        <SignupProgress currentStep={6} totalSteps={6} />
        <p className="text-xs text-gray-600 mt-1">Step 6 of 6 — Almost there!</p>

        <h2 className="mt-6 text-xl font-extrabold">Set Transaction PIN</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your 4-digit PIN is required to confirm every payment. Keep it private.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <TransactionPinScreen
          onBack={() => router.push("/auth/signup/step-5")}
          onSubmit={handlePinSubmit}
          mode="create"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
