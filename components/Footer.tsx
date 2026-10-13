import React from "react";
import Link from "next/link";
import { Shield, ExternalLink, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07090e]/90 mt-20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#836ef9]" />
          <span className="font-semibold text-gray-300">SafeSign</span>
          <span>•</span>
          <span className="text-[#a594fd] font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 fill-current" />
            Built for Monad Metropolis hackathon
          </span>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
          <a
            href="https://monadscan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            MonadScan
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://docs.monad.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white flex items-center gap-1 transition-colors"
          >
            Monad Docs
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>Chain ID: 143</span>
        </div>
      </div>
    </footer>
  );
}
