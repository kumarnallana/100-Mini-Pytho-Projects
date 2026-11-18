"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SieveResponse } from "../types/prime";
import { runSieve } from "../lib/api";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FastForward,
  Sparkles,
} from "lucide-react";

const PRESET_LIMITS = [30, 50, 100, 150, 200];

const PRIME_COLOR_PALETTE: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  2: {
    bg: "bg-rose-500/20",
    border: "border-rose-500/40",
    text: "text-rose-300",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  3: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  5: {
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    text: "text-violet-300",
    badge: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  },
  7: {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/40",
    text: "text-cyan-300",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
};

function getEliminationStyle(prime: number) {
  return (
    PRIME_COLOR_PALETTE[prime] || {
      bg: "bg-pink-500/20",
      border: "border-pink-500/40",
      text: "text-pink-300",
      badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    }
  );
}

export const SieveVisualizer: React.FC = () => {
  const [limit, setLimit] = useState<number>(100);
  const [data, setData] = useState<SieveResponse | null>(null);
  // -1 = initial untouched, 0..steps.length-1 = specific round, steps.length = completed
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    runSieve(limit).then((res) => {
      if (!active) return;
      setData(res);
      setStepIdx(res.steps.length); // Default to final completed view
      setIsPlaying(false);
    });
    return () => {
      active = false;
    };
  }, [limit]);

  useEffect(() => {
    if (!isPlaying || !data) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= data.steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(timer);
  }, [isPlaying, data]);

  // Build map of eliminated number -> prime that eliminated it up to current stepIdx
  const eliminatedByMap = useMemo(() => {
    const map = new Map<number, { prime: number; isCurrentRound: boolean }>();
    if (!data || stepIdx < 0) return map;

    const maxIdx = Math.min(stepIdx, data.steps.length - 1);
    for (let i = 0; i <= maxIdx; i++) {
      const s = data.steps[i];
      const isCurr = i === stepIdx;
      for (const m of s.multiples_marked) {
        if (!map.has(m)) {
          map.set(m, { prime: s.prime, isCurrentRound: isCurr });
        }
      }
    }
    return map;
  }, [data, stepIdx]);

  const activeStep =
    data && stepIdx >= 0 && stepIdx < data.steps.length ? data.steps[stepIdx] : null;
  const isFinished = data ? stepIdx >= data.steps.length : false;

  const numbers = useMemo(() => {
    const arr: number[] = [];
    for (let i = 2; i <= limit; i++) arr.push(i);
    return arr;
  }, [limit]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚡</span> Interactive Sieve of Eratosthenes
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Iteratively eliminates multiples starting from p² for every prime p ≤ √N
            </p>
          </div>

          {/* Preset Limits */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Upper Limit N:
            </span>
            {PRESET_LIMITS.map((val) => (
              <button
                key={val}
                onClick={() => setLimit(val)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition ${
                  limit === val
                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                    : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider & Step Animation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-xs font-mono text-gray-400">N={limit}</span>
            <input
              type="range"
              min={10}
              max={250}
              step={5}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {data && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(-1);
                }}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
                title="Reset Grid"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.max(-1, p - 1));
                }}
                disabled={stepIdx <= -1}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 transition"
                title="Previous Step"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (stepIdx >= data.steps.length) setStepIdx(-1);
                  setIsPlaying(!isPlaying);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Animate Sieve
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx((p) => Math.min(data.steps.length, p + 1));
                }}
                disabled={stepIdx >= data.steps.length}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 transition"
                title="Next Step"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setStepIdx(data.steps.length);
                }}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition"
                title="Jump to Final Result"
              >
                <FastForward className="w-3.5 h-3.5" /> Final
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Live Metrics Summary */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/70 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
              Primes Found π(N)
            </span>
            <div className="text-2xl font-black text-white mt-1">{data.prime_count}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              PNT Estimate: ~{data.pnt_expected_count}
            </div>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
              Prime Density
            </span>
            <div className="text-2xl font-black text-cyan-300 mt-1">
              {data.prime_density_percent}%
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              Composites: {data.composite_count}
            </div>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              Twin Prime Pairs
            </span>
            <div className="text-2xl font-black text-amber-300 mt-1">
              {data.twin_primes.length}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">Pairs with gap = 2</div>
          </div>

          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4">
            <span className="text-[11px] uppercase tracking-wider text-violet-400 font-semibold">
              Max Prime Gap
            </span>
            <div className="text-2xl font-black text-violet-300 mt-1">
              {data.max_prime_gap}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {data.max_gap_pair
                ? `Between ${data.max_gap_pair[0]} & ${data.max_gap_pair[1]}`
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Active Round Banner */}
      {data && (
        <div className="bg-gray-950/90 border border-gray-800 rounded-xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          {stepIdx === -1 ? (
            <span className="text-gray-300">
              Ready to sieve <strong>{limit - 1}</strong> candidate integers from 2 to {limit}. Click{" "}
              <strong className="text-emerald-400">Animate Sieve</strong> to step through.
            </span>
          ) : activeStep ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                Round #{activeStep.step_num} / {data.steps.length}
              </span>
              <span className="text-gray-200">
                Sieving multiples of prime{" "}
                <strong className="text-white font-mono text-sm">p = {activeStep.prime}</strong>{" "}
                starting at <strong className="font-mono">{activeStep.prime * activeStep.prime}</strong>:
                eliminated <strong className="text-rose-400">{activeStep.newly_eliminated_count}</strong>{" "}
                new composites.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              Sieve Complete! All {data.prime_count} unmarked cells are confirmed prime numbers.
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Prime
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              ×2
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              ×3
            </span>
            <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
              ×5
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ×7+
            </span>
          </div>
        </div>
      )}

      {/* Visual Number Grid */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {numbers.map((num) => {
            const elim = eliminatedByMap.get(num);
            const isActivePrime = activeStep?.prime === num;
            const style = elim ? getEliminationStyle(elim.prime) : null;

            let cellClass = "bg-gray-950 border-gray-800 text-gray-300";
            if (isActivePrime) {
              cellClass =
                "bg-emerald-500 text-gray-950 border-emerald-300 font-black scale-110 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/30";
            } else if (elim && style) {
              cellClass = `${style.bg} ${style.border} ${style.text} line-through opacity-75 ${
                elim.isCurrentRound ? "ring-2 ring-white/40 scale-105 opacity-100" : ""
              }`;
            } else if (isFinished) {
              cellClass =
                "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-sm shadow-emerald-500/10";
            }

            return (
              <div
                key={num}
                title={
                  elim
                    ? `${num} is composite (eliminated by prime ${elim.prime})`
                    : isFinished
                    ? `${num} is prime`
                    : `${num} (candidate)`
                }
                className={`h-10 sm:h-11 rounded-xl border flex items-center justify-center font-mono text-xs sm:text-sm transition-all duration-200 select-none ${cellClass}`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Twin Primes Showcase */}
      {data && data.twin_primes.length > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
            Twin Prime Pairs ≤ {limit}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.twin_primes.map(([p1, p2]) => (
              <span
                key={`${p1}-${p2}`}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 font-mono text-xs font-semibold"
              >
                ({p1}, {p2})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
