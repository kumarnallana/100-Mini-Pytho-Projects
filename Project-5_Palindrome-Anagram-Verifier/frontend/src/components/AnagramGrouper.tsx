"use client";

import React, { useState, useEffect } from "react";
import { GroupAnagramsResponse } from "../types/verifier";
import { groupAnagrams } from "../lib/api";
import { Boxes, Plus, Sparkles, Trash2 } from "lucide-react";

const DEFAULT_WORDS = ["eat", "tea", "tan", "ate", "nat", "bat", "listen", "silent", "enlist"];

export const AnagramGrouper: React.FC = () => {
  const [wordsText, setWordsText] = useState<string>(DEFAULT_WORDS.join(", "));
  const [result, setResult] = useState<GroupAnagramsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runGrouping = async (rawInput: string) => {
    const list = rawInput
      .split(/[,\s]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (list.length === 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    const data = await groupAnagrams(list);
    setResult(data);
    setLoading(false);
  };

  useEffect(() => {
    runGrouping(wordsText);
  }, [wordsText]);

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-5 sm:p-6 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🧩</span> Multi-Word Anagram Clusterer
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Clusters lists of words into anagram buckets by canonical sorted character signature
            </p>
          </div>

          <button
            onClick={() => setWordsText("")}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" /> Clear
          </button>
        </div>

        <textarea
          rows={3}
          value={wordsText}
          onChange={(e) => setWordsText(e.target.value)}
          placeholder="Enter comma-separated or space-separated words (e.g. eat, tea, tan, ate, nat, bat)..."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 font-mono shadow-inner"
        />

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Sample Banks:
          </span>
          <button
            onClick={() => setWordsText("eat, tea, tan, ate, nat, bat")}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 hover:text-gray-200 transition"
          >
            Classic 6-Word Set
          </button>
          <button
            onClick={() => setWordsText("listen, silent, enlist, tinsel, inlets, stone, tones, notes, onset")}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 hover:text-gray-200 transition"
          >
            Complex 9-Word Clusters
          </button>
          <button
            onClick={() => setWordsText("cinema, iceman, anemic, debitcard, badcredit, elvis, lives")}
            className="text-xs px-2.5 py-1 rounded-lg bg-gray-950/60 border border-gray-800 text-gray-400 hover:text-gray-200 transition"
          >
            Multi-Length Mixed Set
          </button>
        </div>
      </div>

      {/* Cluster Overview Stats */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <span className="text-xs uppercase text-gray-500 font-semibold">Total Words</span>
            <div className="text-2xl font-black text-white mt-1">{result.total_words}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <span className="text-xs uppercase text-cyan-400 font-semibold">Anagram Clusters</span>
            <div className="text-2xl font-black text-cyan-300 mt-1">{result.total_groups}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <span className="text-xs uppercase text-purple-400 font-semibold">Algorithm</span>
            <div className="text-sm font-bold text-gray-300 mt-2 font-mono">Canonical Signature</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <span className="text-xs uppercase text-emerald-400 font-semibold">Time Complexity</span>
            <div className="text-sm font-bold text-emerald-300 mt-2 font-mono">O(N • K log K)</div>
          </div>
        </div>
      )}

      {/* Clustered Group Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(result.groups).map(([signature, wordList], idx) => (
            <div
              key={signature}
              className="bg-gray-900/70 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800">
                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Signature: <strong className="text-white">"{signature}"</strong>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {wordList.length} {wordList.length === 1 ? "word" : "anagrams"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {wordList.map((w, wIdx) => (
                    <span
                      key={wIdx}
                      className="px-3 py-1.5 rounded-xl bg-gray-950 border border-gray-800 text-sm font-mono font-semibold text-gray-200 shadow-sm"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-2 text-[11px] text-gray-500 font-mono">
                Cluster #{idx + 1} • Length {signature.length}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

