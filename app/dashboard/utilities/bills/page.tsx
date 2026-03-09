"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, X, Check, Wallet, Banknote } from "lucide-react";
import TransactionPinScreen from "@/components/utilities/TransactionPinScreen";
import AirtimeSuccessScreen from "@/components/utilities/AirtimeSuccessScreen";
import { useUser } from "@/contexts/UserContext";
import { createTransaction } from "@/lib/accounts";
import { useExternalWalletPayment } from "@/hooks/useExternalWalletPayment";
import axios from "axios";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

type BillCategory = "Electricity" | "Cable TV" | "";

interface Biller {
  id: string;
  name: string;
  logo: string;
}

export default function PayBills() {
  const router = useRouter();
  const { balance, refreshAccount, account, user } = useUser();
  const walletPayment = useExternalWalletPayment();
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState<BillCategory>("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBillerModal, setShowBillerModal] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
  
  // Electricity specific fields
  const [meterNumber, setMeterNumber] = useState("");
  const [electricityAmount, setElectricityAmount] = useState("");
  
  // Cable TV specific fields
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [cryptoError, setCryptoError] = useState<string | null>(null);
  type Stage = 'form' | 'pin' | 'success';
  const [stage, setStage] = useState<Stage>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [electricityToken, setElectricityToken] = useState<string | undefined>(undefined);

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

  const electricityBillers: Biller[] = [
    { id: "abuja",        name: "Abuja Electric (AEDC)",   logo: "AEDC" },
    { id: "benin",        name: "Benin Electric (BEDC)",   logo: "BEDC" },
    { id: "enugu",        name: "Enugu Electric (EEDC)",   logo: "EEDC" },
    { id: "ibadan",       name: "Ibadan Electric (IBEDC)", logo: "IBEDC" },
    { id: "kaduna",       name: "Kaduna Electric (KAEDCO)",logo: "KEDC" },
    { id: "eko",          name: "Eko Electric (EKEDC)",    logo: "EKEDC" },
    { id: "ikeja",        name: "Ikeja Electric (IKEDC)",  logo: "IKEDC" },
    { id: "portharcourt", name: "Port Harcourt Electric",  logo: "PHED" },
    { id: "jos",          name: "Jos Electric (JED)",      logo: "JED" },
    { id: "kano",         name: "Kano Electric (KEDCO)",   logo: "KEDCO" },
  ];

  const cableTvBillers: Biller[] = [
    { id: "dstv", name: "Nigeria DSTV", logo: "DSTV" },
    { id: "gotv", name: "Nigeria GOtv", logo: "GOtv" },
    { id: "startimes", name: "Nigeria StarTimes", logo: "Star" },
    { id: "showmax", name: "Nigeria Showmax", logo: "Show" },
  ];

  // VTPass variation_code → name, price (from VTPass sandbox /service-variations)
  const cableTvPackages: Record<string, Array<{ id: string; name: string; price: number }>> = {
    dstv: [
      { id: "dstv-padi",         name: "DStv Padi",           price: 1850 },
      { id: "dstv-yanga",        name: "DStv Yanga",          price: 2565 },
      { id: "dstv-confam",       name: "DStv Confam",         price: 4615 },
      { id: "dstv79",            name: "DStv Compact",        price: 7900 },
      { id: "dstv7",             name: "DStv Compact Plus",   price: 12400 },
      { id: "dstv3",             name: "DStv Premium",        price: 18400 },
    ],
    gotv: [
      { id: "gotv-smallie",      name: "GOtv Smallie",        price: 1575 },
      { id: "gotv-joli",         name: "GOtv Joli",           price: 2460 },
      { id: "gotv-jolli",        name: "GOtv Jolli",          price: 3300 },
      { id: "gotv-max",          name: "GOtv Max",            price: 4150 },
      { id: "gotv-supa",         name: "GOtv Supa",           price: 5500 },
    ],
    startimes: [
      { id: "nova",              name: "StarTimes Nova",      price: 1200 },
      { id: "basic",             name: "StarTimes Basic",     price: 1850 },
      { id: "smart",             name: "StarTimes Smart",     price: 2200 },
      { id: "classic",           name: "StarTimes Classic",   price: 3200 },
      { id: "super",             name: "StarTimes Super",     price: 4900 },
    ],
    showmax: [
      { id: "showmax-mobile",    name: "Showmax Mobile",      price: 1450 },
      { id: "showmax-standard",  name: "Showmax Standard",    price: 2900 },
      { id: "showmax-pro",       name: "Showmax Pro",         price: 6300 },
    ],
  };

  const currentBillers = category === "Electricity" ? electricityBillers : category === "Cable TV" ? cableTvBillers : [];
  const currentPackages = selectedBiller ? cableTvPackages[selectedBiller.id] || [] : [];
  const selectedPkg = currentPackages.find(pkg => pkg.id === selectedPackage);

  // Progressive enablement flags
  const isCategoryValid = !!category;
  const isBillerValid = !!selectedBiller;
  const isMeterValid = category === 'Electricity' ? meterNumber.length >= 10 : false;
  const isPackageValid = category === 'Cable TV' ? !!selectedPackage : false;
  const isSmartCardValid = category === 'Cable TV' ? smartCardNumber.length >= 10 : false;

  // Form validation
  const isElectricityFormValid = category === "Electricity" && selectedBiller && meterNumber.length >= 10 && electricityAmount && Number(electricityAmount) > 0 && (paymentMethod === 'crypto' || Number(electricityAmount) <= balance);
  const isCableTvFormValid = category === "Cable TV" && selectedBiller && selectedPackage && smartCardNumber.length >= 10 && selectedPkg && (paymentMethod === 'crypto' || selectedPkg.price <= balance);
  const isFormValid = isElectricityFormValid || isCableTvFormValid;

  const handleSelectBiller = (biller: Biller) => {
    setSelectedBiller(biller);
    setShowBillerModal(false);
    // Reset form fields when biller changes
    setMeterNumber("");
    setElectricityAmount("");
    setSmartCardNumber("");
    setSelectedPackage("");
  };

  const handleContinue = () => {
    if (!isFormValid) return;
    setShowPreview(true);
  };

  const handleConfirm = () => {
    // Move to PIN stage
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

      const billAmount = category === "Electricity" ? Number(electricityAmount) : (selectedPkg?.price || 0);
      const description = category === "Electricity"
        ? `Electricity – ${selectedBiller?.name || ""} (${meterNumber})`
        : `Cable TV – ${selectedBiller?.name || ""} – ${selectedPkg?.name || ""} (${smartCardNumber})`;

      if (paymentMethod === 'crypto') {
        // 1. Trigger on-chain payment via external wallet
        const txHash = await walletPayment.pay(billAmount);

        // 2. Show processing screen while VTPass runs
        setIsSubmitting(false);
        setIsProcessing(true);

        const authToken = localStorage.getItem("sliqpay_token");

        if (category === 'Electricity') {
          // 2a. Electricity: send to /pay-with-crypto/electricity
          const res = await axios.post(
            `${backendUrl}/pay-with-crypto/electricity`,
            {
              txHash,
              meterNumber,
              billerId: selectedBiller?.id || '',
              meterType: 'prepaid',
              amount: billAmount,
              phone: meterNumber,
              sliqId: user?.sliqId || 'unknown',
            },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          if (!res.data?.success) throw new Error(res.data?.error || 'Electricity payment failed');
          if (res.data?.token) setElectricityToken(res.data.token);
        } else {
          // 2b. Cable TV: send to /pay-with-crypto/cable-tv
          const res = await axios.post(
            `${backendUrl}/pay-with-crypto/cable-tv`,
            {
              txHash,
              smartCardNumber,
              billerId: selectedBiller?.id || '',
              variationCode: selectedPkg?.id || '',
              amount: billAmount,
              phone: smartCardNumber,
              sliqId: user?.sliqId || 'unknown',
            },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          if (!res.data?.success) throw new Error(res.data?.error || 'Cable TV payment failed');
        }

        setIsProcessing(false);
        setStage('success');
      } else {
        // Fiat: validate balance, deduct, then fulfil via VTPass fiat endpoint
        if (billAmount > balance) {
          throw new Error('Insufficient balance. Please top up or use Crypto payment.');
        }
        if (account?.id) {
          await createTransaction({
            accountId: account.id,
            amount: billAmount,
            type: 'debit',
            description,
          });
        }

        const authToken = localStorage.getItem("sliqpay_token");
        // Fire-and-forget VTPass fulfillment
        if (category === 'Electricity') {
          axios.post(
            `${backendUrl}/pay-with-crypto/fiat/electricity`,
            { meterNumber, billerId: selectedBiller?.id || '', meterType: 'prepaid', amount: billAmount, phone: meterNumber },
            { headers: { Authorization: `Bearer ${authToken}` } }
          ).then(r => { if (r.data?.token) setElectricityToken(r.data.token); })
           .catch((e) => console.warn('VTPass fiat electricity call failed silently:', e.message));
        } else {
          axios.post(
            `${backendUrl}/pay-with-crypto/fiat/cable-tv`,
            { smartCardNumber, billerId: selectedBiller?.id || '', variationCode: selectedPkg?.id || '', amount: billAmount, phone: smartCardNumber },
            { headers: { Authorization: `Bearer ${authToken}` } }
          ).catch((e) => console.warn('VTPass fiat cable TV call failed silently:', e.message));
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
        setIsProcessing(false);
        setStage('form');
        setShowPreview(false);
      } else {
        setCryptoError(msg);
        setIsSubmitting(false);
      }
    }
  };

  if (stage === 'pin') {
    return (
      <TransactionPinScreen
        onBack={() => { setStage('form'); setShowPreview(false); setPinError(null); }}
        onSubmit={handlePinSubmit}
        mode={hasPin ? "enter" : "create"}
        error={pinError}
        isLoading={isSubmitting}
      />
    );
  }

  if (stage === 'success') {
    const successAmount = category === "Electricity" ? Number(electricityAmount || 0) : (selectedPkg?.price || 0);
    const detailLabel = category === 'Electricity' ? 'Meter Number' : 'Smart Card Number';
    const detailValue = category === 'Electricity' ? meterNumber : smartCardNumber;
    return (
      <AirtimeSuccessScreen
        amount={successAmount}
        phone={detailValue}
        detailLabel={detailLabel}
        networkName={selectedBiller?.name || ''}
        orderType={category === 'Electricity' ? 'ELECTRICITY' : 'CABLE TV'}
        electricityToken={electricityToken}
        planName={category === 'Cable TV' ? selectedPkg?.name : undefined}
        isProcessing={isProcessing}
        onDone={async () => {
          await refreshAccount();
          router.push('/dashboard');
        }}
      />
    );
  }

  // Preview Screen
  if (showPreview) {
    const amount = category === "Electricity" ? Number(electricityAmount) : (selectedPkg?.price || 0);
    
    return (
      <div className="min-h-screen bg-white pb-6">
        <header className="sticky top-0 bg-white border-b border-gray-100 z-10">
          <div className="flex items-center gap-4 px-4 py-4">
            <button 
              onClick={() => setShowPreview(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-900" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Preview Transaction</h1>
          </div>
        </header>

        <div className="px-4 py-6 max-w-md mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-sm text-gray-600 mb-3">{category === "Electricity" ? "Electricity Bill" : "Cable TV"}</h2>
            <div className="inline-block bg-cyan-100 px-12 py-3 rounded-full">
              <span className="text-3xl font-bold text-gray-900">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-white space-y-4 mb-8">
            {category === "Electricity" && (
              <>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Meter Number</span>
                  <span className="text-sm font-bold text-gray-900">{meterNumber}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-bold text-gray-900">₦{Number(electricityAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Biller</span>
                  <span className="text-sm font-bold text-gray-900">{selectedBiller?.name}</span>
                </div>
              </>
            )}
            
            {category === "Cable TV" && (
              <>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Smart Card Number</span>
                  <span className="text-sm font-bold text-gray-900">{smartCardNumber}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-bold text-gray-900">₦{selectedPkg?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Package</span>
                  <span className="text-sm font-bold text-gray-900">{selectedPkg?.name}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-gray-600">Biller</span>
                  <span className="text-sm font-bold text-gray-900">{selectedBiller?.name}</span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleConfirm}
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
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Pay Bills</h1>
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
              className="w-full px-4 py-3.5 bg-gray-100 border-0 rounded-lg appearance-none focus:outline-none focus:ring-0 text-sm text-gray-900"
            >
              <option value="" disabled hidden>Select Country</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={20} />
          </div>
        </div>

        {/* Category selection trigger */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Category</label>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full px-4 py-3.5 bg-gray-100 border-0 rounded-lg text-left flex justify-between items-center text-sm text-gray-900"
          >
            <span className={category ? "text-gray-900" : "text-gray-400"}>
              {category || "Select Category"}
            </span>
            <ChevronDown className="text-gray-500" size={20} />
          </button>
        </div>

        {/* Biller selection trigger - always visible, disabled until category chosen */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Biller</label>
          <button
            onClick={() => isCategoryValid && setShowBillerModal(true)}
            disabled={!isCategoryValid}
            className={`w-full px-4 py-3.5 rounded-lg text-left flex items-center gap-3 text-sm border-0 transition ${
              isCategoryValid ? 'bg-gray-100' : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedBiller && isCategoryValid ? (
              <>
                <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-red-600">{selectedBiller.logo}</span>
                </div>
                <span className="text-gray-900 flex-1">{selectedBiller.name}</span>
                <ChevronDown className="text-gray-500" size={20} />
              </>
            ) : (
              <>
                <span className="flex-1 {isCategoryValid ? 'text-gray-400' : 'text-gray-300'}">{isCategoryValid ? 'Select Biller' : 'Select Category first'}</span>
                <ChevronDown className="text-gray-300" size={20} />
              </>
            )}
          </button>
        </div>

        {/* Cable TV: Select Package (always visible but gated) */}
        {category === 'Cable TV' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Select Package</label>
            <div className="relative">
              <select
                value={selectedPackage}
                onChange={(e) => setSelectedPackage(e.target.value)}
                disabled={!isBillerValid}
                className={`w-full px-4 py-3.5 rounded-lg appearance-none focus:outline-none focus:ring-0 text-sm ${isBillerValid ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
              >
                <option value="" className="text-gray-400">{isBillerValid ? 'Select Package' : 'Select Biller first'}</option>
                {isBillerValid && currentPackages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isBillerValid ? 'text-gray-500' : 'text-gray-300'}`} size={20} />
            </div>
          </div>
        )}

        {/* Electricity: Meter Number (always visible when category Electricity) */}
        {category === 'Electricity' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Meter Number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={isBillerValid ? 'Enter your meter number' : 'Select Biller first'}
              value={meterNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (isBillerValid) setMeterNumber(value);
              }}
              disabled={!isBillerValid}
              className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-0 text-sm placeholder:text-gray-400 ${isBillerValid ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
            />
          </div>
        )}

        {/* Cable TV: Smart Card Number (always visible when category Cable TV) */}
        {category === 'Cable TV' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Smart Card Number</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={isPackageValid ? 'Enter your smart card number' : 'Select Package first'}
              value={smartCardNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (isPackageValid) setSmartCardNumber(value);
              }}
              disabled={!isPackageValid}
              className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-0 text-sm placeholder:text-gray-400 ${isPackageValid ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
            />
          </div>
        )}

        {/* Electricity: Amount (always visible when category Electricity) */}
        {category === 'Electricity' && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Amount</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={isMeterValid ? 'Enter Amount' : 'Enter valid Meter Number first'}
              value={electricityAmount}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (isMeterValid) setElectricityAmount(value);
              }}
              disabled={!isMeterValid}
              className={`w-full px-4 py-3.5 rounded-lg focus:outline-none focus:ring-0 text-sm placeholder:text-gray-400 ${isMeterValid ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400 cursor-not-allowed'}`}
            />
          </div>
        )}

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

        {/* Continue button always visible, gated by overall form validity */}
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full font-semibold py-4 rounded-xl transition-all mt-8 ${
            isFormValid
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowCategoryModal(false)}
          />
          
          {/* Modal Panel - Slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl w-full max-h-[40vh] overflow-hidden transform animate-[sheet_0.3s_ease-out]">
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3">
              <h2 className="text-base font-bold text-gray-900">Category</h2>
              <p className="text-xs text-gray-500 mt-1">Select Bill category</p>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={() => {
                  setCategory("Electricity");
                  setShowCategoryModal(false);
                  setSelectedBiller(null);
                  setMeterNumber("");
                  setElectricityAmount("");
                  setSmartCardNumber("");
                  setSelectedPackage("");
                }}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                  category === "Electricity"
                    ? 'bg-green-100 border-green-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    category === "Electricity" ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {category === "Electricity" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Electricity</span>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setCategory("Cable TV");
                  setShowCategoryModal(false);
                  setSelectedBiller(null);
                  setMeterNumber("");
                  setElectricityAmount("");
                  setSmartCardNumber("");
                  setSelectedPackage("");
                }}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                  category === "Cable TV"
                    ? 'bg-green-100 border-green-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    category === "Cable TV" ? 'border-green-600' : 'border-gray-300'
                  }`}>
                    {category === "Cable TV" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Cable</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biller Selection Modal */}
      {showBillerModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowBillerModal(false)}
          />
          
          {/* Modal Panel - Slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl w-full max-h-[55vh] overflow-hidden transform animate-[sheet_0.3s_ease-out]">
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3 flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-900">Select Biller</h2>
              <button
                onClick={() => setShowBillerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(70vh-80px)]">
              {currentBillers.map((biller) => (
                <button
                  key={biller.id}
                  onClick={() => handleSelectBiller(biller)}
                  className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-transparent hover:border-gray-100"
                >
                  <div className="w-10 h-10 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-red-600">{biller.logo}</span>
                  </div>
                  <span className="text-gray-900 text-sm font-medium flex-1">{biller.name}</span>
                  {selectedBiller?.id === biller.id && (
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes sheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
