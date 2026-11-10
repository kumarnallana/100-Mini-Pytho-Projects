"""
Core Logic Engine for Rock-Paper-Scissors with Probability Tracking,
Markov Chain Pattern Detection, and Win-Streak Evaluation.

Follows first-principles state accumulation, frequency distributions,
and cognitive transition modeling (Markov & Win-Stay/Lose-Shift).
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from enum import Enum
import random
import time
from typing import Dict, List, Optional, Tuple, Literal


class Move(str, Enum):
    ROCK = "rock"
    PAPER = "paper"
    SCISSORS = "scissors"


class Outcome(str, Enum):
    PLAYER_WIN = "win"
    AI_WIN = "loss"
    TIE = "draw"


# Counter mappings
BEATS: Dict[Move, Move] = {
    Move.ROCK: Move.PAPER,       # Paper beats Rock
    Move.PAPER: Move.SCISSORS,   # Scissors beats Paper
    Move.SCISSORS: Move.ROCK,    # Rock beats Scissors
}

LOSES_TO: Dict[Move, Move] = {
    Move.ROCK: Move.SCISSORS,
    Move.PAPER: Move.ROCK,
    Move.SCISSORS: Move.PAPER,
}

VALID_MOVES = {m.value for m in Move}


@dataclass
class RoundRecord:
    round_number: int
    player_move: str
    ai_move: str
    outcome: str               # "win", "loss", "draw"
    predicted_player_move: str
    prediction_confidence: float
    prediction_correct: bool
    current_streak: int
    timestamp: float = field(default_factory=time.time)


@dataclass
class StreakStats:
    current_streak: int = 0          # >0 for player wins, <0 for AI wins, 0 initially
    current_streak_type: str = "none"  # "win", "loss", "none"
    max_player_win_streak: int = 0
    max_ai_win_streak: int = 0
    total_player_win_streaks_ge_3: int = 0


@dataclass
class ProbabilityBreakdown:
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    total_moves: int


class RpsEngine:
    """
    Rock-Paper-Scissors engine with real-time probability tracking,
    Markov chain transition modeling, Win-Stay/Lose-Shift heuristics,
    and streak dynamics.
    """

    def __init__(self, seed: Optional[int] = None) -> None:
        if seed is not None:
            random.seed(seed)
        self.reset()

    def reset(self) -> None:
        """Resets all game state, pattern tracking matrices, and streaks."""
        self.total_rounds: int = 0
        self.player_wins: int = 0
        self.ai_wins: int = 0
        self.ties: int = 0

        # Move frequencies for player
        self.player_move_counts: Dict[str, int] = {
            Move.ROCK.value: 0,
            Move.PAPER.value: 0,
            Move.SCISSORS.value: 0,
        }

        # 1st-Order Markov Transition Matrix: player_prev_move -> {next_move -> count}
        self.markov_transitions: Dict[str, Dict[str, int]] = {
            m.value: {target.value: 0 for target in Move} for m in Move
        }

        # Win-Stay/Lose-Shift transitions: previous_outcome -> {next_move -> count}
        self.wsls_transitions: Dict[str, Dict[str, int]] = {
            Outcome.PLAYER_WIN.value: {m.value: 0 for m in Move},
            Outcome.AI_WIN.value: {m.value: 0 for m in Move},
            Outcome.TIE.value: {m.value: 0 for m in Move},
        }

        # Streaks
        self.streak_stats = StreakStats()

        # History log
        self.history: List[RoundRecord] = []
        self.last_player_move: Optional[str] = None
        self.last_outcome: Optional[str] = None

    # -------------------------------------------------------------------------
    # Core Game Logic & Rules
    # -------------------------------------------------------------------------

    @staticmethod
    def evaluate_winner(player_move: str, ai_move: str) -> Outcome:
        """Determines the round outcome from player perspective."""
        p_m = Move(player_move.lower())
        a_m = Move(ai_move.lower())

        if p_m == a_m:
            return Outcome.TIE
        if BEATS[a_m] == p_m:
            return Outcome.PLAYER_WIN
        return Outcome.AI_WIN

    # -------------------------------------------------------------------------
    # Probability Tracking & Pattern Detection
    # -------------------------------------------------------------------------

    def get_player_probabilities(self) -> ProbabilityBreakdown:
        """
        Calculates empirical marginal probabilities for player moves with
        Laplace smoothing (+1 to all categories) to avoid zero-division.
        """
        total = sum(self.player_move_counts.values())
        smoothed_total = total + 3  # 3 categories

        probs: Dict[str, float] = {}
        for m in Move:
            val = self.player_move_counts[m.value]
            # Empirical probability with Laplace smoothing
            probs[m.value] = round((val + 1) / smoothed_total, 4)

        return ProbabilityBreakdown(
            counts=dict(self.player_move_counts),
            probabilities=probs,
            total_moves=total
        )

    def get_markov_matrix(self) -> Dict[str, Dict[str, float]]:
        """
        Returns normalized transition probability matrix:
        P(next_move | previous_move).
        """
        matrix: Dict[str, Dict[str, float]] = {}
        for prev_move, next_counts in self.markov_transitions.items():
            row_total = sum(next_counts.values())
            smoothed_row_total = row_total + 3
            matrix[prev_move] = {
                next_m: round((count + 1) / smoothed_row_total, 4)
                for next_m, count in next_counts.items()
            }
        return matrix

    def get_wsls_matrix(self) -> Dict[str, Dict[str, float]]:
        """
        Returns normalized Win-Stay / Lose-Shift conditional probabilities:
        P(next_move | previous_outcome).
        """
        matrix: Dict[str, Dict[str, float]] = {}
        for outcome, move_counts in self.wsls_transitions.items():
            row_total = sum(move_counts.values())
            smoothed_row_total = row_total + 3
            matrix[outcome] = {
                next_m: round((count + 1) / smoothed_row_total, 4)
                for next_m, count in move_counts.items()
            }
        return matrix

    def predict_player_move(self) -> Tuple[str, float, str]:
        """
        Predicts player's next move using an ensemble of:
        1. 1st-order Markov chain transition P(M_t | M_{t-1}) (Weight: 0.50)
        2. Outcome-conditioned WSLS transition P(M_t | O_{t-1}) (Weight: 0.35)
        3. Global marginal frequency P(M_t) (Weight: 0.15)

        Returns:
            (predicted_move, confidence_percentage, rationale_description)
        """
        # Early game / cold start: not enough data, use uniform random
        if self.total_rounds < 3:
            random_pick = random.choice([m.value for m in Move])
            return random_pick, 33.33, "Exploratory Phase: Random uniform baseline (< 3 rounds)."

        # 1. Marginal probabilities
        marginal_probs = self.get_player_probabilities().probabilities

        # 2. Markov probabilities if previous move is known
        markov_matrix = self.get_markov_matrix()
        prev_m = self.last_player_move or Move.ROCK.value
        markov_row = markov_matrix[prev_m]

        # 3. WSLS probabilities if previous outcome is known
        wsls_matrix = self.get_wsls_matrix()
        prev_out = self.last_outcome or Outcome.TIE.value
        wsls_row = wsls_matrix[prev_out]

        # Ensemble weights
        w_markov = 0.50
        w_wsls = 0.35
        w_marginal = 0.15

        scores: Dict[str, float] = {}
        for m in [m.value for m in Move]:
            scores[m] = (
                w_markov * markov_row.get(m, 0.3333) +
                w_wsls * wsls_row.get(m, 0.3333) +
                w_marginal * marginal_probs.get(m, 0.3333)
            )

        # Find move with highest score
        predicted_move = max(scores, key=lambda k: scores[k])
        total_score = sum(scores.values())
        confidence = round((scores[predicted_move] / total_score) * 100, 2)

        rationale = (
            f"Pattern Detected: Given prior move '{prev_m}' (Markov P={markov_row[predicted_move]:.2f}) "
            f"& outcome '{prev_out}' (WSLS P={wsls_row[predicted_move]:.2f}), "
            f"'{predicted_move}' has highest probability."
        )

        return predicted_move, confidence, rationale

    def choose_ai_counter_move(self) -> Tuple[str, str, float, str]:
        """
        Determines the AI's counter-move to beat the predicted player move.
        Returns:
            (ai_move, predicted_player_move, confidence, rationale)
        """
        predicted_move, confidence, rationale = self.predict_player_move()
        # Choose move that defeats the predicted player move
        counter_move = BEATS[Move(predicted_move)].value
        return counter_move, predicted_move, confidence, rationale

    # -------------------------------------------------------------------------
    # State Mutation & Round Processing
    # -------------------------------------------------------------------------

    def play_round(self, player_move: str) -> RoundRecord:
        """
        Executes a single round given a validated player move.
        Updates state, transitions, streaks, and returns the round record.
        """
        player_move = player_move.strip().lower()
        if player_move not in VALID_MOVES:
            raise ValueError(
                f"Invalid move '{player_move}'. Must be one of: {sorted(list(VALID_MOVES))}")

        # AI chooses move based on current predictive models before observing new move
        ai_move, predicted_player_move, confidence, _ = self.choose_ai_counter_move()

        # Evaluate outcome
        outcome = self.evaluate_winner(player_move, ai_move)

        # Update core counts
        self.total_rounds += 1
        if outcome == Outcome.PLAYER_WIN:
            self.player_wins += 1
        elif outcome == Outcome.AI_WIN:
            self.ai_wins += 1
        else:
            self.ties += 1

        # Update player frequency
        self.player_move_counts[player_move] += 1

        # Update Markov transitions if there was a previous player move
        if self.last_player_move is not None:
            self.markov_transitions[self.last_player_move][player_move] += 1

        # Update WSLS transitions if there was a previous outcome
        if self.last_outcome is not None:
            self.wsls_transitions[self.last_outcome][player_move] += 1

        # Update Streak dynamics
        self._update_streaks(outcome)

        # Record validation of prediction
        prediction_correct = (predicted_player_move == player_move)

        record = RoundRecord(
            round_number=self.total_rounds,
            player_move=player_move,
            ai_move=ai_move,
            outcome=outcome.value,
            predicted_player_move=predicted_player_move,
            prediction_confidence=confidence,
            prediction_correct=prediction_correct,
            current_streak=self.streak_stats.current_streak
        )

        self.history.append(record)
        self.last_player_move = player_move
        self.last_outcome = outcome.value

        return record

    def _update_streaks(self, outcome: Outcome) -> None:
        """
        Updates streak accumulator:
        - Player Win: increments positive streak; updates max player win streak.
        - AI Win: decrements negative streak; updates max AI win streak.
        - Tie: preserves current streak momentum without incrementing.
        """
        if outcome == Outcome.PLAYER_WIN:
            if self.streak_stats.current_streak > 0:
                self.streak_stats.current_streak += 1
            else:
                self.streak_stats.current_streak = 1
            self.streak_stats.current_streak_type = "win"

            if self.streak_stats.current_streak > self.streak_stats.max_player_win_streak:
                self.streak_stats.max_player_win_streak = self.streak_stats.current_streak

            if self.streak_stats.current_streak == 3:
                self.streak_stats.total_player_win_streaks_ge_3 += 1

        elif outcome == Outcome.AI_WIN:
            if self.streak_stats.current_streak < 0:
                self.streak_stats.current_streak -= 1
            else:
                self.streak_stats.current_streak = -1
            self.streak_stats.current_streak_type = "loss"

            ai_streak_val = abs(self.streak_stats.current_streak)
            if ai_streak_val > self.streak_stats.max_ai_win_streak:
                self.streak_stats.max_ai_win_streak = ai_streak_val

        else:
            # Tie: streak type remains as is, frozen
            pass

    # -------------------------------------------------------------------------
    # Analytics & State Serialization
    # -------------------------------------------------------------------------

    def get_summary_metrics(self) -> Dict:
        """Computes comprehensive dashboard metrics."""
        non_ties = self.player_wins + self.ai_wins
        player_win_rate = round(
            (self.player_wins / self.total_rounds * 100), 2) if self.total_rounds > 0 else 0.0
        ai_win_rate = round(
            (self.ai_wins / self.total_rounds * 100), 2) if self.total_rounds > 0 else 0.0
        tie_rate = round((self.ties / self.total_rounds * 100),
                         2) if self.total_rounds > 0 else 0.0

        ai_accuracy = 0.0
        if self.history:
            correct_preds = sum(
                1 for r in self.history if r.prediction_correct)
            ai_accuracy = round((correct_preds / len(self.history)) * 100, 2)

        probs_breakdown = self.get_player_probabilities()

        # Current prediction & recommendation for next round
        ai_next_counter, next_pred, conf, rationale = self.choose_ai_counter_move()

        return {
            "total_rounds": self.total_rounds,
            "player_wins": self.player_wins,
            "ai_wins": self.ai_wins,
            "ties": self.ties,
            "player_win_rate": player_win_rate,
            "ai_win_rate": ai_win_rate,
            "tie_rate": tie_rate,
            "ai_prediction_accuracy": ai_accuracy,
            "streaks": asdict(self.streak_stats),
            "player_probabilities": probs_breakdown.probabilities,
            "player_counts": probs_breakdown.counts,
            "markov_transitions": self.get_markov_matrix(),
            "wsls_transitions": self.get_wsls_matrix(),
            "next_prediction": {
                "predicted_player_move": next_pred,
                "recommended_ai_move": ai_next_counter,
                "confidence_percent": conf,
                "rationale": rationale,
            },
            "recent_history": [asdict(r) for r in self.history[-10:]]
        }

    # -------------------------------------------------------------------------
    # Simulation Runner
    # -------------------------------------------------------------------------

    def simulate_rounds(self, count: int, strategy: str = "biased_rock") -> List[RoundRecord]:
        """
        Simulates `count` rounds against a specified player strategy:
        - 'uniform_random': Equal 33.3% chance for all moves.
        - 'biased_rock': Player throws Rock 60%, Paper 25%, Scissors 15%.
        - 'cyclic': R -> P -> S -> R -> P -> S.
        - 'win_stay_lose_shift': Repeats move on win, shifts to counter on loss.
        """
        results: List[RoundRecord] = []
        moves_cycle = [Move.ROCK.value, Move.PAPER.value, Move.SCISSORS.value]

        last_sim_move = Move.ROCK.value
        last_sim_outcome = Outcome.TIE.value

        for i in range(count):
            if strategy == "uniform_random":
                move = random.choice(moves_cycle)
            elif strategy == "biased_rock":
                move = random.choices(
                    [Move.ROCK.value, Move.PAPER.value, Move.SCISSORS.value],
                    weights=[0.60, 0.25, 0.15],
                    k=1
                )[0]
            elif strategy == "cyclic":
                move = moves_cycle[i % len(moves_cycle)]
            elif strategy == "win_stay_lose_shift":
                if last_sim_outcome == Outcome.PLAYER_WIN.value:
                    move = last_sim_move
                elif last_sim_outcome == Outcome.AI_WIN.value:
                    move = BEATS[Move(last_sim_move)].value
                else:
                    move = random.choice(moves_cycle)
            else:
                move = random.choice(moves_cycle)

            record = self.play_round(move)
            results.append(record)
            last_sim_move = move
            last_sim_outcome = record.outcome

        return results
