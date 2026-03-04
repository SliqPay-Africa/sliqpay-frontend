'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { magic, getWalletAddress, getUserMetadata, magicLogout, isAuthenticated } from '@/lib/magic';
import type { MagicUserMetadata } from 'magic-sdk';

interface MagicContextType {
  magic: typeof magic;
  user: MagicUserMetadata | null;
  walletAddress: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string) => Promise<void>;
  loginWithSocial: (provider: 'google' | 'apple' | 'twitter' | 'discord') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const MagicContext = createContext<MagicContextType>({} as MagicContextType);

export function MagicProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MagicUserMetadata | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        await refreshUser();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!magic) {
      console.error('Magic not initialized');
      return;
    }

    try {
      // Check if user is logged in first
      const loggedIn = await magic.user.isLoggedIn();
      if (!loggedIn) {
        return;
      }

      // Get metadata using magic instance directly
      const metadata = await magic.user.getInfo();

      if (metadata) {
        // @ts-expect-error - Type mismatch between Magic SDK versions, runtime works correctly
        setUser(metadata);

        // Extract wallet address from issuer (format: did:ethr:0x...)
        let address = metadata.publicAddress;
        if (!address && metadata.issuer) {
          const match = metadata.issuer.match(/0x[a-fA-F0-9]{40}/);
          address = match ? match[0] : null;
        }

        setWalletAddress(address || null);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Don't throw, just log the error
    }
  };

  const login = async (email: string) => {
    if (!magic) throw new Error('Magic not initialized');

    try {
      setIsLoading(true);
      // Use loginWithEmailOTP as per Magic.link documentation
      await magic.auth.loginWithEmailOTP({ email });

      // Wait a moment for Magic to fully initialize the session
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch user info after successful login
      await refreshUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocial = async (_provider: 'google' | 'apple' | 'twitter' | 'discord') => {
    // OAuth not implemented yet - requires Magic Connect extension
    console.warn('Social login not yet implemented');
    throw new Error('Social login coming soon');
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await magicLogout();
      setUser(null);
      setWalletAddress(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: MagicContextType = {
    magic,
    user,
    walletAddress,
    isLoading,
    isLoggedIn,
    login,
    loginWithSocial,
    logout,
    refreshUser,
  };

  return (
    // @ts-expect-error - React 18 type conflict with Next.js 15, runtime works correctly
    <MagicContext.Provider value={value}>
      {children}
    </MagicContext.Provider>
  );
}

// Custom hook to use Magic context
export function useMagic() {
  const context = useContext(MagicContext);
  if (!context) {
    throw new Error('useMagic must be used within a MagicProvider');
  }
  return context;
}
