"use client";

import React, { useState } from "react";
import { AnalysisResult } from "@/lib/types";
import { useWallet } from "./WalletProvider";
import { SAFESIGN_REGISTRY_ABI } from "@/lib/abi";
import { REGISTRY_ADDRESS, publicClient } from "@/lib/contract";
import { monadTestnet, getExplorerTxUrl } from "@/lib/monad";
import { createWalletClient, custom } from "viem";
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Loader2,
  Share2
} from "lucide-react";

interface AnalysisCardProps {
  result: AnalysisResult;
  codeHash: `0x${string}`;
}

export function AnalysisCard({ result, codeHash }: AnalysisCardProps) {
  const { isConnected, isMonad, address, switchToMonad, connect } = useWallet();
  const [isSaving, setIsSaving] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const getVerdictTheme = () => {
    switch (result.verdict) {
      case "Safe":
        return {
          textColor: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          glowColor: "rgba(16, 185, 129, 0.25)",
          icon: ShieldCheck,
          label: "SAFE",
          scoreGradient: "from-emerald-500 to-teal-400",
        };
      case "Caution":
        return {
          textColor: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          glowColor: "rgba(245, 158, 11, 0.25)",
          icon: AlertTriangle,
          label: "CAUTION",
          scoreGradient: "from-amber-500 to-yellow-400",
        };
      case "Dangerous":
      default:
        return {
          textColor: "text-rose-400",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/30",
          glowColor: "rgba(244, 63, 94, 0.3)",
          icon: Flame,
          label: "DANGEROUS",
          scoreGradient: "from-rose-500 to-red-600",
        };
    }
  };

  const theme = getVerdictTheme();
  const VerdictIcon = theme.icon;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(codeHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleSaveOnMonad = async () => {
    if (!REGISTRY_ADDRESS || !REGISTRY_ADDRESS.startsWith("0x")) {
      setSaveError("SafeSignRegistry contract address is not configured yet. Complete contract deployment first.");
      return;
    }

    if (!isMonad) {
      await switchToMonad();
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) throw new Error("No Web3 provider available.");

      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(ethereum),
      });

      const accounts = await walletClient.getAddresses();
      if (!accounts || accounts.length === 0) {
        throw new Error("No active wallet account found.");
      }

      const hash = await walletClient.writeContract({
        address: REGISTRY_ADDRESS,
        abi: SAFESIGN_REGISTRY_ABI,
        functionName: "saveReport",
        args: [codeHash, result.riskScore, result.verdict],
        account: accounts[0],
      });

      setTxHash(hash);
      // Wait for block receipt on Monad Testnet
      await publicClient.waitForTransactionReceipt({ hash });
    } catch (err: any) {
      console.error("Save report error:", err);
      setSaveError(err.shortMessage || err.message || "Transaction was rejected or failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel border border-white/10 p-6 sm:p-8 mt-8 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Background ambient gradient glow */}
      <div
        className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[90px] pointer-events-none opacity-40"
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* Top Header: Risk Score & Verdict */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="flex items-center gap-5">
          {/* Big Circular Score */}
          <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-[#0c101d] border border-white/10 shadow-inner">
            <div className="flex flex-col items-center">
              <span className={`text-3xl font-extrabold bg-gradient-to-r ${theme.scoreGradient} bg-clip-text text-transparent`}>
                {result.riskScore}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Risk Score
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bgColor} ${theme.textColor} border ${theme.borderColor}`}
              >
                <VerdictIcon className="w-3.5 h-3.5" />
                {theme.label}
              </span>
              <span className="text-xs text-gray-400">• Security Audit</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {result.verdict === "Safe" && "Safe to Sign & Interact"}
              {result.verdict === "Caution" && "Proceed With Extreme Caution"}
              {result.verdict === "Dangerous" && "High Scam / Honeypot Risk"}
            </h3>
          </div>
        </div>

        {/* Code Hash Display */}
        <div className="w-full sm:w-auto bg-[#0d121f] rounded-xl px-3.5 py-2 border border-white/5 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
              Code Hash (Keccak-256)
            </span>
            <span className="text-xs font-mono text-gray-300">
              {codeHash.slice(0, 10)}...{codeHash.slice(-8)}
            </span>
          </div>
          <button
            onClick={handleCopyHash}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Copy Code Hash"
          >
            {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Plain-English Summary */}
      <div className="py-6 border-b border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
          Plain-English Summary
        </h4>
        <p className="text-base text-gray-200 leading-relaxed font-normal">
          {result.summary}
        </p>
      </div>

      {/* Findings Breakdown */}
      <div className="py-6 border-b border-white/10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
          <span>Security Observations ({result.findings.length})</span>
        </h4>

        {result.findings.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No critical anomalies detected in the parsed logic.</p>
        ) : (
          <div className="space-y-3">
            {result.findings.map((finding, idx) => {
              const sev = finding.severity.toLowerCase();
              let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              if (sev === "medium") badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              if (sev === "high") badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#0e1322] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/15 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {finding.title}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {finding.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-normal">
                      {finding.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* On-Chain Monad Action Footer */}
      <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h5 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#836ef9]" />
            Permanent Monad Record
          </h5>
          <p className="text-xs text-gray-400">
            Immortalize this audit verdict on Monad Testnet for the community.
          </p>
        </div>

        <div>
          {!isConnected ? (
            <button
              onClick={connect}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center gap-2"
            >
              Connect Wallet to Save on Monad
            </button>
          ) : isConnected && !isMonad ? (
            <button
              onClick={switchToMonad}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 transition-all flex items-center gap-2"
            >
              Switch to Monad to Record
            </button>
          ) : (
            <button
              onClick={handleSaveOnMonad}
              disabled={isSaving}
              className="relative px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#836ef9] via-[#735df7] to-[#4f46e5] hover:opacity-95 shadow-lg shadow-[#836ef9]/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording on Monad...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Save Report on Monad
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Error Message if save fails */}
      {saveError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          ⚠️ {saveError}
        </div>
      )}

      {/* Transaction Success Banner */}
      {txHash && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Audit successfully recorded on Monad Testnet!</span>
          </div>
          <a
            href={getExplorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
          >
            View on Explorer
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
