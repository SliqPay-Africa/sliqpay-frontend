import type { Magic as MagicType } from 'magic-sdk';

// Chain configurations for multi-chain support
export const chains = {
  moonbase: {
    name: 'Moonbase Alpha',
    rpcUrl: 'https://rpc.api.moonbase.moonbeam.network',
    chainId: 1287,
    explorer: 'https://moonbase.moonscan.io',
  },
  polygon: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    explorer: 'https://polygonscan.com',
  },
  ethereum: {
    name: 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
    chainId: 1,
    explorer: 'https://etherscan.io',
  },
  arbitrum: {
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    explorer: 'https://arbiscan.io',
  },
  base: {
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    explorer: 'https://basescan.org',
  },
  optimism: {
    name: 'Optimism',
    rpcUrl: 'https://mainnet.optimism.io',
    chainId: 10,
    explorer: 'https://optimistic.etherscan.io',
  },
} as const;

export type ChainKey = keyof typeof chains;

// Default chain (Moonbase Alpha for SliqPay)
const defaultChain = chains.moonbase;

// Magic instance holder (dynamically imported)
let magicInstance: MagicType | null = null;

// Get or initialize Magic instance (client-side only with dynamic import)
export const getMagic = async (): Promise<MagicType | null> => {
  if (typeof window === 'undefined') return null;
  
  if (magicInstance) return magicInstance;
  
  if (!process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) return null;
  
  try {
    const { Magic } = await import('magic-sdk');
    magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
      network: {
        rpcUrl: defaultChain.rpcUrl,
        chainId: defaultChain.chainId,
      },
    });
    return magicInstance;
  } catch (error) {
    console.error('Failed to initialize Magic SDK:', error);
    return null;
  }
};

// Synchronous magic export for backwards compatibility
// Note: This will be null initially and needs async initialization via getMagic()
export let magic: MagicType | null = null;

// Initialize on client side
if (typeof window !== 'undefined') {
  getMagic().then(m => { magic = m; });
}

// Helper function to get user's wallet address
export const getWalletAddress = async (): Promise<string | null> => {
  const magic = await getMagic();
  if (!magic) return null;

  try {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) return null;

    const metadata = await magic.user.getInfo();

    // Extract address from publicAddress or issuer field
    let address = metadata.publicAddress;
    if (!address && metadata.issuer) {
      const match = metadata.issuer.match(/0x[a-fA-F0-9]{40}/);
      address = match ? match[0] : null;
    }

    return address || null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

// Helper function to get full user metadata
export const getUserMetadata = async () => {
  const magic = await getMagic();
  if (!magic) return null;

  try {
    const isLoggedIn = await magic.user.isLoggedIn();
    if (!isLoggedIn) return null;

    return await magic.user.getInfo();
  } catch (error) {
    console.error('Error getting user metadata:', error);
    return null;
  }
};

// Helper function to logout
export const magicLogout = async (): Promise<void> => {
  const magic = await getMagic();
  if (!magic) return;

  try {
    await magic.user.logout();
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const magic = await getMagic();
  if (!magic) return false;

  try {
    return await magic.user.isLoggedIn();
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Format wallet address (0x1234...5678)
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Get chain configuration by key
export const getChainConfig = (chainKey: ChainKey) => {
  return chains[chainKey];
};

// Switch network (requires re-initialization of Magic instance)
export const switchNetwork = async (chainKey: ChainKey): Promise<MagicType | null> => {
  if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY) return null;

  try {
    const { Magic } = await import('magic-sdk');
    const chain = chains[chainKey];
    magicInstance = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY, {
      network: {
        rpcUrl: chain.rpcUrl,
        chainId: chain.chainId,
      },
    });
    magic = magicInstance;
    return magicInstance;
  } catch (error) {
    console.error('Failed to switch network:', error);
    return null;
  }
};
