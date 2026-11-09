"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "../components/Header";
import { ScoreBoard } from "../components/ScoreBoard";
import { GameArena } from "../components/GameArena";
import { MoveType, RoundRecord, GameStats, StreakStats } from "../types/rps";
import { fetchHealth, fetchStats, playMove, resetGame } from "../lib/api";

const INITIAL_STREAKS: StreakStats = {
  current_streak: 0,
  current_streak_type: "none",
  max_player_win_streak: 0,
  max_ai_win_streak: 0,
  total_player_win_streaks_ge_3: 0,
};

export default function Home() {
  const [serverConnected, setServerConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [lastRound, setLastRound] = useState<RoundRecord | null>(null);

  const [stats, setStats] = useState<Partial<GameStats>>({
    total_rounds: 0,
    player_wins: 0,
    ai_wins: 0,
    ties: 0,
    player_win_rate: 0,
    ai_win_rate: 0,
    streaks: INITIAL_STREAKS,
  });

  // Verify backend connectivity and fetch current stats
  const syncStats = useCallback(async () => {
    const health = await fetchHealth();
    if (health) {
      setServerConnected(true);
      const data = await fetchStats();
      if (data) {
        setStats(data);
        if (data.recent_history && data.recent_history.length > 0) {
          setLastRound(data.recent_history[data.recent_history.length - 1]);
        }
      }
    } else {
      setServerConnected(false);
    }
  }, []);

  useEffect(() => {
    syncStats();
    // Periodic health poll every 5s
    const interval = setInterval(syncStats, 5000);
    return () => clearInterval(interval);
  }, [syncStats]);

  const handlePlayMove = async (move: MoveType) => {
    setIsLoading(true);
    try {
      const res = await playMove(move);
      if (res) {
        const roundRecord: RoundRecord = {
          round_number: res.round_number,
          player_move: res.player_move,
          ai_move: res.ai_move,
          outcome: res.outcome,
          predicted_player_move: res.predicted_player_move,
          prediction_confidence: res.prediction_confidence,
          prediction_correct: res.prediction_correct,
          current_streak: res.current_streak,
          timestamp: Date.now() / 1000,
        };
        setLastRound(roundRecord);
        setStats((prev) => ({
          ...prev,
          total_rounds: res.scores.total_rounds,
          player_wins: res.scores.player_wins,
          ai_wins: res.scores.ai_wins,
          ties: res.scores.ties,
          player_win_rate: res.scores.player_win_rate,
          ai_win_rate: res.scores.ai_win_rate,
          streaks: res.streak_stats,
        }));
      }
    } catch (err) {
      console.error("Error executing round:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetGame();
      setLastRound(null);
      setStats({
        total_rounds: 0,
        player_wins: 0,
        ai_wins: 0,
        ties: 0,
        player_win_rate: 0,
        ai_win_rate: 0,
        streaks: INITIAL_STREAKS,
      });
    } catch (err) {
      console.error("Error resetting game:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-between">
      <div>
        <Header
          serverConnected={serverConnected}
          onReset={handleReset}
          isResetting={isResetting}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Top Scoreboard Cards */}
          <ScoreBoard
            playerWins={stats.player_wins || 0}
            aiWins={stats.ai_wins || 0}
            ties={stats.ties || 0}
            totalRounds={stats.total_rounds || 0}
            playerWinRate={stats.player_win_rate || 0}
            aiWinRate={stats.ai_win_rate || 0}
            streaks={stats.streaks || INITIAL_STREAKS}
          />

          {/* Interactive Game Arena */}
          <GameArena
            onPlayMove={handlePlayMove}
            isLoading={isLoading}
            lastRound={lastRound}
          />
        </main>
      </div>

      <footer className="border-t border-gray-900 py-6 px-4 text-center text-xs text-gray-500">
        100 Mini Python Projects • Tier 1: Project 04 — Rock-Paper-Scissors with Probability Tracker & Markov Pattern Detection
      </footer>
    </div>
  );
}

