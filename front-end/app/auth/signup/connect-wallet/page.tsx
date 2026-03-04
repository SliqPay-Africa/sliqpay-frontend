"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useMagic } from "@/components/providers/MagicProvider";
import { useUser } from "@/contexts/UserContext";

export default function ConnectWallet() {
  const router = useRouter();
  const { walletAddress, isLoading, isLoggedIn, login, logout } = useMagic();
  const { user, updateUser } = useUser();
  const [copied, setCopied] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const savedWalletRef = useRef<string | null>(null);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  // First effect: Logout from any previous Magic.link session
  useEffect(() => {
    const logoutOldSession = async () => {
      // If there's an existing Magic session but the user doesn't have a wallet in UserContext,
      // it means this is a new signup and we need to clear the old session
      if (isLoggedIn && !user?.walletAddress && !hasLoggedOut) {
        setHasLoggedOut(true);
        try {
          await logout();
        } catch (error) {
          console.error('Error logging out from old session:', error);
        }
      }
    };

    logoutOldSession();
  }, [isLoggedIn, user?.walletAddress, hasLoggedOut, logout]);

  // Second effect: Create wallet for new user
  useEffect(() => {
    // Auto-create wallet if user has email but no wallet yet
    const createWallet = async () => {
      // Only try to create wallet if:
      // 1. Not currently logged in to Magic
      // 2. No wallet address exists yet
      // 3. User has an email
      // 4. Not already creating wallet
      // 5. Has logged out from any previous session (or there was no previous session)
      if (!isLoggedIn && !walletAddress && user?.email && !isCreatingWallet && (hasLoggedOut || !walletAddress)) {
        setIsCreatingWallet(true);
        try {
          await login(user.email);
        } catch (error) {
          console.error('Failed to create wallet:', error);
        } finally {
          setIsCreatingWallet(false);
        }
      }
    };

    createWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.email, walletAddress, hasLoggedOut]);

  useEffect(() => {
    // Save wallet address to UserContext and database when available
    const saveWallet = async () => {
      // Only save if we have a wallet, user is logged in, and we haven't saved this wallet yet
      if (walletAddress && isLoggedIn && savedWalletRef.current !== walletAddress) {
        // Mark this wallet as saved
        savedWalletRef.current = walletAddress;

        updateUser({
          walletAddress,
          walletType: 'magic',
        });
        // Also save to session storage
        sessionStorage.setItem("walletAddress", walletAddress);

        // Save to database via API (only if user doesn't already have this wallet)
        if (!user?.walletAddress || user.walletAddress !== walletAddress) {
          try {
            const userEmail = user?.email || '';
            const response = await fetch('/api/v1/user/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                walletAddress,
                walletType: 'magic',
                magicUserId: userEmail,
              }),
            });

            if (!response.ok) {
              const errorText = await response.text();
              // Only log if it's not a unique constraint error (wallet already exists)
              if (!errorText.includes('Unique constraint')) {
                console.error('Failed to save wallet to database:', errorText);
              }
            }
          } catch (error) {
            console.error('Error saving wallet to database:', error);
          }
        }
      }
    };

    saveWallet();
  }, [walletAddress, isLoggedIn, user?.email, user?.walletAddress, updateUser]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewExplorer = () => {
    if (walletAddress) {
      window.open(`https://moonbase.moonscan.io/address/${walletAddress}`, '_blank');
    }
  };

  const handleContinue = () => {
    router.push("/dashboard");
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#f7fbff] relative p-6">
      <div className="pointer-events-none absolute -top-10 right-[-20%] h-64 w-64 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d9f3ff] to-transparent blur-2xl opacity-70"/>
      <div className="pointer-events-none absolute top-24 left-[-20%] h-56 w-56 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#e6fff3] to-transparent blur-2xl opacity-70"/>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/auth/signup/step-5" aria-label="Back" className="p-2 -ml-2 rounded-md hover:bg-gray-100">←</Link>
          <img src="/Sliqpayvisual12.png" alt="SliqPay" className="h-6" />
        </div>
      </div>

      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-xl font-extrabold mb-1">Wallet Created!</h1>
        <p className="text-sm text-gray-500">
          Your crypto wallet has been automatically created. You can now send, receive, and store crypto.
        </p>

        {isLoading || isCreatingWallet ? (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
              <p className="text-sm text-blue-900 font-medium">Creating your wallet...</p>
              <p className="text-xs text-blue-700 mt-2">Check your email for a verification code</p>
            </div>
          </div>
        ) : walletAddress ? (
          <div className="mt-6">
            {/* Success State with Wallet Address */}
            <div className="rounded-2xl border-2 border-green-300 bg-green-50 p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <Check size={32} className="text-white" strokeWidth={3} />
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 mb-2">Wallet Created!</h3>
                <p className="text-sm text-gray-600 mb-4">Your wallet address:</p>

                {/* Wallet Address Display */}
                <div className="bg-white rounded-xl p-3 border border-gray-200 mb-3">
                  <code className="text-sm font-mono text-gray-800">{formatAddress(walletAddress)}</code>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy Address
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleViewExplorer}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <ExternalLink size={16} />
                    View on Explorer
                  </button>
                </div>

                {/* Security Note */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900">
                    <strong>Secure & Safe:</strong> Your wallet is protected by Magic.link's enterprise-grade security.
                    No seed phrases to remember or lose.
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💸</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Send & Receive</h4>
                  <p className="text-xs text-gray-600">Transfer crypto instantly to other SliqPay users</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔄</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Multi-Chain Support</h4>
                  <p className="text-xs text-gray-600">Works on Ethereum, Polygon, Moonbeam & more</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔒</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900">Enterprise Security</h4>
                  <p className="text-xs text-gray-600">Protected by Magic.link's TEE technology</p>
                </div>
              </div>
            </div>
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
          disabled={isLoading}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Loading..." : "Continue to Dashboard"}
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link href="/auth/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
