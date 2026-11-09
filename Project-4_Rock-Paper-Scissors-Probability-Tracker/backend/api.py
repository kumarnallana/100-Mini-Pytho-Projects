"""
FastAPI REST API Service for Rock-Paper-Scissors with Probability Tracker.
Provides interactive gameplay, live Markov probability matrices, win-streak
analytics, batch simulation, and reset endpoints.
"""

from typing import Dict, List, Optional, Literal
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rps_engine import RpsEngine, Move, VALID_MOVES

app = FastAPI(
    title="Rock-Paper-Scissors Probability Tracker API",
    description="REST backend for real-time player pattern detection, Markov transitions, and win-streak analytics.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend (localhost:3000) and general development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory engine instance
engine = RpsEngine()


# -----------------------------------------------------------------------------
# Request & Response Schemas
# -----------------------------------------------------------------------------

class PlayRequest(BaseModel):
    player_move: str = Field(..., description="Player's move: 'rock', 'paper', or 'scissors'")


class NextPredictionModel(BaseModel):
    predicted_player_move: str
    recommended_ai_move: str
    confidence_percent: float
    rationale: str


class StreaksModel(BaseModel):
    current_streak: int
    current_streak_type: str
    max_player_win_streak: int
    max_ai_win_streak: int
    total_player_win_streaks_ge_3: int


class RoundRecordModel(BaseModel):
    round_number: int
    player_move: str
    ai_move: str
    outcome: str
    predicted_player_move: str
    prediction_confidence: float
    prediction_correct: bool
    current_streak: int
    timestamp: float


class PlayResponse(BaseModel):
    round_number: int
    player_move: str
    ai_move: str
    outcome: str
    predicted_player_move: str
    prediction_confidence: float
    prediction_correct: bool
    current_streak: int
    streak_stats: StreaksModel
    player_probabilities: Dict[str, float]
    player_counts: Dict[str, int]
    scores: Dict[str, float]
    next_prediction: NextPredictionModel


class SimulateRequest(BaseModel):
    rounds: int = Field(20, ge=1, le=500, description="Number of rounds to simulate (1-500)")
    strategy: Literal[
        "uniform_random",
        "biased_rock",
        "cyclic",
        "win_stay_lose_shift"
    ] = Field("biased_rock", description="Bot player simulation strategy")


class ResetResponse(BaseModel):
    message: str
    status: str


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/health", tags=["System"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "healthy",
        "service": "rps-probability-tracker-api",
        "total_rounds_processed": engine.total_rounds
    }


@app.get("/api/stats", tags=["Analytics"])
def get_stats():
    """Returns comprehensive game state, probability distributions, Markov matrix, and streaks."""
    return engine.get_summary_metrics()


@app.post("/api/play", response_model=PlayResponse, tags=["Game"])
def play_round(payload: PlayRequest):
    """
    Executes a round against the AI:
    1. AI decides counter-move based on Markov & WSLS patterns.
    2. Round is evaluated.
    3. State, frequency matrices, and streaks are updated.
    """
    move_clean = payload.player_move.strip().lower()
    if move_clean not in VALID_MOVES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid move '{payload.player_move}'. Must be one of: {sorted(list(VALID_MOVES))}"
        )

    record = engine.play_round(move_clean)
    summary = engine.get_summary_metrics()

    scores = {
        "total_rounds": summary["total_rounds"],
        "player_wins": summary["player_wins"],
        "ai_wins": summary["ai_wins"],
        "ties": summary["ties"],
        "player_win_rate": summary["player_win_rate"],
        "ai_win_rate": summary["ai_win_rate"],
        "tie_rate": summary["tie_rate"],
        "ai_prediction_accuracy": summary["ai_prediction_accuracy"],
    }

    return PlayResponse(
        round_number=record.round_number,
        player_move=record.player_move,
        ai_move=record.ai_move,
        outcome=record.outcome,
        predicted_player_move=record.predicted_player_move,
        prediction_confidence=record.prediction_confidence,
        prediction_correct=record.prediction_correct,
        current_streak=record.current_streak,
        streak_stats=StreaksModel(**summary["streaks"]),
        player_probabilities=summary["player_probabilities"],
        player_counts=summary["player_counts"],
        scores=scores,
        next_prediction=NextPredictionModel(**summary["next_prediction"])
    )


@app.post("/api/simulate", tags=["Simulation"])
def simulate(payload: SimulateRequest):
    """
    Simulates N rounds against a behavioral pattern (e.g. biased rock, cyclic, win-stay lose-shift).
    Enables instant benchmark testing of the probability tracker and AI adaptation.
    """
    simulated_records = engine.simulate_rounds(payload.rounds, strategy=payload.strategy)
    summary = engine.get_summary_metrics()
    return {
        "rounds_simulated": len(simulated_records),
        "strategy": payload.strategy,
        "summary": summary
    }


@app.post("/api/reset", response_model=ResetResponse, tags=["Game"])
def reset_game():
    """Resets all metrics, history logs, Markov matrices, and win-streak records."""
    engine.reset()
    return ResetResponse(
        message="Game engine state, Markov transitions, and streaks reset successfully.",
        status="reset_complete"
    )

