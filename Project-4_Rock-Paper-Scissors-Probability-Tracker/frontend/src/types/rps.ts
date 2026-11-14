export type MoveType = "rock" | "paper" | "scissors";
export type OutcomeType = "win" | "loss" | "draw";

export interface StreakStats {
  current_streak: number;
  current_streak_type: "win" | "loss" | "none";
  max_player_win_streak: number;
  max_ai_win_streak: number;
  total_player_win_streaks_ge_3: number;
}

export interface NextPrediction {
  predicted_player_move: MoveType;
  recommended_ai_move: MoveType;
  confidence_percent: number;
  rationale: string;
}

export interface RoundRecord {
  round_number: number;
  player_move: MoveType;
  ai_move: MoveType;
  outcome: OutcomeType;
  predicted_player_move: MoveType;
  prediction_confidence: number;
  prediction_correct: boolean;
  current_streak: number;
  timestamp: number;
}

export interface GameStats {
  total_rounds: number;
  player_wins: number;
  ai_wins: number;
  ties: number;
  player_win_rate: number;
  ai_win_rate: number;
  tie_rate: number;
  ai_prediction_accuracy: number;
  streaks: StreakStats;
  player_probabilities: Record<MoveType, number>;
  player_counts: Record<MoveType, number>;
  markov_transitions: Record<MoveType, Record<MoveType, number>>;
  wsls_transitions: Record<string, Record<MoveType, number>>;
  next_prediction: NextPrediction;
  recent_history: RoundRecord[];
}

export interface PlayRoundResponse {
  round_number: number;
  player_move: MoveType;
  ai_move: MoveType;
  outcome: OutcomeType;
  predicted_player_move: MoveType;
  prediction_confidence: number;
  prediction_correct: boolean;
  current_streak: number;
  streak_stats: StreakStats;
  player_probabilities: Record<MoveType, number>;
  player_counts: Record<MoveType, number>;
  scores: {
    total_rounds: number;
    player_wins: number;
    ai_wins: number;
    ties: number;
    player_win_rate: number;
    ai_win_rate: number;
    tie_rate: number;
    ai_prediction_accuracy: number;
  };
  next_prediction: NextPrediction;
}
