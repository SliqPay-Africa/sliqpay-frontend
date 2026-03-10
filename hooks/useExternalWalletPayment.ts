"use client";

import { useState, useCallback } from "react";
import { useAccount, useConnect, useSendTransaction, useSwitchChain } from "wagmi";
import { parseEther } from "viem";
import { TREASURY_VAULT_ADDRESS, AVAX_FUJI_CHAIN_ID } from "@/lib/web3";

const AVAX_NGN_RATE = 50000;

export type WalletPaymentStatus =
  | "idle" | "connecting" | "switching-chain"
  | "awaiting-approval" | "confirming" | "success" | "error";

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

  const sendTx = useCallback(async (amountNGN: number): Promise<string> => {
    // Switch to Fuji if needed
    if (chain?.id !== AVAX_FUJI_CHAIN_ID) {
      setStatus("switching-chain");
      await switchChainAsync({ chainId: AVAX_FUJI_CHAIN_ID });
    }
    // Send AVAX to TreasuryVault
    const avaxAmount = amountNGN / AVAX_NGN_RATE;
    const weiValue = parseEther(avaxAmount.toFixed(18));
    setStatus("awaiting-approval");
    const hash = await sendTransactionAsync({
      to: TREASURY_VAULT_ADDRESS,
      value: weiValue,
      chainId: AVAX_FUJI_CHAIN_ID,
    });
    setTxHash(hash);
    setStatus("success");
    return hash;
  }, [chain, switchChainAsync, sendTransactionAsync]);

  const pay = useCallback(async (amountNGN: number): Promise<string> => {
    setError(null);
    setTxHash(null);

    try {
      // Only connect if truly not connected
      if (!isConnected) {
        setStatus("connecting");
        const injected = connectors.find(
          (c) => c.id === "injected" || c.id === "metaMask" || c.id === "io.metamask"
        );
        const connector = injected || connectors[0];
        if (!connector) throw new Error("No wallet found. Please install MetaMask.");
        try {
          await connectAsync({ connector });
        } catch (connErr: any) {
          // "Already connected" is fine — just continue
          if (!connErr?.message?.includes("already connected") && 
              connErr?.name !== "ConnectorAlreadyConnectedError") {
            throw connErr;
          }
        }
      }

      return await sendTx(amountNGN);

    } catch (err: any) {
      const msg = err?.shortMessage || err?.message || "Wallet transaction failed";
      setError(msg);
      setStatus("error");
      throw new Error(msg);
    }
  }, [isConnected, connectors, connectAsync, sendTx]);

  return { pay, reset, status, txHash, error, isConnected, walletAddress: address };
}