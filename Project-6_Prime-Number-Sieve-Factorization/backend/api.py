"""
FastAPI REST API Service for Prime Number Sieve & Factorization.
Provides endpoints for:
1. Sieve of Eratosthenes with step-by-step elimination trace & prime gaps.
2. Prime Factorization with recursive binary factor tree & number theory analytics.
3. Deterministic 6k ± 1 primality probe with nearest neighbor primes.
"""

from __future__ import annotations
from typing import Dict, List, Optional, Tuple
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from prime_engine import PrimeEngine

app = FastAPI(
    title="Prime Number Sieve & Factorization API",
    description="REST backend for Sieve of Eratosthenes visualization, recursive prime factor trees, Euler's totient, and Goldbach decompositions.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# Request & Response Schemas
# -----------------------------------------------------------------------------

class SieveRequest(BaseModel):
    limit: int = Field(100, ge=2, le=1_000_000, description="Upper bound for Sieve of Eratosthenes (2 to 1,000,000)")
    record_steps: bool = Field(True, description="Include per-prime elimination rounds for limits <= 2000")


class SieveStepModel(BaseModel):
    step_num: int
    prime: int
    multiples_marked: List[int]
    newly_eliminated_count: int
    total_eliminated_so_far: int


class SieveResponse(BaseModel):
    limit: int
    primes: List[int]
    prime_count: int
    composite_count: int
    prime_density_percent: float
    pnt_expected_count: float
    twin_primes: List[Tuple[int, int]]
    max_prime_gap: int
    max_gap_pair: Optional[Tuple[int, int]] = None
    steps: List[SieveStepModel]


class FactorizeRequest(BaseModel):
    number: int = Field(..., ge=2, le=10**12, description="Integer >= 2 to factorize")


class FactorNodeModel(BaseModel):
    value: int
    is_prime: bool
    left: Optional[FactorNodeModel] = None
    right: Optional[FactorNodeModel] = None


FactorNodeModel.model_rebuild()


class FactorizationResponse(BaseModel):
    number: int
    is_prime: bool
    prime_factors: List[int]
    factor_exponents: Dict[str, int]
    canonical_formula: str
    factor_tree: FactorNodeModel
    all_divisors: List[int]
    divisor_count: int
    proper_divisor_sum: int
    classification: str
    euler_totient: int
    goldbach_pairs: List[Tuple[int, int]]


class PrimalityResponse(BaseModel):
    number: int
    is_prime: bool
    previous_prime: Optional[int]
    next_prime: int


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/health", tags=["System"])
def health_check():
    """Health check endpoint to confirm API availability."""
    return {
        "status": "healthy",
        "service": "prime-sieve-factorization-api",
        "version": "1.0.0",
    }


@app.post("/api/sieve", response_model=SieveResponse, tags=["Sieve"])
def run_sieve_endpoint(payload: SieveRequest):
    """
    Executes the Sieve of Eratosthenes up to `payload.limit` and returns primes,
    density metrics, twin primes, max gap, and step-by-step elimination trace.
    """
    try:
        res = PrimeEngine.sieve_of_eratosthenes(payload.limit, record_steps=payload.record_steps)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    steps_models = [
        SieveStepModel(
            step_num=s.step_num,
            prime=s.prime,
            multiples_marked=s.multiples_marked,
            newly_eliminated_count=s.newly_eliminated_count,
            total_eliminated_so_far=s.total_eliminated_so_far,
        )
        for s in res.steps
    ]

    return SieveResponse(
        limit=res.limit,
        primes=res.primes,
        prime_count=res.prime_count,
        composite_count=res.composite_count,
        prime_density_percent=res.prime_density_percent,
        pnt_expected_count=res.pnt_expected_count,
        twin_primes=res.twin_primes,
        max_prime_gap=res.max_prime_gap,
        max_gap_pair=res.max_gap_pair,
        steps=steps_models,
    )


@app.post("/api/factorize", response_model=FactorizationResponse, tags=["Factorization"])
def factorize_endpoint(payload: FactorizeRequest):
    """
    Performs prime factorization, builds the recursive binary factor tree,
    and calculates divisor classification, Euler's totient, and Goldbach pairs.
    """
    try:
        res = PrimeEngine.factorize(payload.number)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return FactorizationResponse(
        number=res.number,
        is_prime=res.is_prime,
        prime_factors=res.prime_factors,
        factor_exponents={str(k): v for k, v in res.factor_exponents.items()},
        canonical_formula=res.canonical_formula,
        factor_tree=FactorNodeModel(**res.factor_tree.to_dict()),
        all_divisors=res.all_divisors,
        divisor_count=res.divisor_count,
        proper_divisor_sum=res.proper_divisor_sum,
        classification=res.classification,
        euler_totient=res.euler_totient,
        goldbach_pairs=res.goldbach_pairs,
    )


@app.get("/api/primality/{number}", response_model=PrimalityResponse, tags=["Primality"])
def check_primality_endpoint(number: int):
    """Deterministic primality check and closest neighboring primes."""
    if number < -10**12 or number > 10**12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Number must be within [-10^12, 10^12].",
        )
    neighbors = PrimeEngine.nearest_primes(number)
    return PrimalityResponse(
        number=number,
        is_prime=PrimeEngine.is_prime(number),
        previous_prime=neighbors["previous_prime"],
        next_prime=neighbors["next_prime"],
    )
