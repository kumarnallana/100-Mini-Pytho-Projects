"use client";

import React, { useState, useEffect } from "react";
import { AnagramResponse } from "../types/verifier";
import { verifyAnagram } from "../lib/api";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRightLeft,
  Scale,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

const ANAGRAM_PRESETS = [
  { s1: "listen", s2: "silent", label: "Classic: listen ↔ silent" },
  { s1: "Dormitory", s2: "Dirty room", label: "Sentence: Dormitory ↔ Dirty room" },
  { s1: "The Eyes", s2: "They See", label: "Phrasal: The Eyes ↔ They See" },
  { s1: "cat", s2: "catch", label: "Subset: cat ⊂ catch" },
  { s1: "apple", s2: "pale", label: "Mismatch: apple ≉ pale" },
];

export const AnagramComparator: React.FC = () => {
  const [text1, setText1] = useState<string>("listen");
  const [text2, setText2] = useState<string>("silent");
  const [strict, setStrict] = useState<boolean>(false);
  const [result, setResult] = useState<AnagramResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runComparison = async (s1: string, s2: string, isStrict: boolean) => {
    if (!s1.trim() && !s2.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    const data = await verifyAnagram(s1, s2, isStrict);
    setResult(data);
    setLoading(false);
  };

  useEffect(() => {
    runComparison(text1, text2, strict);
  }, [text1, text2, strict]);

  const handleSwap = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
  };

  const allChars = result
    ? Array.from(new Set([...Object.keys(result.freq_map1), ...Object.keys(result.freq_map2)])).sort()
    : [];

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>⚖️</span> Character Frequency Map Comparator
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Accumulates character frequencies O(n) and verifies delta balance: F₁(c) == F₂(c)
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-300 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800 hover:border-gray-700 transition">
            <input
              type="checkbox"
              checked={strict}
              onChange={(e) => setStrict(e.target.checked)}
              className="rounded bg-gray-900 border-gray-700 text-cyan-500 focus:ring-cyan-500/20"
            />
            <span>Strict Mode (Case & Punctuation)</span>
          </label>
        </div>

        {/* Two-String Inputs with Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
              String 1
            </label>
            <input
              type="text"
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="First string..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 font-mono shadow-inner"
            />
          </div>

          <div className="md:col-span-1 flex justify-center pt-5">
            <button
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 transition active:scale-95"
              title="Swap String 1 and String 2"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5 relative">
            <label className="block text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
              String 2
            </label>
            <input
              type="text"
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="Second string..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 font-mono shadow-inner"
            />
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Presets:
          </span>
          {ANAGRAM_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setText1(p.s1);
                setText2(p.s2);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Status */}
          <div
            className={`md:col-span-2 rounded-2xl p-5 border flex flex-col justify-between shadow-lg backdrop-blur-sm ${
              result.is_anagram
                ? "bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-gray-900/80 border-emerald-500/30 text-emerald-300"
                : result.is_sub_anagram
                ? "bg-gradient-to-br from-blue-950/40 via-indigo-900/20 to-gray-900/80 border-blue-500/30 text-blue-300"
                : "bg-gradient-to-br from-rose-950/40 via-rose-900/20 to-gray-900/80 border-rose-500/30 text-rose-300"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                {result.is_anagram ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : result.is_sub_anagram ? (
                  <Scale className="w-6 h-6 text-blue-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <span className="text-xl font-extrabold uppercase tracking-wide">
                  {result.is_anagram
                    ? "Valid Anagram"
                    : result.is_sub_anagram
                    ? "Sub-Anagram (Subset)"
                    : "Not an Anagram"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {result.is_anagram
                  ? "Both strings share an exact 1-to-1 multiset character frequency mapping across all unique characters."
                  : result.is_sub_anagram
                  ? `Every character in String 1 exists in String 2 with sufficient multiplicity (String 1 ⊂ String 2).`
                  : `Character frequency histograms diverge. ${result.min_edits_needed} character insertions/deletions required to balance.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-800/80 text-xs">
              <span className="text-gray-400">
                Str 1: <code className="text-white bg-black/40 px-2 py-0.5 rounded font-mono">"{result.clean_text1}"</code>
              </span>
              <span className="text-gray-400">
                Str 2: <code className="text-white bg-black/40 px-2 py-0.5 rounded font-mono">"{result.clean_text2}"</code>
              </span>
              <span className="text-gray-400">
                Unique Alphabet: <strong className="text-white">{result.total_unique_chars}</strong>
              </span>
            </div>
          </div>

          {/* Edit Distance & Surplus Diagnostic Card */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                Delta & Balancing
              </span>
              <div className="text-3xl font-black text-white font-mono">
                {result.min_edits_needed}{" "}
                <span className="text-xs font-normal text-gray-400 uppercase">
                  Edits Needed
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-3 pt-2 border-t border-gray-800 text-xs">
              {Object.keys(result.surplus_text1).length > 0 && (
                <div className="text-cyan-400 flex items-center gap-1 flex-wrap">
                  <span className="text-gray-400">Str 1 Surplus:</span>
                  {Object.entries(result.surplus_text1).map(([c, n]) => (
                    <span key={c} className="px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 font-mono">
                      '{c}': +{n}
                    </span>
                  ))}
                </div>
              )}
              {Object.keys(result.surplus_text2).length > 0 && (
                <div className="text-purple-400 flex items-center gap-1 flex-wrap">
                  <span className="text-gray-400">Str 2 Surplus:</span>
                  {Object.entries(result.surplus_text2).map(([c, n]) => (
                    <span key={c} className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800 font-mono">
                      '{c}': +{n}
                    </span>
                  ))}
                </div>
              )}
              {result.is_anagram && (
                <div className="text-emerald-400 font-semibold">
                  ✓ Perfectly balanced (0 surplus)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Visual Frequency Map & Delta Histogram */}
      {result && allChars.length > 0 && (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📊</span> Character Frequency Map & Delta Histogram
              </h3>
              <p className="text-xs text-gray-400">
                Blue = String 1 count, Purple = String 2 count, Green = Balanced
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" /> Str 1
              </span>
              <span className="flex items-center gap-1 text-purple-400">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" /> Str 2
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Balanced
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
            {allChars.map((ch) => {
              const c1 = result.freq_map1[ch] || 0;
              const c2 = result.freq_map2[ch] || 0;
              const diff = result.char_diff[ch] || 0;
              const isBalanced = diff === 0;

              return (
                <div
                  key={ch}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition ${
                    isBalanced
                      ? "bg-gray-950/60 border-gray-800 hover:border-emerald-500/40"
                      : "bg-gray-950 border-gray-800 hover:border-rose-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-700 flex items-center justify-center font-mono font-bold text-sm text-white">
                      '{ch}'
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isBalanced
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : diff > 0
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}
                    >
                      {isBalanced ? "MATCH" : diff > 0 ? `+${diff} in Str 1` : `${diff} in Str 2`}
                    </span>
                  </div>

                  {/* Frequency Comparison Bars */}
                  <div className="space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400">Str 1:</span>
                      <span className="text-gray-300 font-bold">{c1}</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, c1 * 25)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-purple-400">Str 2:</span>
                      <span className="text-gray-300 font-bold">{c2}</span>
                    </div>
                    <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, c2 * 25)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

