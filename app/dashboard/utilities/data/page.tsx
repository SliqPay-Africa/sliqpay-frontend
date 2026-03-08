"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, User, AlertCircle, Wallet, Banknote } from "lucide-react";
import NetworkPickerSheet, { Network } from "@/components/utilities/NetworkPickerSheet";
import TransactionPinScreen from "@/components/utilities/TransactionPinScreen";
import AirtimeSuccessScreen from "@/components/utilities/AirtimeSuccessScreen";
import { useUser } from "@/contexts/UserContext";
import { createTransaction } from "@/lib/accounts";
import { useExternalWalletPayment } from "@/hooks/useExternalWalletPayment";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

export default function BuyData() {
  const router = useRouter();
  const { balance, refreshAccount, account, user } = useUser();
  const walletPayment = useExternalWalletPayment();
  const [country, setCountry] = useState("");
  const [network, setNetwork] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  type Stage = 'form' | 'pin' | 'success';
  const [stage, setStage] = useState<Stage>('form');
  const [networkSheetOpen, setNetworkSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const minAmount = 5;
  const maxAmount = 50000;

  // Check if user has a transaction PIN set
  useEffect(() => {
    const checkPin = async () => {
      try {
        const token = localStorage.getItem("sliqpay_token");
        const res = await axios.get(`${backendUrl}/user/pin/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasPin(res.data?.hasPin ?? false);
      } catch {
        setHasPin(false);
      }
    };
    checkPin();
  }, []);

  const networks: Network[] = [
    { code: "MTN", name: "MTN", logo: "/product-logos/mtn.jpg" },
    { code: "AIRTEL", name: "AIRTEL", logo: "/product-logos/airtel.jpg" },
    { code: "9MOBILE", name: "9MOBILE (T2)" },
    { code: "GLO", name: "GLO", logo: "/product-logos/glo.jpg" },
  ];

  const isAmountInRange = amount && !isNaN(Number(amount)) && Number(amount) >= minAmount && Number(amount) <= maxAmount;
  const isAmountValid = isAmountInRange && (paymentMethod === 'crypto' || Number(amount) <= balance);
  const isFormValid = country && network && phoneNumber.length >= 10 && isAmountValid;

  const handleContinue = () => {
    if (!isFormValid) return;
    setShowPreview(true);
  };

  const handleConfirmPreview = () => {
    setStage('pin');
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
        if (!verifyRes.data?.ok) throw new Error('Incorrect PIN');
      }

      if (paymentMethod === 'crypto') {
        // External wallet — prompt user's wallet to send AVAX
        const txHash = await walletPayment.pay(Number(amount));
        
        // Send txHash to backend for verification + VTPass
        const res = await axios.post(
          `${backendUrl}/pay-with-crypto/airtime`,
          {
            txHash,
            phone: phoneNumber,
            network,
            amount: Number(amount),
            sliqId: user?.sliqId || 'unknown',
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data?.success) {
          setIsSubmitting(false);
          setStage('success');
        } else {
          throw new Error(res.data?.error || 'Crypto payment failed');
        }
      } else {
        // Fiat: Create debit transaction for data purchase
        if (account?.id) {
          await createTransaction({
            accountId: account.id,
            amount: Number(amount),
            type: 'debit',
            description: `Data purchase - ${networks.find(n => n.code === network)?.name || network} (${phoneNumber})`
          });
        }
        setTimeout(() => { setIsSubmitting(false); setStage('success'); }, 1000);
      }
    } catch (error: any) {
      console.error("Failed:", error);
      const msg = error?.response?.data?.error || error?.message || 'Failed';
      if (msg.includes('PIN')) {
        setPinError(msg);
        setIsSubmitting(false);
        return;
      }
      if (paymentMethod === 'crypto') {
        setCryptoError(msg);
        setIsSubmitting(false);
        setStage('form');
        setShowPreview(false);
      } else {
        setTimeout(() => { setIsSubmitting(false); setStage('success'); }, 1000);
      }
    }
  };

  if (stage === 'pin') {
    return (
      <TransactionPinScreen
        onBack={() => { setStage('form'); setPinError(null); }}
        onSubmit={handlePinSubmit}
        mode={hasPin ? "enter" : "create"}
        error={pinError}
        isLoading={isSubmitting}
      />
    );
  }

  if (stage === 'success') {
    return (
      <AirtimeSuccessScreen
        amount={Number(amount || 0)}
        phone={phoneNumber}
        networkName={networks.find(n => n.code === network)?.name || network}
        networkLogo={networks.find(n => n.code === network)?.logo}
        orderType="DATA"
        onDone={async () => {
          await refreshAccount();
          router.push('/dashboard');
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
            <h2 className="text-gray-600 mb-2">Data</h2>
            <div className="inline-block bg-cyan-100 px-8 py-4 rounded-full">
              <span className="text-3xl font-bold text-gray-900">₦{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Phone Number</span>
              <span className="text-sm font-semibold text-gray-900">{phoneNumber}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-semibold text-gray-900">₦{Number(amount).toLocaleString()}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Network</span>
              <span className="text-sm font-semibold text-gray-900">{networks.find(n => n.code === network)?.name || network}</span>
            </div>
          </div>

          <button onClick={handleConfirmPreview} className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors">
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

        {/* Network (sheet trigger) */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Network</label>
          <button
            type="button"
            onClick={() => setNetworkSheetOpen(true)}
            className="w-full flex items-center justify-between bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <div className="flex items-center gap-3">
              {network ? (
                <div className="h-7 w-7 rounded-lg bg-white border grid place-items-center overflow-hidden">
                  {networks.find(n => n.code === network)?.logo ? (
                    <img src={networks.find(n => n.code === network)!.logo!} alt={network} className="h-5 w-5 object-contain" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-700">{network}</span>
                  )}
                </div>
              ) : null}
              <span className={`text-sm ${network ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{network ? networks.find(n => n.code === network)?.name : 'Select Network'}</span>
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
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg">
              <User size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">Amount</label>
            <span className="text-sm text-gray-400">Balance:₦{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="₦5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <div className="mt-3 flex items-start gap-2 text-gray-500">
            <AlertCircle size={16} className="mt-0.5" />
            <p className="text-xs">Please enter an amount between ₦{minAmount} and ₦{maxAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Payment Method</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setPaymentMethod('fiat'); setCryptoError(null); }}
              className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                paymentMethod === 'fiat'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Banknote size={18} />
              Fiat Balance
            </button>
            <button
              type="button"
              onClick={() => { setPaymentMethod('crypto'); setCryptoError(null); }}
              className={`flex items-center gap-2 justify-center py-3 px-4 rounded-xl border-2 transition-all text-sm font-semibold ${
                paymentMethod === 'crypto'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Wallet size={18} />
              Crypto (AVAX)
            </button>
          </div>
          {paymentMethod === 'crypto' && walletPayment.isConnected && walletPayment.walletAddress && (
            <p className="text-xs text-gray-500 mt-2">
              Paying from wallet: <span className="font-mono">{walletPayment.walletAddress.slice(0, 6)}...{walletPayment.walletAddress.slice(-4)}</span>
            </p>
          )}
          {paymentMethod === 'crypto' && !walletPayment.isConnected && (
            <p className="text-xs text-amber-600 mt-2">
              Your external wallet (MetaMask, Phantom, etc.) will be prompted when you pay.
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
            isFormValid ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
    </div>
  );
}
