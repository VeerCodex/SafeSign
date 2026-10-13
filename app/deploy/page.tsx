"use client";

import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { monadTestnet, getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/monad";
import { SAFESIGN_REGISTRY_ABI } from "@/lib/abi";
import { createWalletClient, custom } from "viem";
import { publicClient } from "@/lib/contract";
import contractArtifact from "@/lib/contractArtifact.json";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Loader2,
  Terminal,
  Shield
} from "lucide-react";

export default function DeployPage() {
  const { isConnected, isMonad, address, connect, switchToMonad } = useWallet();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleDeployWithWallet = async () => {
    if (!isConnected) {
      await connect();
      return;
    }
    if (!isMonad) {
      await switchToMonad();
      return;
    }

    setIsDeploying(true);
    setError(null);
    setStatusMessage("Prompting signature in wallet...");

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("No browser wallet detected.");

      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(ethereum),
      });

      const accounts = await walletClient.getAddresses();
      if (!accounts || accounts.length === 0) {
        throw new Error("No active wallet account found.");
      }

      setStatusMessage("Broadcasting contract deployment to Monad Testnet...");
      const hash = await walletClient.deployContract({
        abi: SAFESIGN_REGISTRY_ABI,
        bytecode: contractArtifact.bytecode as `0x${string}`,
        account: accounts[0],
      });

      setTxHash(hash);
      setStatusMessage("Transaction submitted! Waiting for block confirmation on Monad...");

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const contractAddr = receipt.contractAddress;

      if (!contractAddr) {
        throw new Error("Contract address was not returned in receipt.");
      }

      setDeployedAddress(contractAddr);
      setStatusMessage("Saving contract address to application config...");

      // Update backend config
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registryAddress: contractAddr }),
      });

      setStatusMessage(`SafeSignRegistry successfully deployed at ${contractAddr}!`);
    } catch (err: any) {
      console.error("Deploy error:", err);
      setError(err.shortMessage || err.message || "Contract deployment failed.");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSaveManualAddress = async () => {
    const addr = manualAddress.trim();
    if (!addr.startsWith("0x") || addr.length !== 42) {
      setError("Invalid contract address. Must start with 0x and be 42 characters.");
      return;
    }

    setError(null);
    setStatusMessage("Saving address...");

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registryAddress: addr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update config");

      setDeployedAddress(addr);
      setStatusMessage(`Contract address configured: ${addr}!`);
    } catch (err: any) {
      setError(err.message || "Failed to save address.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#836ef9]/10 border border-[#836ef9]/30 text-xs font-semibold text-[#a594fd] mb-3">
          <Rocket className="w-3.5 h-3.5 text-[#836ef9]" />
          <span>Step 2: Smart Contract Setup</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Deploy SafeSignRegistry on Monad
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-2 max-w-xl mx-auto">
          Deploy directly with your connected browser wallet (one click) or link your Remix deployment.
        </p>
      </div>

      <div className="space-y-8">
        {/* Option 1: One-Click Browser Wallet Deployment */}
        <div className="rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#836ef9]/20 border border-[#836ef9]/40 flex items-center justify-center text-[#836ef9]">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Option 1: One-Click Browser Deploy</h2>
              <p className="text-xs text-gray-400">
                Deploy directly using your connected wallet on Monad (Chain ID 143 / 10143, RPC: https://rpc.monad.xyz).
              </p>
            </div>
          </div>

          <div className="pt-2">
            {!isConnected ? (
              <button
                onClick={connect}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#836ef9] to-[#6366f1] hover:shadow-lg hover:shadow-[#836ef9]/25 transition-all"
              >
                Connect Wallet to Deploy
              </button>
            ) : !isMonad ? (
              <button
                onClick={switchToMonad}
                className="px-6 py-3 rounded-xl font-bold text-sm text-amber-300 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-2"
              >
                Switch to Monad Testnet First
              </button>
            ) : (
              <button
                onClick={handleDeployWithWallet}
                disabled={isDeploying}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#836ef9] via-[#735df7] to-[#4f46e5] hover:shadow-lg hover:shadow-[#836ef9]/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deploying SafeSignRegistry...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Deploy SafeSignRegistry on Monad</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Option 2: Paste Deployed Contract Address from Remix */}
        <div className="rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Option 2: Link Remix Deployed Address</h2>
              <p className="text-xs text-gray-400">
                Already deployed via Remix or CLI? Paste the contract address below.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-[#090d17] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-[#836ef9]/60"
            />
            <button
              onClick={handleSaveManualAddress}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              Save Address
            </button>
          </div>
        </div>

        {/* Status & Feedback */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-[#836ef9]/10 border border-[#836ef9]/30 text-[#a594fd] text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#836ef9]" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Card with Explorer Link */}
        {deployedAddress && (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>SafeSignRegistry Ready on Monad Testnet!</span>
            </div>
            <p className="text-xs text-gray-300 font-mono mb-4 break-all">
              Address: <span className="text-emerald-300 font-semibold">{deployedAddress}</span>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={getExplorerAddressUrl(deployedAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5"
              >
                <span>View on Monad Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {txHash && (
                <a
                  href={getExplorerTxUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
                >
                  <span>Deployment Transaction</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
