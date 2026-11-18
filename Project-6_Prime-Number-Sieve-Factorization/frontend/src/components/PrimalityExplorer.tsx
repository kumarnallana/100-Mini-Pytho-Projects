"use client";

import React, { useState, useEffect } from "react";
import { PrimalityResponse } from "../types/prime";
import { checkPrimality } from "../lib/api";
import { ShieldCheck, ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";

const TEST_PRESETS = [
  { val: 97, label: "97 (Prime)" },
  { val: 561, label: "561 (Carmichael)" },
  { val: 7919, label: "7,919 (1000th Prime)" },
  { val: 104729, label: "104,729 (10,000th Prime)" },
  { val: 999999937, label: "999,999,937 (Large Prime)" },
];

export const PrimalityExplorer: React.FC = () => {
  const [inputVal, setInputVal] = useState<string>("7919");
  const [result, setResult] = useState<PrimalityResponse | null>(null);

  useEffect(() => {
    const num = Number(inputVal);
    if (!inputVal.trim() || !Number.isInteger(num)) {
      setResult(null);
      return;
    }
    let active = true;
    checkPrimality(num).then((res) => {
      if (active) setResult(res);
    });
    return () => {
      active = false;
    };
  }, [inputVal]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Deterministic 6k ± 1 Primality Probe
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Tests any integer up to 10¹² in O(√n) time using wheel factorization and finds adjacent prime boundaries
        </p>

        <input
          type="number"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Enter any integer..."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5 text-base font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
        />

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Test Cases:
          </span>
          {TEST_PRESETS.map((p) => (
            <button
              key={p.val}
              onClick={() => setInputVal(String(p.val))}
              className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                Number(inputVal) === p.val
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold"
                  : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Previous Prime */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" /> Previous Prime
            </span>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {result.previous_prime !== null ? result.previous_prime.toLocaleString() : "None"}
            </div>
            {result.previous_prime !== null && (
              <span className="text-[11px] text-gray-500 mt-1 font-mono">
                Distance: −{(result.number - result.previous_prime).toLocaleString()}
              </span>
            )}
          </div>

          {/* Center Verdict */}
          <div
            className={`rounded-2xl p-6 border flex flex-col items-center justify-center text-center shadow-lg ${
              result.is_prime
                ? "bg-gradient-to-br from-emerald-950/50 to-gray-900 border-emerald-500/40 text-emerald-300"
                : "bg-gradient-to-br from-rose-950/40 to-gray-900 border-rose-500/40 text-rose-300"
            }`}
          >
            {result.is_prime ? (
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-2" />
            ) : (
              <ShieldAlert className="w-10 h-10 text-rose-400 mb-2" />
            )}
            <div className="text-2xl font-black font-mono text-white">
              {result.number.toLocaleString()}
            </div>
            <div className="text-sm font-extrabold uppercase tracking-widest mt-1">
              {result.is_prime ? "Confirmed Prime" : "Not Prime"}
            </div>
          </div>

          {/* Next Prime */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
              Next Prime <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
            </span>
            <div className="text-2xl font-black font-mono text-violet-300">
              {result.next_prime.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 font-mono">
              Distance: +{(result.next_prime - result.number).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
