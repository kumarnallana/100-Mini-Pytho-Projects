"""
Command-Line Interface (CLI) for Rock-Paper-Scissors with Probability Tracker.
Demonstrates first-principles pattern detection, Markov matrix updates,
and win-streak analytics in the terminal.
"""

import sys
import os

# Add backend directory to path if running directly
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from rps_engine import RpsEngine, Move


def print_box(title: str, lines: list[str], width: int = 68) -> None:
    """Renders a clean Unicode box with centered title."""
    print(f"┌{'─' * width}┐")
    print(f"│{title.center(width)}│")
    print(f"├{'─' * width}┤")
    for line in lines:
        print(f"│ {line.ljust(width - 2)} │")
    print(f"└{'─' * width}┘")


def display_dashboard(engine: RpsEngine) -> None:
    """Prints comprehensive formatted metrics dashboard to the terminal."""
    metrics = engine.get_summary_metrics()
    streaks = metrics["streaks"]
    probs = metrics["player_probabilities"]
    counts = metrics["player_counts"]
    markov = metrics["markov_transitions"]
    wsls = metrics["wsls_transitions"]
    pred = metrics["next_prediction"]

    streak_str = f"+{streaks['current_streak']} (Player Win Streak)" if streaks['current_streak'] > 0 else (
        f"{streaks['current_streak']} (AI Win Streak)" if streaks['current_streak'] < 0 else "0 (Neutral)"
    )

    overview_lines = [
        f"Total Rounds: {metrics['total_rounds']}  |  Player Wins: {metrics['player_wins']} ({metrics['player_win_rate']}%)",
        f"AI Wins: {metrics['ai_wins']} ({metrics['ai_win_rate']}%)  |  Ties: {metrics['ties']} ({metrics['tie_rate']}%)",
        f"Current Streak: {streak_str}",
        f"Max Player Streak: {streaks['max_player_win_streak']}  |  Max AI Streak: {streaks['max_ai_win_streak']}",
        f"AI Prediction Accuracy: {metrics['ai_prediction_accuracy']}%",
    ]
    print()
    print_box("ROCK-PAPER-SCISSORS PROBABILITY TRACKER - SCORECARD", overview_lines)

    # Probability meter
    prob_lines = [
        f"Rock     ({counts['rock']:3d} throws): [{'█' * int(probs['rock'] * 20):<20}] {probs['rock'] * 100:5.1f}%",
        f"Paper    ({counts['paper']:3d} throws): [{'█' * int(probs['paper'] * 20):<20}] {probs['paper'] * 100:5.1f}%",
        f"Scissors ({counts['scissors']:3d} throws): [{'█' * int(probs['scissors'] * 20):<20}] {probs['scissors'] * 100:5.1f}%",
    ]
    print()
    print_box("EMPIRICAL PLAYER MOVE DISTRIBUTION (LAPLACE SMOOTHED)", prob_lines)

    # Markov Transition Matrix
    markov_lines = [
        "From \\ To         |   Next Rock    |   Next Paper   | Next Scissors ",
        "──────────────────┼────────────────┼────────────────┼───────────────",
        f"After Rock        |    {markov['rock']['rock'] * 100:5.1f}%      |    {markov['rock']['paper'] * 100:5.1f}%      |    {markov['rock']['scissors'] * 100:5.1f}%",
        f"After Paper       |    {markov['paper']['rock'] * 100:5.1f}%      |    {markov['paper']['paper'] * 100:5.1f}%      |    {markov['paper']['scissors'] * 100:5.1f}%",
        f"After Scissors    |    {markov['scissors']['rock'] * 100:5.1f}%      |    {markov['scissors']['paper'] * 100:5.1f}%      |    {markov['scissors']['scissors'] * 100:5.1f}%",
    ]
    print()
    print_box("MARKOV 1ST-ORDER TRANSITION MATRIX P(M_t | M_{t-1})", markov_lines)

    # AI Prediction insight
    ai_lines = [
        f"Next Predicted Player Move: {pred['predicted_player_move'].upper()}",
        f"Recommended AI Counter:    {pred['recommended_ai_move'].upper()}",
        f"AI Confidence Score:        {pred['confidence_percent']:.1f}%",
        f"Engine Rationale:           {pred['rationale']}",
    ]
    print()
    print_box("AI REAL-TIME PREDICTIVE INSIGHT", ai_lines)
    print()


def run_cli_demo() -> None:
    """Runs a simulated benchmark demo followed by quick summary."""
    print("=" * 70)
    print(" 🎮 INITIALIZING ROCK-PAPER-SCISSORS PATTERN DETECTION ENGINE")
    print("=" * 70)

    engine = RpsEngine(seed=42)

    # Simulate 20 rounds against a player biased towards Rock
    print("\n[+] Running 20-round benchmark simulation vs. 'Biased-Rock' player...")
    engine.simulate_rounds(20, strategy="biased_rock")

    display_dashboard(engine)


if __name__ == "__main__":
    run_cli_demo()

