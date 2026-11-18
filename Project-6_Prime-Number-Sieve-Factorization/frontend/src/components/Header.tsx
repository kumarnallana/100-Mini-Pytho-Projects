"use client";

import React from "react";
import { Binary, Cpu } from "lucide-react";

interface HeaderProps {
  serverConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ serverConnected }) => {
  return (
    <header className="border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
            🔢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tier 1 • Project 06
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 border ${
                  serverConnected
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    serverConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                  }`}
                />
                {serverConnected ? "FastAPI Live" : "Client Engine"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
              Prime Number Sieve{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold text-sm sm:text-base">
                & Factorization Studio
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            Eratosthenes O(n log log n) • Factor Trees
          </span>
        </div>
      </div>
    </header>
  );
};
