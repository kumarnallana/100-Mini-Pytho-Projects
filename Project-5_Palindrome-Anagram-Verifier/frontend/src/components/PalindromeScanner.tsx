"use client";

import React, { useState, useEffect } from "react";
import { PalindromeResponse, PointerStep } from "../types/verifier";
import { verifyPalindrome } from "../lib/api";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const PRESETS = [
  "A man, a plan, a canal: Panama",
  "racecar",
  "Was it a car or a cat I saw?",
  "abca",
  "No 'x' in Nixon",
  "radkar",
  "python",
];

export const PalindromeScanner: React.FC = () => {
  const [text, setText] = useState<string>("A man, a plan, a canal: Panama");
  const [strict, setStrict] = useState<boolean>(false);
  const [result, setResult] = useState<PalindromeResponse | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const runVerification = async (val: string, isStrict: boolean) => {
    if (!val.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    const data = await verifyPalindrome(val, isStrict);
    setResult(data);
    setActiveStepIdx(0);
    setIsPlaying(false);
    setLoading(false);
  };

  useEffect(() => {
    runVerification(text, strict);
  }, [text, strict]);

  // Auto-play animation through two-pointer steps
  useEffect(() => {
    if (!isPlaying || !result || result.steps.length === 0) return;

    const timer = setInterval(() => {
      setActiveStepIdx((prev) => {
        if (prev + 1 >= result.steps.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [isPlaying, result]);

  const currentStep: PointerStep | undefined = result?.steps[activeStepIdx];

  return (
    <div className="space-y-6">
      {/* Input & Controls Card */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🪞</span> Two-Pointer Palindrome Verification
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Scans symmetrically inward from boundary pointers (left = 0, right = n - 1)
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

        {/* Text Input */}
        <div className="relative">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a word, sentence, or phrase to verify..."
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3.5 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition shadow-inner font-mono"
          />
          {text && (
            <button
              onClick={() => setText("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded bg-gray-900"
            >
              Clear
            </button>
          )}
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setText(preset)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                text === preset
                  ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold"
                  : "bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700"
              }`}
            >
              {preset.length > 24 ? preset.slice(0, 24) + "..." : preset}
            </button>
          ))}
        </div>
      </div>

      {/* Outcome Banner & Diagnostics */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Status Badge */}
          <div
            className={`md:col-span-2 rounded-2xl p-5 border flex flex-col justify-between shadow-lg backdrop-blur-sm ${
              result.is_palindrome
                ? "bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-gray-900/80 border-emerald-500/30 text-emerald-300"
                : result.is_almost_palindrome
                ? "bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-gray-900/80 border-amber-500/30 text-amber-300"
                : "bg-gradient-to-br from-rose-950/40 via-rose-900/20 to-gray-900/80 border-rose-500/30 text-rose-300"
            }`}
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                {result.is_palindrome ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : result.is_almost_palindrome ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
                <span className="text-xl font-extrabold uppercase tracking-wide">
                  {result.is_palindrome
                    ? "Valid Palindrome"
                    : result.is_almost_palindrome
                    ? "Almost Palindrome (1 Deletion Away)"
                    : "Not a Palindrome"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {result.is_palindrome
                  ? "Symmetric reflection holds across all character pairs during inward pointer traversal."
                  : result.is_almost_palindrome
                  ? `String can become a palindrome by removing at most 1 character (at index ${result.mismatch?.left_idx} or ${result.mismatch?.right_idx}).`
                  : `Mismatch found at index ${result.mismatch?.left_idx} ('${result.mismatch?.left_char}') and index ${result.mismatch?.right_idx} ('${result.mismatch?.right_char}').`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-800/80 text-xs">
              <span className="text-gray-400">
                Normalized string:{" "}
                <code className="text-white bg-black/40 px-2 py-0.5 rounded font-mono">
                  "{result.clean_text}"
                </code>
              </span>
              <span className="text-gray-400">
                Length: <strong className="text-white">{result.clean_text.length}</strong>
              </span>
              <span className="text-gray-400">
                Comparisons:{" "}
                <strong className="text-cyan-400">{result.total_comparisons}</strong>
              </span>
            </div>
          </div>

          {/* Longest Palindromic Substring Card */}
          <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Longest Sub-Palindrome
              </span>
              <div className="text-2xl font-black text-cyan-300 font-mono break-all">
                "{result.longest_palindrome_substring}"
              </div>
            </div>
            <div className="text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-800">
              Substring length:{" "}
              <strong className="text-white">
                {result.longest_palindrome_substring.length}
              </strong>{" "}
              characters (detected via Expand Around Center)
            </div>
          </div>
        </div>
      )}

      {/* Two-Pointer Interactive Visualizer */}
      {result && result.clean_text.length > 0 && (
        <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📍</span> Interactive Two-Pointer Visualizer
              </h3>
              <p className="text-xs text-gray-400">
                Watch the Left (cyan) and Right (violet) pointers converge towards the center
              </p>
            </div>

            {/* Step Controls */}
            {result.steps.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveStepIdx((p) => Math.max(0, p - 1))}
                  disabled={activeStepIdx === 0}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 transition"
                  title="Previous Step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md shadow-cyan-600/20"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Auto-Play
                    </>
                  )}
                </button>

                <button
                  onClick={() => setActiveStepIdx((p) => Math.min(result.steps.length - 1, p + 1))}
                  disabled={activeStepIdx >= result.steps.length - 1}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 disabled:opacity-40 transition"
                  title="Next Step"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setActiveStepIdx(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
                  title="Reset to Step 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono text-gray-400 ml-2">
                  Step {activeStepIdx + 1} / {result.steps.length}
                </span>
              </div>
            )}
          </div>

          {/* Visual String Character Array */}
          <div className="overflow-x-auto pb-4 pt-8">
            <div className="flex items-center justify-center gap-1.5 min-w-fit px-4">
              {result.clean_text.split("").map((ch, idx) => {
                const isLeft = currentStep?.left_idx === idx;
                const isRight = currentStep?.right_idx === idx;
                const isComparedInStep = isLeft || isRight;
                const isMatched = isComparedInStep && currentStep?.is_match;
                const isMismatch = isComparedInStep && !currentStep?.is_match;

                return (
                  <div key={idx} className="flex flex-col items-center relative group">
                    {/* Pointer Indicator Arrow */}
                    {isLeft && (
                      <div className="absolute -top-7 text-xs font-black text-cyan-400 flex flex-col items-center animate-bounce">
                        <span>L ▼</span>
                      </div>
                    )}
                    {isRight && !isLeft && (
                      <div className="absolute -top-7 text-xs font-black text-purple-400 flex flex-col items-center animate-bounce">
                        <span>R ▼</span>
                      </div>
                    )}
                    {isLeft && isRight && (
                      <div className="absolute -top-7 text-xs font-black text-emerald-400 flex flex-col items-center animate-bounce">
                        <span>LR▼</span>
                      </div>
                    )}

                    {/* Character Tile */}
                    <div
                      className={`w-10 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg border transition-all duration-200 ${
                        isMatched
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-110 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/40"
                          : isMismatch
                          ? "bg-rose-500/20 border-rose-400 text-rose-300 scale-110 shadow-lg shadow-rose-500/20 ring-2 ring-rose-500/40"
                          : isLeft
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 scale-105"
                          : isRight
                          ? "bg-purple-500/20 border-purple-400 text-purple-300 scale-105"
                          : "bg-gray-950 border-gray-800 text-gray-300 hover:border-gray-700"
                      }`}
                    >
                      {ch}
                    </div>

                    {/* Index Subscript */}
                    <span className="text-[10px] font-mono text-gray-500 mt-1">{idx}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Step Diagnostic Strip */}
          {currentStep && (
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-gray-800 font-mono font-bold text-gray-200">
                  Step #{currentStep.step_num}
                </span>
                <span className="text-gray-300">
                  Comparing Left <strong className="text-cyan-400">[{currentStep.left_idx}] '{currentStep.left_char}'</strong>{" "}
                  with Right <strong className="text-purple-400">[{currentStep.right_idx}] '{currentStep.right_char}'</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[11px] border ${
                    currentStep.is_match
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  }`}
                >
                  {currentStep.is_match ? "✓ Matches" : "✗ Mismatch"}
                </span>
              </div>
            </div>
          )}

          {/* Step Comparison Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-800 max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-950 text-gray-400 uppercase font-mono text-[10px] sticky top-0">
                <tr>
                  <th className="py-2.5 px-4">Step</th>
                  <th className="py-2.5 px-4">Left Pointer</th>
                  <th className="py-2.5 px-4">Right Pointer</th>
                  <th className="py-2.5 px-4">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-mono">
                {result.steps.map((s, idx) => (
                  <tr
                    key={s.step_num}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`cursor-pointer transition-colors ${
                      idx === activeStepIdx
                        ? "bg-cyan-500/10 text-white font-semibold"
                        : "hover:bg-gray-800/40"
                    }`}
                  >
                    <td className="py-2 px-4 text-cyan-400">#{s.step_num}</td>
                    <td className="py-2 px-4">
                      Index {s.left_idx} ('{s.left_char}')
                    </td>
                    <td className="py-2 px-4">
                      Index {s.right_idx} ('{s.right_char}')
                    </td>
                    <td className="py-2 px-4">
                      {s.is_match ? (
                        <span className="text-emerald-400 font-bold">✓ MATCH</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✗ MISMATCH</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

