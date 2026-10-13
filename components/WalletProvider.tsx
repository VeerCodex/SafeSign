"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { monadTestnet, MONAD_CHAIN_ID_HEX } from "@/lib/monad";

interface WalletContextType {
  address: `0x${string}` | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isMonad: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToMonad: () => Promise<void>;
  error: string | null;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  isMonad: false,
  connect: async () => {},
  disconnect: () => {},
  switchToMonad: async () => {},
  error: null,
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMonad = chainId === monadTestnet.id;

  const switchToMonad = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 wallet detected. Please install MetaMask, Rabby, or Phantom.");
      return;
    }
    const ethereum = (window as any).ethereum;
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CHAIN_ID_HEX }],
      });
      setError(null);
    } catch (switchError: any) {
      // Chain not added yet (error code 4902)
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: MONAD_CHAIN_ID_HEX,
                chainName: "Monad Testnet",
                nativeCurrency: {
                  name: "Monad",
                  symbol: "MON",
                  decimals: 18,
                },
                rpcUrls: ["https://testnet-rpc.monad.xyz"],
                blockExplorerUrls: ["https://testnet.monadexplorer.com"],
              },
            ],
          });
          setError(null);
        } catch (addError: any) {
          setError(addError.message || "Failed to add Monad Testnet to wallet.");
        }
      } else {
        setError(switchError.message || "Failed to switch to Monad Testnet.");
      }
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("No Web3 wallet detected. Please install MetaMask, Rabby, or another browser wallet.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0].toLowerCase() as `0x${string}`);
        const currentChainId = await ethereum.request({ method: "eth_chainId" });
        const parsedChainId = parseInt(currentChainId, 16);
        setChainId(parsedChainId);

        if (parsedChainId !== monadTestnet.id) {
          // Attempt automatic prompt to switch to Monad
          await switchToMonad();
        }
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Wallet connection rejected.");
    } finally {
      setIsConnecting(false);
    }
  }, [switchToMonad]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  // Listen to provider events
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const ethereum = (window as any).ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0].toLowerCase() as `0x${string}`);
      } else {
        setAddress(null);
      }
    };

    const handleChainChanged = (newChainId: string) => {
      setChainId(parseInt(newChainId, 16));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    // Initial silent check
    ethereum
      .request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0].toLowerCase() as `0x${string}`);
          return ethereum.request({ method: "eth_chainId" });
        }
      })
      .then((currentChainId: string) => {
        if (currentChainId) {
          setChainId(parseInt(currentChainId, 16));
        }
      })
      .catch(() => {});

    return () => {
      if (ethereum.removeListener) {
        ethereum.removeListener("accountsChanged", handleAccountsChanged);
        ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected: !!address,
        isConnecting,
        isMonad,
        connect,
        disconnect,
        switchToMonad,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
