"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OnChainReport } from "@/lib/types";
import { getExplorerAddressUrl, getExplorerTxUrl } from "@/lib/monad";
import { REGISTRY_ADDRESS } from "@/lib/contract";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  ArrowRight,
  Database,
  Filter
} from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState<OnChainReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterVerdict, setFilterVerdict] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch reports");
      setReports(data.reports || []);
    } catch (err: any) {
      console.error("Error loading reports:", err);
      setError(err.message || "Failed to load on-chain reports.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredReports = reports.filter((r) => {
    const matchesVerdict =
      filterVerdict === "All" || r.verdict.toLowerCase() === filterVerdict.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      r.codeHash.toLowerCase().includes(query) ||
      r.reporter.toLowerCase().includes(query);
    return matchesVerdict && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Recent";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#836ef9]/10 border border-[#836ef9]/30 text-xs font-semibold text-[#a594fd] mb-3">
            <Database className="w-3.5 h-3.5 text-[#836ef9]" />
            <span>Monad On-Chain Security Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Live Audit Feed
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1 max-w-xl">
            Explore verified smart contract security reports immutably recorded by users on Monad Testnet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {REGISTRY_ADDRESS && (
            <a
              href={getExplorerAddressUrl(REGISTRY_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
            >
              <span>Contract on Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            onClick={loadReports}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#836ef9] to-[#6366f1] hover:shadow-lg hover:shadow-[#836ef9]/25 transition-all flex items-center gap-1.5"
          >
            <span>Scan Contract</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code hash or reporter address..."
            className="w-full bg-[#0d121f] rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-200 border border-white/10 focus:border-[#836ef9]/60 focus:outline-none placeholder:text-gray-600"
          />
        </div>

        {/* Verdict Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0d121f] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {["All", "Safe", "Caution", "Dangerous"].map((v) => (
            <button
              key={v}
              onClick={() => setFilterVerdict(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterVerdict === v
                  ? "bg-[#836ef9] text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#836ef9]/30 border-t-[#836ef9] rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Querying Monad Testnet events...</span>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <p className="font-semibold">Unable to fetch on-chain reports</p>
            <p className="text-xs text-rose-400 mt-1">{error}</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-20 text-center rounded-2xl glass-panel border border-white/10 p-8">
            <Activity className="w-12 h-12 text-[#836ef9]/50 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No reports found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
              {searchQuery || filterVerdict !== "All"
                ? "No on-chain audits match your current filter criteria."
                : "No smart contract reports have been submitted to Monad yet. Be the first to analyze and save a contract!"}
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#836ef9] to-[#6366f1] hover:shadow-lg hover:shadow-[#836ef9]/25 transition-all"
            >
              Analyze a Contract Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReports.map((report, idx) => {
              const verdictLower = report.verdict.toLowerCase();
              let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
              let Icon = ShieldCheck;
              if (verdictLower.includes("caution")) {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                Icon = AlertTriangle;
              } else if (verdictLower.includes("danger")) {
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
                Icon = Flame;
              }

              return (
                <div
                  key={idx}
                  className="rounded-2xl glass-panel border border-white/10 p-5 sm:p-6 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Score & Code Hash */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    {/* Score badge */}
                    <div className="w-14 h-14 rounded-xl bg-[#0c101d] border border-white/10 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-lg font-black text-white">{report.score}</span>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">
                        Score
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeColor}`}
                        >
                          <Icon className="w-3 h-3" />
                          {report.verdict}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(report.timestamp)}
                        </span>
                      </div>

                      {/* Code hash */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-300 truncate">
                          {report.codeHash}
                        </span>
                        <button
                          onClick={() => handleCopy(report.codeHash, `hash-${idx}`)}
                          className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                          title="Copy Code Hash"
                        >
                          {copiedHash === `hash-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Reporter & Explorer Links */}
                  <div className="flex flex-row md:flex-col items-start md:items-end justify-between w-full md:w-auto gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="text-gray-500">Auditor:</span>
                      <a
                        href={getExplorerAddressUrl(report.reporter)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[#a594fd] hover:underline flex items-center gap-1"
                      >
                        {report.reporter.slice(0, 6)}...{report.reporter.slice(-4)}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {report.txHash && (
                      <a
                        href={getExplorerTxUrl(report.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        Tx Record <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
