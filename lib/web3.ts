import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { cookieStorage, createStorage, type Chain } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism, avalancheFuji } from "wagmi/chains";

// Get projectId from environment variable
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

if (!projectId) {
  console.warn("WalletConnect Project ID is not set. Get one at https://cloud.walletconnect.com");
}

const metadata = {
  name: "SliqPay",
  description: "Send, receive, and convert crypto with ease",
  url: "https://sliqpay.com",
  icons: ["https://sliqpay.com/icon.png"],
};

// TreasuryVault deployed on Avalanche Fuji testnet
export const TREASURY_VAULT_ADDRESS = "0xeD3e610f22bd8cf6e9853978e758D0480e1D7A15" as `0x${string}`;
export const AVAX_FUJI_CHAIN_ID = 43113;

// Define the chains — Avalanche Fuji first for default selection
const chains = [avalancheFuji, mainnet, polygon, arbitrum, base, optimism] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
});
