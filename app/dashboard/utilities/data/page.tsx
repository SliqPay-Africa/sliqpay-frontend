"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, User, AlertCircle, Wallet, Banknote, Loader2 } from "lucide-react";
import NetworkPickerSheet, { Network } from "@/components/utilities/NetworkPickerSheet";
import TransactionPinScreen from "@/components/utilities/TransactionPinScreen";
import AirtimeSuccessScreen from "@/components/utilities/AirtimeSuccessScreen";
import { useUser } from "@/contexts/UserContext";
import { createTransaction } from "@/lib/accounts";
import { useExternalWalletPayment } from "@/hooks/useExternalWalletPayment";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

// ─── Data plans per network ──────────────────────────────────────────────────
const DATA_PLANS: Record<string, Array<{ code: string; name: string; amount: number }>> = {
  MTN: [
    { code: "mtn-10mb-100",    name: "100MB – 24hrs",      amount: 100 },
    { code: "mtn-50mb-200",    name: "200MB – 2 days",     amount: 200 },
    { code: "mtn-3gb-1500",    name: "3GB – 30 days",      amount: 1500 },
    { code: "mtn-100mb-1000",  name: "1.5GB – 30 days",    amount: 1000 },
    { code: "mtn-500mb-2000",  name: "4.5GB – 30 days",    amount: 2000 },
    { code: "mtn-3gb-2500",    name: "6GB – 30 days",      amount: 2500 },
    { code: "mtn-data-3000",   name: "8GB – 30 days",      amount: 3000 },
    { code: "mtn-1gb-3500",    name: "10GB – 30 days",     amount: 3500 },
    { code: "mtn-100hr-5000",  name: "15GB – 30 days",     amount: 5000 },
    { code: "mtn-40gb-10000",  name: "40GB – 30 days",     amount: 10000 },
  ],
  AIRTEL: [
    { code: "airt-100mb",    name: "100MB – 24hrs",   amount: 100 },
    { code: "airt-1gb",      name: "1GB – 30 days",   amount: 500 },
    { code: "airt-2gb",      name: "2GB – 30 days",   amount: 1000 },
    { code: "airt-5gb",      name: "5GB – 30 days",   amount: 2000 },
    { code: "airt-10gb",     name: "10GB – 30 days",  amount: 3500 },
  ],
  GLO: [
    { code: "glo-100mb",    name: "100MB – 24hrs",   amount: 100 },
    { code: "glo-1gb-500",  name: "1GB – 30 days",   amount: 500 },
    { code: "glo-2gb",      name: "2.5GB – 30 days", amount: 1000 },
    { code: "glo-5gb",      name: "5GB – 30 days",   amount: 2000 },
    { code: "glo-10gb",     name: "10GB – 30 days",  amount: 3000 },
  ],
  "9MOBILE": [
    { code: "etisalat-100mb", name: "100MB – 24hrs",  amount: 100 },
    { code: "etisalat-1gb",   name: "1GB – 30 days",  amount: 500 },
    { code: "etisalat-2gb",   name: "2GB – 30 days",  amount: 1000 },
    { code: "etisalat-5gb",   name: "5GB – 30 days",  amount: 2000 },
  ],
};

export default function BuyData() {
  const router = useRouter();
  const { balance, refreshAccount, account, user } = useUser();
  const walletPayment = useExternalWalletPayment();

  const [country, setCountry] = useState("");
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<{ code: string; name: string; amount: number } | null>(null);
  const [showPlanSheet, setShowPlanSheet] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"fiat" | "crypto">("fiat");
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  type Stage = "form" | "pin" | "success";
  const [stage, setStage] = useState<Stage>("form");
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkPin = async () => {
      try {
        const token = localStorage.getItem("sliqpay_token");
        const res = await axios.get(`${backendUrl}/user/pin/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHasPin(res.data?.hasPin ?? false);
      } catch {
        setHasPin(false);
      }
    };
    checkPin();
  }, []);

  // Reset plan when network changes
  useEffect(() => {
    setSelectedPlan(null);
  }, [network]);

  const networks: Network[] = [
    { code: "MTN",     name: "MTN",           logo: "/product-logos/mtn.jpg" },
    { code: "AIRTEL",  name: "AIRTEL",         logo: "/product-logos/airtel.jpg" },
    { code: "9MOBILE", name: "9MOBILE (T2)" },
    { code: "GLO",     name: "GLO",            logo: "/product-logos/glo.jpg" },
  ];

  const plans = network ? (DATA_PLANS[network] || []) : [];

  const amount = selectedPlan?.amount || 0;
  const isAmountValid = amount > 0 && (paymentMethod === "crypto" || amount <= balance);
  const isFormValid = country && network && phoneNumber.length >= 10 && selectedPlan && isAmountValid;

  const handleContinue = () => {
    if (!isFormValid) return;
    setShowPreview(true);
  };

  const handleConfirmPreview = () => {
    setStage("pin");
    setShowPreview(false);
  };

  const handlePinSubmit = async (pin: string) => {
    setIsSubmitting(true);
    setPinError(null);
    setCryptoError(null);

    try {
      const token = localStorage.getItem("sliqpay_token");

      // Set or verify PIN
      if (!hasPin) {
        const setPinRes = await axios.post(
          `${backendUrl}/user/pin/set`,
          { pin },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (setPinRes.data?.ok) setHasPin(true);
      } else {
        const verifyRes = await axios.post(
          `${backendUrl}/user/pin/verify`,
          { pin },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!verifyRes.data?.ok) throw new Error("Incorrect PIN");
      }

      if (paymentMethod === "crypto") {
        // 1. Trigger on-chain payment via external wallet
        const txHash = await walletPayment.pay(amount);

        // 2. Show processing screen
        setIsSubmitting(false);
        setIsProcessing(true);

        // 3. Backend verifies on-chain + calls VTPass /data
        const authToken = localStorage.getItem("sliqpay_token");
        const res = await axios.post(
          `${backendUrl}/pay-with-crypto/data`,
          {
            txHash,
            phone: phoneNumber,
            network,
            variationCode: selectedPlan!.code,
            amount,
            sliqId: user?.sliqId || "unknown",
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        setIsProcessing(false);
        if (res.data?.success) {
          setStage("success");
        } else {
          throw new Error(res.data?.error || "Crypto data payment failed");
        }
      } else {
        // Fiat: verify balance then debit and call VTPass
        if (amount > balance) {
          throw new Error('Insufficient balance. Please top up or use Crypto payment.');
        }
        if (account?.id) {
          await createTransaction({
            accountId: account.id,
            amount,
            type: "debit",
            description: `Data purchase – ${networks.find((n) => n.code === network)?.name || network} ${selectedPlan!.name} (${phoneNumber})`,
          });
        }
        // Fire-and-forget VTPass fulfillment
        const authToken = localStorage.getItem("sliqpay_token");
        await axios.post(
          `${backendUrl}/pay-with-crypto/fiat/data`,
          {
            phone: phoneNumber,
            network,
            variationCode: selectedPlan!.code,
            amount,
            sliqId: user?.sliqId || "unknown",
          },
          { headers: { Authorization: `Bearer ${authToken}` } }
        ).catch((e) => console.warn("VTPass fiat data call failed silently:", e.message));

        setTimeout(() => {
          setIsSubmitting(false);
          setStage("success");
        }, 1000);
      }
    } catch (error: any) {
      console.error("Failed:", error);
      const msg = error?.response?.data?.error || error?.message || "Failed";
      if (msg.toLowerCase().includes("pin")) {
        setPinError(msg);
        setIsSubmitting(false);
        return;
      }
      if (paymentMethod === "crypto") {
        setCryptoError(msg);
        setIsSubmitting(false);
        setIsProcessing(false);
        setStage("form");
        setShowPreview(false);
      } else {
        setCryptoError(msg);
        setIsSubmitting(false);
      }
    }
  };

  if (stage === "pin") {
    return (
      <TransactionPinScreen
        onBack={() => { setStage("form"); setPinError(null); }}
        onSubmit={handlePinSubmit}
        mode={hasPin ? "enter" : "create"}
        error={pinError}
        isLoading={isSubmitting}
      />
    );
  }

  if (stage === "success") {
    return (
      <AirtimeSuccessScreen
        amount={amount}
        phone={phoneNumber}
        networkName={networks.find((n) => n.code === network)?.name || network}
        networkLogo={networks.find((n) => n.code === network)?.logo}
        orderType="DATA"
        planName={selectedPlan?.name}
        isProcessing={isProcessing}
        onDone={async () => {
          await refreshAccount();
          router.push("/dashboard");
        }}
      />
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white pb-6">
        <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center gap-4 px-4 py-4">
            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Preview Transaction</h1>
          </div>
        </header>

        <div className="px-4 py-6 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-gray-600 mb-2">Data Bundle</h2>
            <div className="inline-block bg-cyan-100 px-8 py-4 rounded-full">
              <span className="text-3xl font-bold text-gray-900">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="text-sm font-semibold text-gray-900">{phoneNumber}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-semibold text-gray-900">{networks.find((n) => n.code === network)?.name || network}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Plan</span>
              <span className="text-sm font-semibold text-gray-900">{selectedPlan?.name}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-semibold text-gray-900">₦{amount.toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className={`text-sm font-semibold ${paymentMethod === "crypto" ? "text-emerald-600" : "text-gray-900"}`}>
                {paymentMethod === "crypto" ? "🔗 Crypto (AVAX)" : "💵 Fiat Balance"}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmPreview}
            className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-6">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Buy Data</h1>
        </div>
      </header>

      <div className="px-4 py-6 max-w-md mx-auto space-y-5">
        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
            >
              <option value="" disabled hidden>Select Country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
        </div>

        {/* Network */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Network</label>
          <button
            type="button"
            onClick={() => setNetworkSheetOpen(true)}
            className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <div className="flex items-center gap-3">
              {network && (
                <div className="h-7 w-7 rounded-lg bg-white border grid place-items-center overflow-hidden">
                  {networks.find((n) => n.code === network)?.logo ? (
                    <img src={networks.find((n) => n.code === network)!.logo!} alt={network} className="h-5 w-5 object-contain" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-700">{network}</span>
                  )}
                </div>
              )}
              <span className={`text-sm ${network ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                {network ? networks.find((n) => n.code === network)?.name : "Select Network"}
              </span>
            </div>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg">
              <User size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Data Plan */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Data Plan</label>
          <button
            type="button"
            onClick={() => network && setShowPlanSheet(true)}
            disabled={!network}
            className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 border ${
              network ? "bg-gray-100 border-gray-200" : "bg-gray-50 border-gray-200 cursor-not-allowed"
            }`}
          >
            <span className={`text-sm ${selectedPlan ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
              {selectedPlan ? `${selectedPlan.name} – ₦${selectedPlan.amount.toLocaleString()}` : network ? "Select a data plan" : "Select network first"}
            </span>
            <ChevronDown size={20} className="text-gray-500" />
          </button>
          {!isAmountValid && selectedPlan && paymentMethod === "fiat" && (
            <div className="mt-2 flex items-start gap-2 text-red-500">
              <AlertCircle size={16} className="mt-0.5" />
              <p className="text-xs">Insufficient balance. Top up your fiat account or switch to Crypto.</p>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setPaymentMethod("fiat"); setCryptoError(null); }}
              className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                paymentMethod === "fiat"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Banknote size={18} />
              Fiat Balance
            </button>
            <button
              type="button"
              onClick={() => { setPaymentMethod("crypto"); setCryptoError(null); }}
              className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                paymentMethod === "crypto"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Wallet size={18} />
              Crypto (AVAX)
            </button>
          </div>
          {paymentMethod === "crypto" && walletPayment.isConnected && walletPayment.walletAddress && (
            <p className="text-xs text-gray-500 mt-2">
              Paying from wallet: <span className="font-mono">{walletPayment.walletAddress.slice(0, 6)}...{walletPayment.walletAddress.slice(-4)}</span>
            </p>
          )}
          {paymentMethod === "crypto" && !walletPayment.isConnected && (
            <p className="text-xs text-amber-600 mt-2">
              Your external wallet (MetaMask, etc.) will be prompted when you pay.
            </p>
          )}
          {cryptoError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600">{cryptoError}</p>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full font-semibold py-4 rounded-xl transition-all ${
            isFormValid ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      <NetworkPickerSheet
        open={networkSheetOpen}
        onClose={() => setNetworkSheetOpen(false)}
        selected={network}
        networks={networks}
        onSelect={(code) => { setNetwork(code); setNetworkSheetOpen(false); }}
      />

      {/* Data Plan Sheet */}
      {showPlanSheet && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowPlanSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] flex flex-col">
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3">
              <h2 className="text-base font-bold text-gray-900">Select Data Plan</h2>
              <p className="text-xs text-gray-500 mt-0.5">{networks.find((n) => n.code === network)?.name}</p>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              {plans.map((plan) => (
                <button
                  key={plan.code}
                  onClick={() => { setSelectedPlan(plan); setShowPlanSheet(false); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedPlan?.code === plan.code
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">₦{plan.amount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
