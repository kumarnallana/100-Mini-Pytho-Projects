import { GameStats, PlayRoundResponse, MoveType } from "../types/rps";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchHealth(): Promise<{ status: string; total_rounds_processed: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchStats(): Promise<GameStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (err) {
    console.error("API error fetching stats:", err);
    return null;
  }
}

export async function playMove(move: MoveType): Promise<PlayRoundResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/play`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player_move: move }),
    });
    if (!res.ok) throw new Error("Move failed");
    return await res.json();
  } catch (err) {
    console.error("API error playing move:", err);
    return null;
  }
}

export async function resetGame(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (err) {
    console.error("API error resetting game:", err);
    return false;
  }
}

export async function simulateRounds(rounds: number, strategy: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/api/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rounds, strategy }),
    });
    if (!res.ok) throw new Error("Simulation failed");
    return await res.json();
  } catch (err) {
    console.error("API error simulating rounds:", err);
    return null;
  }
}

