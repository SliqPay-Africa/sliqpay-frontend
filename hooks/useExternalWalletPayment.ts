"use client";

import { useState, useCallback } from "react";
import { useAccount, useConnect, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { TREASURY_VAULT_ADDRESS, AVAX_FUJI_CHAIN_ID } from "@/lib/web3";

// Simplified AVAX/NGN rate for demo (1 AVAX ≈ 50,000 NGN)
const AVAX_NGN_RATE = 50000;

export type WalletPaymentStatus = "idle" | "connecting" | "switching-chain" | "awaiting-approval" | "pending-tx" | "confirming" | "success" | "error";

export interface WalletPaymentResult {
  txHash: string | null;
  status: WalletPaymentStatus;
  error: string | null;
}

export function useExternalWalletPayment() {
  const { address, isConnected, chain } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();

  const [status, setStatus] = useState<WalletPaymentStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
  }, []);

  /**
   * Execute a payment via the user's external wallet.
   * @param amountNGN The amount in NGN to convert to AVAX and send
   * @returns The transaction hash on success
   */
  const pay = useCallback(async (amountNGN: number): Promise<string> => {
    setError(null);
    setTxHash(null);

    try {
      // 1. Connect wallet if not connected
      if (!isConnected) {
        setStatus("connecting");
        // Try injected (MetaMask etc) first, then fallback to WalletConnect
        const injected = connectors.find(c => c.id === "injected" || c.id === "metaMask" || c.id === "io.metamask");
        const connector = injected || connectors[0];
        if (!connector) throw new Error("No wallet found. Please install MetaMask or another Web3 wallet.");
        await connectAsync({ connector });
      }

      // 2. Switch to Avalanche Fuji if not on it
      if (chain?.id !== AVAX_FUJI_CHAIN_ID) {
        setStatus("switching-chain");
        try {
          await switchChainAsync({ chainId: AVAX_FUJI_CHAIN_ID });
        } catch (switchErr: any) {
          throw new Error("Please switch to Avalanche Fuji testnet in your wallet to continue.");
        }
      }

      // 3. Calculate AVAX amount from NGN
      const avaxAmount = amountNGN / AVAX_NGN_RATE;
      const weiValue = parseEther(avaxAmount.toFixed(18));

      // 4. Prompt wallet to send AVAX to TreasuryVault
      setStatus("awaiting-approval");
      const hash = await sendTransactionAsync({
        to: TREASURY_VAULT_ADDRESS,
        value: weiValue,
        chainId: AVAX_FUJI_CHAIN_ID,
      });

      setTxHash(hash);
      setStatus("confirming");

      // 5. Return hash — backend will verify on-chain
      setStatus("success");
      return hash;
    } catch (err: any) {
      const msg =
        err?.shortMessage ||
        err?.message ||
        "Wallet transaction failed";
      setError(msg);
      setStatus("error");
      throw new Error(msg);
    }
  }, [isConnected, chain, connectors, connectAsync, switchChainAsync, sendTransactionAsync]);

  return {
    pay,
    reset,
    status,
    txHash,
    error,
    isConnected,
    walletAddress: address,
  };
}
