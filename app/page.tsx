"use client";

import React, { useState } from "react";
import { SAFE_CONTRACT_EXAMPLE, SCAM_CONTRACT_EXAMPLE } from "@/lib/examples";
import { AnalysisResult } from "@/lib/types";
import { computeCodeHash } from "@/lib/contract";
import { AnalysisCard } from "@/components/AnalysisCard";
import {
  ShieldCheck,
  Flame,
  SearchCode,
  Sparkles,
  AlertCircle,
  Code2,
  Terminal,
  Zap,
  CheckCircle,
  Info
} from "lucide-react";

export default function HomePage() {
  const [code, setCode] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [codeHash, setCodeHash] = useState<`0x${string}` | null>(null);

  const handleLoadSafeExample = () => {
    setCode(SAFE_CONTRACT_EXAMPLE);
    setError(null);
    setResult(null);
  };

  const handleLoadScamExample = () => {
    setCode(SCAM_CONTRACT_EXAMPLE);
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!code || code.trim().length === 0) {
      setError("Please paste a Solidity smart contract or select an example above.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Compute keccak256 code hash client-side
      const hash = computeCodeHash(code);
      setCodeHash(hash);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze contract.");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Analysis request failed:", err);
      setError(err.message || "An unexpected error occurred during security analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#836ef9]/10 border border-[#836ef9]/30 text-xs font-semibold text-[#a594fd] mb-2">
          <Zap className="w-3.5 h-3.5 fill-[#836ef9] text-[#836ef9]" />
          <span>Real-Time AI Smart Contract Deobfuscator</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          Know what you&apos;re <span className="bg-gradient-to-r from-[#836ef9] via-[#a855f7] to-[#38bdf8] bg-clip-text text-transparent">signing.</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 font-normal leading-relaxed">
          Paste any Solidity source code before interacting. SafeSign uses Gemini AI to decode hidden backdoors, infinite minting, and honeypot traps into plain English, then locks the audit onto Monad Testnet.
        </p>
      </div>

      {/* Code Input Box */}
      <div className="rounded-2xl glass-panel border border-white/10 p-5 sm:p-6 shadow-2xl relative">
        {/* Header Bar with Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
            <Terminal className="w-4 h-4 text-[#836ef9]" />
            <span>Solidity Source Code</span>
            <span className="text-gray-500 font-mono text-[11px]">
              ({code.length} chars)
            </span>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSafeExample}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Load Safe Example
            </button>
            <button
              type="button"
              onClick={handleLoadScamExample}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Load Scam Example
            </button>
          </div>
        </div>

        {/* Textarea */}
        <div className="mt-4 relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Paste Solidity smart contract code here (e.g. pragma solidity ^0.8.20; contract Token { ... })"
            rows={14}
            className="w-full bg-[#090d17]/80 rounded-xl p-4 font-mono text-xs sm:text-sm text-gray-200 border border-white/5 focus:border-[#836ef9]/60 focus:ring-1 focus:ring-[#836ef9]/60 focus:outline-none placeholder:text-gray-600 resize-y leading-relaxed"
          />
        </div>

        {/* Action Button & Info */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Info className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span>Analyzed via Gemini Flash • Response in ~2 seconds • Stored on Monad</span>
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#836ef9] via-[#6366f1] to-[#38bdf8] hover:shadow-lg hover:shadow-[#836ef9]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scanning Smart Contract...</span>
              </>
            ) : (
              <>
                <SearchCode className="w-4 h-4" />
                <span>Analyze Contract</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-rose-200">Analysis Error</div>
            <div className="text-xs text-rose-300 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {result && codeHash && (
        <AnalysisCard result={result} codeHash={codeHash} />
      )}
    </div>
  );
}
