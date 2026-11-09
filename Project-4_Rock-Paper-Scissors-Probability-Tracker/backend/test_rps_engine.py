"""
Comprehensive Unit Tests for RpsEngine.
Verifies rules, probability tracking, Markov transitions,
streak tracking, and predictor accuracy.
"""

import pytest
from rps_engine import RpsEngine, Move, Outcome, BEATS, LOSES_TO


def test_core_rules():
    assert RpsEngine.evaluate_winner("rock", "scissors") == Outcome.PLAYER_WIN
    assert RpsEngine.evaluate_winner("scissors", "paper") == Outcome.PLAYER_WIN
    assert RpsEngine.evaluate_winner("paper", "rock") == Outcome.PLAYER_WIN

    assert RpsEngine.evaluate_winner("scissors", "rock") == Outcome.AI_WIN
    assert RpsEngine.evaluate_winner("paper", "scissors") == Outcome.AI_WIN
    assert RpsEngine.evaluate_winner("rock", "paper") == Outcome.AI_WIN

    assert RpsEngine.evaluate_winner("rock", "rock") == Outcome.TIE
    assert RpsEngine.evaluate_winner("paper", "paper") == Outcome.TIE
    assert RpsEngine.evaluate_winner("scissors", "scissors") == Outcome.TIE


def test_input_validation():
    engine = RpsEngine()
    with pytest.raises(ValueError, match="Invalid move"):
        engine.play_round("lizard")

    with pytest.raises(ValueError, match="Invalid move"):
        engine.play_round("spock")

    # Case insensitivity & trimming
    record = engine.play_round("  RoCk  ")
    assert record.player_move == "rock"


def test_probability_tracking():
    engine = RpsEngine()
    init_probs = engine.get_player_probabilities()
    # 0 moves -> smoothed probability is (0+1)/(0+3) = 1/3 each
    assert abs(init_probs.probabilities["rock"] - 0.3333) < 0.001

    # Play Rock 3 times
    for _ in range(3):
        engine.play_round("rock")

    probs = engine.get_player_probabilities()
    assert probs.counts["rock"] == 3
    assert probs.counts["paper"] == 0
    assert probs.counts["scissors"] == 0
    # (3 + 1) / (3 + 3) = 4 / 6 = 0.6667
    assert abs(probs.probabilities["rock"] - 0.6667) < 0.001


def test_markov_transitions():
    engine = RpsEngine()
    # Pattern: rock -> paper -> rock -> paper
    engine.play_round("rock")
    engine.play_round("paper")
    engine.play_round("rock")
    engine.play_round("paper")

    matrix = engine.get_markov_matrix()
    # After rock, paper was played twice
    rock_next = engine.markov_transitions["rock"]
    assert rock_next["paper"] == 2
    assert rock_next["scissors"] == 0
    assert rock_next["rock"] == 0

    # Smoothed prob for paper given rock should be higher than rock or scissors
    assert matrix["rock"]["paper"] > matrix["rock"]["rock"]
    assert matrix["rock"]["paper"] > matrix["rock"]["scissors"]


def test_streak_evaluation():
    engine = RpsEngine(seed=42)

    # Force a controlled sequence
    # Round 1
    engine.play_round("rock")
    # Reset streak stats for testing streak tracking directly
    engine.streak_stats.current_streak = 0
    engine.streak_stats.max_player_win_streak = 0
    engine.streak_stats.max_ai_win_streak = 0

    # Simulate player wins
    engine._update_streaks(Outcome.PLAYER_WIN)
    assert engine.streak_stats.current_streak == 1
    assert engine.streak_stats.max_player_win_streak == 1

    engine._update_streaks(Outcome.PLAYER_WIN)
    assert engine.streak_stats.current_streak == 2
    assert engine.streak_stats.max_player_win_streak == 2

    engine._update_streaks(Outcome.PLAYER_WIN)
    assert engine.streak_stats.current_streak == 3
    assert engine.streak_stats.max_player_win_streak == 3
    assert engine.streak_stats.total_player_win_streaks_ge_3 == 1

    # Tie should freeze streak
    engine._update_streaks(Outcome.TIE)
    assert engine.streak_stats.current_streak == 3

    # AI Win resets player streak and starts AI streak (-1)
    engine._update_streaks(Outcome.AI_WIN)
    assert engine.streak_stats.current_streak == -1
    assert engine.streak_stats.max_ai_win_streak == 1
    # Max player win streak remains 3
    assert engine.streak_stats.max_player_win_streak == 3

    engine._update_streaks(Outcome.AI_WIN)
    assert engine.streak_stats.current_streak == -2
    assert engine.streak_stats.max_ai_win_streak == 2


def test_simulation_and_ai_adaptation():
    # When simulating against biased_rock (60% rock), AI should adapt and predict rock
    engine = RpsEngine(seed=123)
    engine.simulate_rounds(50, strategy="biased_rock")

    assert engine.total_rounds == 50
    metrics = engine.get_summary_metrics()
    assert metrics["player_counts"]["rock"] > metrics["player_counts"]["paper"]
    assert metrics["player_counts"]["rock"] > metrics["player_counts"]["scissors"]

    # AI next prediction should favor rock or paper counter
    next_pred = metrics["next_prediction"]
    assert next_pred["predicted_player_move"] in ["rock", "paper", "scissors"]
    assert next_pred["recommended_ai_move"] == BEATS[Move(next_pred["predicted_player_move"])].value


def test_reset_functionality():
    engine = RpsEngine()
    engine.play_round("rock")
    engine.play_round("paper")
    assert engine.total_rounds == 2
    assert len(engine.history) == 2

    engine.reset()
    assert engine.total_rounds == 0
    assert engine.player_wins == 0
    assert engine.ai_wins == 0
    assert engine.ties == 0
    assert len(engine.history) == 0
    assert engine.streak_stats.current_streak == 0
    assert engine.streak_stats.max_player_win_streak == 0

