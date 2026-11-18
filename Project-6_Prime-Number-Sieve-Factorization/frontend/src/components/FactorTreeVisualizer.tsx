"use client";

import React, { useState, useEffect } from "react";
import { FactorNode, FactorizationResponse } from "../types/prime";
import { factorizeNumber } from "../lib/api";
import { GitFork, Sparkles, Layers, Sigma, Calculator } from "lucide-react";

const PRESETS = [
  { val: 360, label: "360 (Highly Composite)" },
  { val: 84, label: "84 (Classic)" },
  { val: 28, label: "28 (Perfect)" },
  { val: 496, label: "496 (Perfect)" },
  { val: 97, label: "97 (Prime)" },
  { val: 1024, label: "1024 (2¹⁰)" },
  { val: 2310, label: "2310 (Primorial)" },
];

const TreeNodeView: React.FC<{ node: FactorNode }> = ({ node }) => {
  const hasChildren = Boolean(node.left || node.right);

  return (
    <div className="flex flex-col items-center">
      {/* Node Circle / Pill */}
      <div
        className={`px-3.5 py-2 rounded-2xl border-2 font-mono font-black text-sm shadow-lg transition-transform hover:scale-105 ${
          node.is_prime
            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-emerald-500/20 ring-2 ring-emerald-500/20"
            : "bg-indigo-950/70 border-indigo-400/50 text-white shadow-indigo-500/10"
        }`}
      >
        <span>{node.value.toLocaleString()}</span>
        {node.is_prime && (
          <span className="ml-1.5 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 align-middle">
            P
          </span>
        )}
      </div>

      {/* Branches to Children */}
      {hasChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical stem down from parent */}
          <div className="w-0.5 h-5 bg-gray-700" />
          {/* Horizontal connector bar */}
          <div className="flex items-start gap-6 sm:gap-10 relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-700" />

            {node.left && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-5 bg-gray-700" />
                <TreeNodeView node={node.left} />
              </div>
            )}

            {node.right && (
              <div className="flex flex-col items-center">
                <div className="w-0.5 h-5 bg-gray-700" />
                <TreeNodeView node={node.right} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FactorTreeVisualizer: React.FC = () => {
  const [inputVal, setInputVal] = useState<string>("360");
  const [result, setResult] = useState<FactorizationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parsed = Number(inputVal);
    if (!inputVal.trim() || !Number.isInteger(parsed) || parsed < 2) {
      setError("Please enter an integer ≥ 2.");
      return;
    }
    if (parsed > 1_000_000_000_000) {
      setError("Please enter an integer ≤ 1,000,000,000,000.");
      return;
    }
    setError(null);
    let active = true;
    factorizeNumber(parsed).then((res) => {
      if (active) setResult(res);
    });
    return () => {
      active = false;
    };
  }, [inputVal]);

  const classColor = (cls: string) => {
    if (cls === "prime") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    if (cls === "perfect") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    if (cls === "abundant") return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    return "bg-violet-500/15 text-violet-300 border-violet-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            Prime Factorization & Recursive Factor Tree
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Decomposes any integer into its unique prime signature (Fundamental Theorem of Arithmetic)
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min={2}
            max={1000000000000}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter integer ≥ 2 (e.g. 360)..."
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-base font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
        </div>

        {error && <p className="text-xs text-rose-400 mt-2 font-medium">{error}</p>}

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Presets:
          </span>
          {PRESETS.map((p) => (
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

      {/* Canonical Formula & Key Metrics */}
      {result && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Canonical Equation Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-emerald-950/40 via-gray-900/80 to-gray-950 border border-emerald-500/25 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                    Canonical Prime Factorization
                  </span>
                  <span
                    className={`text-[11px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${classColor(
                      result.classification
                    )}`}
                  >
                    {result.classification}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono break-all">
                  {result.number.toLocaleString()} ={" "}
                  <span className="text-emerald-300">{result.canonical_formula}</span>
                </div>
              </div>

              {/* Exponent Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-800/80">
                <span className="text-xs text-gray-400">Prime Powers:</span>
                {Object.entries(result.factor_exponents).map(([base, exp]) => (
                  <span
                    key={base}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300 font-bold"
                  >
                    {base}
                    {exp > 1 && <sup className="text-emerald-200 ml-0.5">{exp}</sup>}
                  </span>
                ))}
              </div>
            </div>

            {/* Number Theory Stats Card */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg space-y-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Sigma className="w-3.5 h-3.5" /> Euler's Totient φ(n)
                </span>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {result.euler_totient.toLocaleString()}
                </div>
                <p className="text-[11px] text-gray-400">
                  Integers ≤ {result.number.toLocaleString()} coprime to {result.number.toLocaleString()}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800 text-xs flex justify-between text-gray-300">
                <span>Proper Divisor Sum:</span>
                <strong className="font-mono text-amber-300">
                  {result.proper_divisor_sum.toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive Recursive Factor Tree Canvas */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 mb-6 border-b border-gray-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🌳</span> Visual Prime Factor Tree
                </h3>
                <p className="text-xs text-gray-400">
                  Emerald leaf nodes (P) represent indivisible prime factors; indigo nodes decompose further
                </p>
              </div>
              <span className="text-xs font-mono text-gray-400">
                Total Prime Leaves: <strong className="text-emerald-400">{result.prime_factors.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto py-4 flex justify-center">
              <div className="min-w-fit px-6">
                <TreeNodeView node={result.factor_tree} />
              </div>
            </div>
          </div>

          {/* Divisors & Goldbach Decomposition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All Divisors */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center justify-between">
                <span>All Positive Divisors</span>
                <span className="text-cyan-400 font-mono">Count: {result.divisor_count}</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                {result.all_divisors.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-md bg-gray-950 border border-gray-800 font-mono text-xs text-gray-300"
                  >
                    {d.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>

            {/* Goldbach Conjecture Pairs */}
            <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 shadow-lg">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
                <span>Goldbach Prime Pairs (p₁ + p₂ = n)</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              {result.goldbach_pairs.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {result.goldbach_pairs.map(([p1, p2]) => (
                    <span
                      key={`${p1}-${p2}`}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 font-mono text-xs text-amber-300"
                    >
                      {p1} + {p2}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  {result.number % 2 !== 0
                    ? "Goldbach's Conjecture applies to even integers > 2."
                    : "Goldbach pairs computed for even integers 4 ≤ n ≤ 100,000."}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
