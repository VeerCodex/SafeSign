"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "./WalletProvider";
import { Shield, ShieldAlert, Wallet, ExternalLink, Activity } from "lucide-react";
import { monadTestnet } from "@/lib/monad";

export function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, isMonad, connect, disconnect, switchToMonad } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090b10]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#836ef9] via-[#6366f1] to-[#38bdf8] flex items-center justify-center p-0.5 shadow-lg shadow-[#836ef9]/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0d111c] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#836ef9] group-hover:text-white transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                SafeSign
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-[#836ef9]/20 text-[#a594fd] border border-[#836ef9]/30 tracking-wider">
                  Monad
                </span>
              </span>
              <span className="text-[11px] text-gray-400 font-medium">AI Smart Contract Sentinel</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === "/"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Audit Analyzer
            </Link>
            <Link
              href="/reports"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                pathname === "/reports"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-4 h-4 text-[#836ef9]" />
              On-Chain Reports
            </Link>
            <Link
              href="/deploy"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === "/deploy"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Deploy Contract
            </Link>
          </nav>
        </div>

        {/* Right Actions: Network & Wallet */}
        <div className="flex items-center gap-3">
          {isConnected && !isMonad && (
            <button
              onClick={switchToMonad}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-1.5 animate-pulse"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Switch to Monad
            </button>
          )}

          {isConnected && isMonad && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Monad Testnet
            </div>
          )}

          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="relative group overflow-hidden px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#836ef9] to-[#6366f1] hover:from-[#735df7] hover:to-[#4f46e5] shadow-lg shadow-[#836ef9]/25 hover:shadow-[#836ef9]/40 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#131826] border border-white/10 rounded-xl p-1 pr-3">
              <div className="w-7 h-7 rounded-lg bg-[#836ef9]/20 border border-[#836ef9]/40 flex items-center justify-center text-[#a594fd] text-xs font-bold">
                {address?.slice(2, 4).toUpperCase()}
              </div>
              <span className="text-xs font-mono font-medium text-gray-200">
                {truncateAddress(address || "")}
              </span>
              <button
                onClick={disconnect}
                className="ml-1 text-[11px] text-gray-400 hover:text-rose-400 transition-colors"
                title="Disconnect Wallet"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
