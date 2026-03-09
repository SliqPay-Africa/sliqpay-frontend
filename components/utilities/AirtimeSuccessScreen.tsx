"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, Loader2 } from "lucide-react";

type Props = {
  amount: number;
  phone: string;
  networkName: string;
  networkLogo?: string;
  onDone?: () => void;
  orderType?: string;         // AIRTIME | DATA | ELECTRICITY | CABLE TV
  detailLabel?: string;       // Phone Number | Meter Number | Smart Card Number
  planName?: string;          // e.g. "6GB – 30 days" for data
  electricityToken?: string;  // token returned by VTPass for electricity
  isProcessing?: boolean;     // show a "VTPass is processing…" skeleton
};

export default function AirtimeSuccessScreen({
  amount,
  phone,
  networkName,
  networkLogo,
  onDone,
  orderType = "AIRTIME",
  detailLabel = "Phone Number",
  planName,
  electricityToken,
  isProcessing = false,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(7);

  // Auto-redirect after 7 s
  useEffect(() => {
    if (isProcessing) return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          onDone?.();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isProcessing, onDone]);

  const copyToken = () => {
    if (!electricityToken) return;
    navigator.clipboard.writeText(electricityToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ─── Processing skeleton ──────────────────────────────────────────────────
  if (isProcessing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 gap-6">
        <div className="h-20 w-20 rounded-full bg-cyan-50 grid place-items-center">
          <Loader2 size={36} className="text-cyan-500 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">Processing Payment…</p>
          <p className="text-sm text-gray-500 mt-1">
            On-chain payment confirmed. Fulfilling your {orderType.toLowerCase()} purchase via VTPass…
          </p>
        </div>
        <div className="w-full max-w-sm bg-gray-100 rounded-xl h-2">
          <div className="bg-cyan-500 h-2 rounded-xl animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="px-4 pt-10 max-w-md mx-auto text-center">

        {/* Animated success badge */}
        <div className="mx-auto h-24 w-24 relative grid place-items-center">
          <span className="absolute inset-0 rounded-full bg-emerald-100 animate-[ring_1.6s_ease-out_infinite]" />
          <span className="absolute inset-0 rounded-full bg-emerald-50 animate-[ring_1.6s_ease-out_infinite_0.3s]" />
          <div className="absolute inset-2 rounded-full bg-emerald-50" />
          <div className="relative z-10 h-14 w-14 rounded-full bg-emerald-500 text-white grid place-items-center animate-[pop_420ms_cubic-bezier(.2,.8,.2,1)_forwards]">
            <Check size={28} strokeWidth={3} />
          </div>
          {/* Sparkle dots */}
          <div className="absolute inset-0 z-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-70 animate-[spark_1.8s_ease-in-out_infinite]"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: `rotate(${i * 45}deg) translate(36px)`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Amount + network pill */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 bg-white">
          <span className="text-emerald-600 font-extrabold">
            ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
            {networkLogo ? (
              <Image src={networkLogo} alt={networkName} width={20} height={20} className="object-contain rounded-full" />
            ) : (
              <span className="h-5 w-5 rounded-full bg-emerald-100" />
            )}
            <span className="text-gray-900 font-medium">{networkName}</span>
          </span>
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-gray-900">Payment Successful! 🎉</h2>
        <p className="text-sm text-gray-500 mt-1">Your {orderType.toLowerCase()} has been delivered.</p>

        {/* Details card */}
        <div className="mt-6 rounded-2xl border bg-white text-left divide-y divide-gray-100">
          <div className="px-4 py-3 text-sm font-semibold text-gray-900">Transaction Details</div>

          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">{detailLabel}</span>
            <span className="font-semibold text-gray-900">{phone}</span>
          </div>

          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Order Type</span>
            <span className="font-extrabold text-gray-900">{orderType}</span>
          </div>

          {planName && (
            <div className="px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">Plan</span>
              <span className="font-semibold text-gray-900">{planName}</span>
            </div>
          )}

          {electricityToken && (
            <div className="px-4 py-3 flex items-start justify-between text-sm gap-3">
              <div>
                <span className="text-gray-500 block mb-0.5">Electricity Token</span>
                <span className="font-mono font-bold text-gray-900 text-base tracking-wide">{electricityToken}</span>
              </div>
              <button
                onClick={copyToken}
                className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition-colors mt-1 flex-shrink-0"
              >
                <Copy size={13} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}

          <div className="px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <Check size={14} strokeWidth={3} />
              Completed
            </span>
          </div>
        </div>

        {/* Countdown + Done button */}
        <div className="mt-8 space-y-3">
          <button
            onClick={onDone}
            className="w-full rounded-xl bg-green-600 text-white py-4 font-semibold hover:bg-green-700 transition-colors"
          >
            Back to Dashboard
          </button>
          <p className="text-xs text-gray-400">
            Redirecting automatically in {countdown}s…
          </p>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes ring {
          0% { transform: scale(0.6); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes pop {
          0% { transform: scale(0.8); }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes spark {
          0%, 100% { transform: translate(-50%, -50%) rotate(var(--r,0)) translate(32px); opacity: .0; }
          20% { opacity: .9; }
          60% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
