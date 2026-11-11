"use client";

import {
  Award,
  Bot,
  Flame,
  MinusCircle,
  Snowflake,
  Trophy,
} from "lucide-react";
import React from "react";
import { StreakStats } from "../types/rps";

interface ScoreBoardProps {
  playerWins: number;
  aiWins: number;
  ties: number;
  totalRounds: number;
  playerWinRate: number;
  aiWinRate: number;
  streaks: StreakStats;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  playerWins,
  aiWins,
  ties,
  totalRounds,
  playerWinRate,
  aiWinRate,
  streaks,
}) => {
  const currentStreak = streaks.current_streak;
  const isPlayerWinStreak = currentStreak > 0;
  const isAiWinStreak = currentStreak < 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
      {/* Player Score */}
      <div className="bg-gradient-to-br from-indigo-950/40 to-gray-900/80 border border-indigo-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-indigo-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">
            You (Player)
          </span>
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-white">
            {playerWins}
          </span>
          <span className="text-xs text-indigo-300 font-medium">
            ({playerWinRate}%)
          </span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
          <Award className="w-3 h-3 text-amber-400" />
          Best Streak:{" "}
          <span className="text-amber-300 font-semibold">
            {streaks.max_player_win_streak}
          </span>
        </div>
      </div>

      {/* AI Score */}
      <div className="bg-gradient-to-br from-purple-950/40 to-gray-900/80 border border-purple-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between text-purple-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">
            Markov AI
          </span>
          <Bot className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-white">
            {aiWins}
          </span>
          <span className="text-xs text-purple-300 font-medium">
            ({aiWinRate}%)
          </span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
          <Award className="w-3 h-3 text-purple-400" />
          Best Streak:{" "}
          <span className="text-purple-300 font-semibold">
            {streaks.max_ai_win_streak}
          </span>
        </div>
      </div>

      {/* Ties & Total */}
      <div className="bg-gradient-to-br from-gray-900/70 to-gray-900/40 border border-gray-800 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between text-gray-400 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold">
            Ties & Rounds
          </span>
          <MinusCircle className="w-4 h-4" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-gray-200">
            {ties}
          </span>
          <span className="text-xs text-gray-400 font-medium">Ties</span>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          Total Rounds:{" "}
          <span className="text-gray-200 font-semibold">{totalRounds}</span>
        </div>
      </div>

      {/* Win-Streak Momentum Card */}
      <div
        className={`border rounded-2xl p-4 shadow-lg backdrop-blur-sm transition-all relative overflow-hidden ${
          isPlayerWinStreak
            ? "bg-gradient-to-br from-amber-950/40 via-orange-950/30 to-gray-900/80 border-orange-500/30 shadow-orange-500/10"
            : isAiWinStreak
              ? "bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-gray-900/80 border-cyan-500/30 shadow-cyan-500/10"
              : "bg-gray-900/50 border-gray-800"
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-xs uppercase tracking-wider font-semibold ${
              isPlayerWinStreak
                ? "text-orange-400"
                : isAiWinStreak
                  ? "text-cyan-400"
                  : "text-gray-400"
            }`}
          >
            Live Momentum
          </span>
          {isPlayerWinStreak ? (
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          ) : isAiWinStreak ? (
            <Snowflake className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <MinusCircle className="w-4 h-4 text-gray-500" />
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl sm:text-4xl font-black ${
              isPlayerWinStreak
                ? "text-orange-400"
                : isAiWinStreak
                  ? "text-cyan-400"
                  : "text-gray-400"
            }`}
          >
            {isPlayerWinStreak ? `+${currentStreak}` : currentStreak}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isPlayerWinStreak
              ? currentStreak >= 3
                ? "🔥 On Fire!"
                : "Win Streak"
              : isAiWinStreak
                ? "AI Streak"
                : "Neutral"}
          </span>
        </div>

        <div className="text-[11px] text-gray-400 mt-1">
          {isPlayerWinStreak && currentStreak >= 3 ? (
            <span className="text-orange-300 font-medium animate-pulse">
              Unstoppable streak detected!
            </span>
          ) : isAiWinStreak && Math.abs(currentStreak) >= 3 ? (
            <span className="text-cyan-300 font-medium">
              AI is reading your pattern!
            </span>
          ) : (
            <span>Streak tracker active</span>
          )}
        </div>
      </div>
    </div>
  );
};
