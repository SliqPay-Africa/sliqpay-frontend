"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useMagic } from "@/components/providers/MagicProvider";
import { useUser } from "@/contexts/UserContext";
import { createWalletClient, createPublicClient, custom, http } from "viem";
import { defineChain } from "viem";
import SliqIDRegistryABI from "@/utils/abis/SliqIDRegistry.json";
import { magic } from "@/lib/magic";

const fuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji",
  nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.avax-test.network/ext/bc/C/rpc"] },
  },
  blockExplorers: {
    default: { name: "Snowtrace", url: "https://testnet.snowtrace.io" },
  },
});

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_SLIQ_ID_REGISTRY_ADDRESS as `0x${string}`;

const publicClient = createPublicClient({
  chain: fuji,
  transport: http(),
});

export default function ConnectWallet() {
  const router = useRouter();
  const { walletAddress, isLoading, isLoggedIn, login, logout } = useMagic();
  const { user, updateUser } = useUser();

  // UI state
  const [copied, setCopied] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);
  const savedWalletRef = useRef<string | null>(null);

  // SliqID state
  const [sliqId, setSliqId] = useState("");
  const [sliqIdError, setSliqIdError] = useState("");
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isIdAvailable, setIsIdAvailable] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // Step 1 — Logout old Magic session on fresh signup
  useEffect(() => {
    const logoutOldSession = async () => {
      if (isLoggedIn && !user?.walletAddress && !hasLoggedOut) {
        setHasLoggedOut(true);
        try {
          await logout();
        } catch (error) {
          console.error("Error logging out from old session:", error);
        }
      }
    };
    logoutOldSession();
  }, [isLoggedIn, user?.walletAddress, hasLoggedOut, logout]);

  // Step 2 — Auto-create Magic wallet using signup email
  useEffect(() => {
    const createWallet = async () => {
      if (
        !isLoggedIn &&
        !walletAddress &&
        user?.email &&
        !isCreatingWallet &&
        (hasLoggedOut || !walletAddress)
      ) {
        setIsCreatingWallet(true);
        try {
          await login(user.email);
        } catch (error) {
          console.error("Failed to create wallet:", error);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };
    createWallet();
  }, [isLoggedIn, user?.email, walletAddress, hasLoggedOut]);

  // Step 3 — Save wallet address to context and DB
  useEffect(() => {
    const saveWallet = async () => {
      if (walletAddress && isLoggedIn && savedWalletRef.current !== walletAddress) {
        savedWalletRef.current = walletAddress;
        updateUser({ walletAddress, walletType: "magic" });
        sessionStorage.setItem("walletAddress", walletAddress);

        if (!user?.walletAddress || user.walletAddress !== walletAddress) {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/wallet`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  walletAddress,
                  walletType: "magic",
                  magicUserId: user?.email || "",
                }),
              }
            );
            if (!response.ok) {
              const errorText = await response.text();
              if (!errorText.includes("Unique constraint")) {
                console.error("Failed to save wallet to database:", errorText);
              }
            }
          } catch (error) {
            console.error("Error saving wallet to database:", error);
          }
        }
      }
    };
    saveWallet();
  }, [walletAddress, isLoggedIn, user?.email, user?.walletAddress, updateUser]);

  // Check SliqID availability on-chain
  const checkSliqIdAvailability = async (id: string) => {
    if (!id || id.length < 3) return;
    setIsCheckingId(true);
    setIsIdAvailable(null);
    try {
      const taken = await publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: SliqIDRegistryABI,
        functionName: "isSliqIDRegistered",
        args: [`@${id}.sliq`],
      });
      setIsIdAvailable(!taken);
    } catch (err) {
      console.error("Error checking SliqID:", err);
      setIsIdAvailable(null);
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleSliqIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase();
    setSliqId(raw);
    setSliqIdError("");
    setIsIdAvailable(null);
    if (raw.length >= 3) {
      checkSliqIdAvailability(raw);
    }
  };

  // Register SliqID on-chain using Magic wallet via viem
  const handleRegisterSliqId = async () => {
    if (!sliqId || sliqId.length < 3) {
      setSliqIdError("SliqID must be at least 3 characters");
      return;
    }
    if (!isIdAvailable) {
      setSliqIdError("This SliqID is already taken");
      return;
    }
    if (!walletAddress) {
      setSliqIdError("Wallet not ready yet");
      return;
    }
    if (!magic) {
      setSliqIdError("Magic not initialized");
      return;
    }

    setIsRegistering(true);
    setRegisterError("");

    try {
      const fullSliqId = `@${sliqId}.sliq`;

      // Use Magic's provider with viem walletClient
      const walletClient = createWalletClient({
        chain: fuji,
        transport: custom(magic.rpcProvider),
      });

      const { request } = await publicClient.simulateContract({
        address: REGISTRY_ADDRESS,
        abi: SliqIDRegistryABI,
        functionName: "registerSliqID",
        args: [fullSliqId, walletAddress as `0x${string}`],
        account: walletAddress as `0x${string}`,
      });

      await walletClient.writeContract(request);

      // Save SliqID to backend and context
      updateUser({ sliqId: fullSliqId });
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/sliqid`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sliqId: fullSliqId }),
        });
      } catch (err) {
        // Non-blocking — on-chain registration is the source of truth
        console.warn("Failed to save SliqID to backend:", err);
      }

      setIsRegistered(true);
    } catch (err: any) {
      console.error("SliqID registration failed:", err);
      setRegisterError(err?.shortMessage || err?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (walletAddress) {
      window.open(`https://testnet.snowtrace.io/address/${walletAddress}`, "_blank");
    }
  };

  const handleContinue = () => {
    if (!isRegistered) {
      setSliqIdError("Please register your SliqID before continuing");
      return;
    }
    router.push("/dashboard");
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70" />
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/auth/signup" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
          <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
        </div>
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-xl font-extrabold mb-1">Set Up Your Wallet</h1>
        <p className="text-sm text-gray-500">
          Your crypto wallet is being created. Choose your SliqID to complete setup.
        </p>

        {/* Wallet Creation Status */}
        {isLoading || isCreatingWallet ? (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin h-12 w-12 text-green-600 mb-4" />
              <p className="text-sm text-blue-900 font-medium">Creating your wallet...</p>
              <p className="text-xs text-blue-700 mt-2">Check your email for a verification code</p>
            </div>
          </div>
        ) : walletAddress ? (
          <div className="mt-6 space-y-4">

            {/* Wallet Address Card */}
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Check size={20} className="text-white" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Wallet Created!</h3>
                  <p className="text-xs text-gray-500">On Avalanche Fuji Testnet</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 border border-gray-200 mb-3">
                <code className="text-sm font-mono text-gray-800">{formatAddress(walletAddress)}</code>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyAddress}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50"
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
                <button
                  onClick={handleViewExplorer}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50"
                >
                  <ExternalLink size={14} /> Explorer
                </button>
              </div>
            </div>

            {/* SliqID Registration */}
            {!isRegistered ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-1">Choose Your SliqID</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Your unique identity on SliqPay. Used to send and receive payments.
                </p>

                <div className="flex items-center border rounded-xl overflow-hidden mb-2 focus-within:ring-2 focus-within:ring-green-500">
                  <span className="pl-4 pr-1 text-gray-400 text-sm font-mono">@</span>
                  <input
                    type="text"
                    placeholder="yourname"
                    value={sliqId}
                    onChange={handleSliqIdChange}
                    className="flex-1 px-2 py-3 text-sm outline-none"
                    maxLength={20}
                  />
                  <span className="pr-4 pl-1 text-gray-400 text-sm font-mono">.sliq</span>
                  <div className="pr-3">
                    {isCheckingId && <Loader2 size={16} className="animate-spin text-gray-400" />}
                    {!isCheckingId && isIdAvailable === true && <Check size={16} className="text-green-500" />}
                    {!isCheckingId && isIdAvailable === false && <span className="text-red-500 text-xs">✗</span>}
                  </div>
                </div>

                {/* Availability message */}
                {isIdAvailable === true && (
                  <p className="text-xs text-green-600 mb-3">@{sliqId}.sliq is available!</p>
                )}
                {isIdAvailable === false && (
                  <p className="text-xs text-red-600 mb-3">@{sliqId}.sliq is already taken</p>
                )}
                {sliqIdError && (
                  <p className="text-xs text-red-600 mb-3">{sliqIdError}</p>
                )}
                {registerError && (
                  <p className="text-xs text-red-600 mb-3">{registerError}</p>
                )}

                <button
                  onClick={handleRegisterSliqId}
                  disabled={isRegistering || !isIdAvailable || sliqId.length < 3}
                  className="w-full bg-green-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <><Loader2 size={16} className="animate-spin" /> Registering on-chain...</>
                  ) : (
                    "Register SliqID"
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <Check size={32} className="text-green-600 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900">SliqID Registered!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-mono font-semibold text-green-700">@{sliqId}.sliq</span> is now yours on Avalanche Fuji
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800 text-center">
              Please complete signup to create your wallet
            </p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={isLoading || isCreatingWallet}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading || isCreatingWallet ? (
            <><Loader2 size={16} className="animate-spin mr-2" /> Loading...</>
          ) : (
            "Continue to Dashboard"
          )}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}