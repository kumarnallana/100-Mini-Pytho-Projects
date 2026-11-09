"use client";

import React from "react";
import { RotateCcw, Activity, ShieldCheck, Flame } from "lucide-react";

interface HeaderProps {
  serverConnected: boolean;
  onReset: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  serverConnected,
  onReset,
  isResetting,
}) => {
  return (
    <header className="border-b border-gray-800/80 bg-gray-950/60 backdrop-blur-md sticky top-0 z-50 py-4 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
            🤖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Tier 1 • Project 04
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
                {serverConnected ? "FastAPI Connected" : "Local Mode"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 mt-0.5">
              Rock • Paper • Scissors{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 font-extrabold text-sm sm:text-base">
                AI Probability Tracker
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            disabled={isResetting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-200 border border-gray-700/60 transition shadow-sm hover:border-gray-600 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
            Reset Match
          </button>
        </div>
      </div>
    </header>
  );
};

