"use client";

import confetti from "canvas-confetti";
import { BrainCircuit } from "lucide-react";
import React, { useEffect } from "react";
import { MoveType } from "../types/rps";

const MOVE_CONFIG: Record<
  MoveType,
  {
    label: string;
    emoji: string;
    color: string;
    border: string;
    bg: string;
    key: string;
  }
> = {
  rock: {
    label: "Rock",
    emoji: "🪨",
    color: "text-amber-400",
    border: "border-amber-500/40 hover:border-amber-400",
    bg: "bg-amber-500/10 hover:bg-amber-500/20 shadow-amber-500/10",
    key: "R",
  },
  paper: {
    label: "Paper",
    emoji: "📄",
    color: "text-blue-400",
    border: "border-blue-500/40 hover:border-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 shadow-blue-500/10",
    key: "P",
  },
  scissors: {
    label: "Scissors",
    emoji: "✂️",
    color: "text-emerald-400",
    border: "border-emerald-500/40 hover:border-emerald-400",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 shadow-emerald-500/10",
    key: "S",
  },
};

export const GameArena: React.FC<GameArenaProps> = ({
  onPlayMove,
  isLoading,
  lastRound,
}) => {
  // Fire confetti on player win or win-streak milestone
  useEffect(() => {
    if (lastRound?.outcome === "win") {
      if (lastRound.current_streak >= 3) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#f97316", "#eab308", "#6366f1"],
        });
      } else {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.7 },
        });
      }
    }
  }, [lastRound]);

  // Keyboard shortcut listener (R, P, S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      const k = e.key.toLowerCase();
      if (k === "r") onPlayMove("rock");
      else if (k === "p") onPlayMove("paper");
      else if (k === "s") onPlayMove("scissors");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, onPlayMove]);

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Duel Showdown Stage */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 px-4 bg-gray-950/70 border border-gray-800/80 rounded-2xl">
          {/* Player Choice Side */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
              <span>👤</span> Your Choice
            </span>
            <div className="w-24 h-24 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-center text-5xl shadow-inner shadow-indigo-500/10 transition-transform duration-300 hover:scale-105">
              {lastRound ? MOVE_CONFIG[lastRound.player_move]?.emoji : "❔"}
            </div>
            <span className="text-sm font-bold text-gray-200 mt-2 capitalize">
              {lastRound ? lastRound.player_move : "Choose a move"}
            </span>
          </div>

          {/* VS Badge & Outcome Status */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-500/30 ring-4 ring-gray-900">
              VS
            </div>

            {lastRound && (
              <div
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                  lastRound.outcome === "win"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-pulse"
                    : lastRound.outcome === "loss"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-gray-500/10 text-gray-300 border-gray-500/30"
                }`}
              >
                {lastRound.outcome === "win"
                  ? "🎉 YOU WON"
                  : lastRound.outcome === "loss"
                    ? "💀 AI WON"
                    : "🤝 DRAW"}
              </div>
            )}
          </div>

          {/* AI Choice Side */}
          <div className="flex-1 flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
              <span>🤖</span> Markov AI
            </span>
            <div className="w-24 h-24 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-center text-5xl shadow-inner shadow-purple-500/10 transition-transform duration-300 hover:scale-105">
              {lastRound ? MOVE_CONFIG[lastRound.ai_move]?.emoji : "❔"}
            </div>
            <span className="text-sm font-bold text-gray-200 mt-2 capitalize">
              {lastRound ? lastRound.ai_move : "Waiting..."}
            </span>
          </div>
        </div>

        {/* Prediction Accuracy Badge */}
        {lastRound && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-950/40 py-1.5 px-3 rounded-lg border border-gray-800/60 max-w-md mx-auto">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              AI predicted you would throw{" "}
              <strong className="text-gray-200 uppercase">
                {lastRound.predicted_player_move}
              </strong>{" "}
              ({lastRound.prediction_confidence}%)
            </span>
            <span
              className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                lastRound.prediction_correct
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}
            >
              {lastRound.prediction_correct
                ? "Predicted Correctly"
                : "You Fooled It"}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Action Move Buttons */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Make Your Move (or press keyboard key):
          </span>
          <span className="text-[11px] text-gray-500 hidden sm:inline">
            Hotkeys: [R] Rock • [P] Paper • [S] Scissors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.keys(MOVE_CONFIG) as MoveType[]).map((moveKey) => {
            const config = MOVE_CONFIG[moveKey];
            return (
              <button
                key={moveKey}
                onClick={() => onPlayMove(moveKey)}
                disabled={isLoading}
                className={`relative group flex flex-col items-center justify-center p-5 rounded-2xl border ${config.border} ${config.bg} shadow-lg transition-all duration-200 hover:-translate-y-1 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none`}
              >
                <div className="text-4xl sm:text-5xl mb-2 transition-transform duration-200 group-hover:scale-110">
                  {config.emoji}
                </div>
                <div className="text-base font-extrabold text-white tracking-wide">
                  {config.label}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-gray-900 border border-gray-700 text-gray-300 font-mono text-[10px]">
                    {config.key}
                  </span>
                  <span>to play</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
