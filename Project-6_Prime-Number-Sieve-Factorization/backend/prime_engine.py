"""
Core Logic Engine for Prime Number Sieve & Factorization.
Implements from first principles:
1. Sieve of Eratosthenes with step-by-step elimination trace, twin primes, and prime gaps.
2. Trial Division Prime Factorization (O(sqrt(n))) with canonical exponent notation.
3. Recursive Binary Prime Factor Tree generation for visual tree rendering.
4. Number Theory Analytics: Euler's Totient phi(n), divisor sum, number classification
   (Prime, Perfect, Abundant, Deficient), and Goldbach Conjecture pairs.
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple
import math


@dataclass
class SieveStep:
    step_num: int
    prime: int
    multiples_marked: List[int]
    newly_eliminated_count: int
    total_eliminated_so_far: int


@dataclass
class SieveResult:
    limit: int
    primes: List[int]
    prime_count: int
    composite_count: int
    prime_density_percent: float
    pnt_expected_count: float        # Prime Number Theorem estimate: n / ln(n)
    twin_primes: List[Tuple[int, int]]
    max_prime_gap: int
    max_gap_pair: Optional[Tuple[int, int]]
    steps: List[SieveStep]


@dataclass
class FactorNode:
    value: int
    is_prime: bool
    left: Optional[FactorNode] = None
    right: Optional[FactorNode] = None

    def to_dict(self) -> Dict:
        return {
            "value": self.value,
            "is_prime": self.is_prime,
            "left": self.left.to_dict() if self.left else None,
            "right": self.right.to_dict() if self.right else None,
        }


@dataclass
class FactorizationResult:
    number: int
    is_prime: bool
    prime_factors: List[int]             # Flat list e.g. [2, 2, 2, 3, 3, 5]
    factor_exponents: Dict[int, int]     # Canonical map e.g. {2: 3, 3: 2, 5: 1}
    canonical_formula: str               # e.g. "2^3 × 3^2 × 5"
    factor_tree: FactorNode
    all_divisors: List[int]
    divisor_count: int
    proper_divisor_sum: int
    classification: str                  # "prime", "perfect", "abundant", "deficient", "unit"
    euler_totient: int                   # phi(n): count of integers <= n coprime to n
    goldbach_pairs: List[Tuple[int, int]]


class PrimeEngine:
    """First-principles Prime Number Sieve & Factorization Engine."""

    # -------------------------------------------------------------------------
    # Deterministic Primality Testing (6k ± 1 optimization)
    # -------------------------------------------------------------------------
    @staticmethod
    def is_prime(n: int) -> bool:
        """
        Deterministic primality test using 6k ± 1 wheel optimization.
        Time Complexity: O(sqrt(n)), Space Complexity: O(1).
        """
        if n <= 1:
            return False
        if n <= 3:
            return True
        if n % 2 == 0 or n % 3 == 0:
            return False

        i = 5
        while i * i <= n:
            if n % i == 0 or n % (i + 2) == 0:
                return False
            i += 6
        return True

    @classmethod
    def nearest_primes(cls, n: int) -> Dict[str, Optional[int]]:
        """Finds the closest prime strictly below n and strictly above n."""
        prev_p: Optional[int] = None
        if n > 2:
            cand = n - 1
            while cand >= 2:
                if cls.is_prime(cand):
                    prev_p = cand
                    break
                cand -= 1

        next_p = max(2, n + 1)
        while not cls.is_prime(next_p):
            next_p += 1

        return {"previous_prime": prev_p, "next_prime": next_p}

    # -------------------------------------------------------------------------
    # Sieve of Eratosthenes with Step-by-Step Elimination Trace
    # -------------------------------------------------------------------------
    @classmethod
    def sieve_of_eratosthenes(cls, limit: int, record_steps: bool = True) -> SieveResult:
        """
        Executes the Sieve of Eratosthenes up to `limit`.
        Time Complexity: O(n log log n), Space Complexity: O(n).

        Records each prime p <= sqrt(limit) and its newly crossed-out multiples
        when `record_steps=True` (capped cleanly if limit is very large).
        """
        if limit < 2:
            raise ValueError("Limit must be an integer >= 2.")
        if limit > 1_000_000:
            raise ValueError("Limit must be <= 1,000,000 to prevent excessive memory allocation.")

        is_prime_arr = [True] * (limit + 1)
        is_prime_arr[0] = False
        is_prime_arr[1] = False

        steps: List[SieveStep] = []
        total_eliminated = 0
        step_counter = 0
        sqrt_limit = math.isqrt(limit)

        for p in range(2, sqrt_limit + 1):
            if is_prime_arr[p]:
                marked_this_round: List[int] = []
                # Start marking from p * p (all smaller multiples already marked)
                for multiple in range(p * p, limit + 1, p):
                    if is_prime_arr[multiple]:
                        is_prime_arr[multiple] = False
                        total_eliminated += 1
                        if record_steps and limit <= 2000:
                            marked_this_round.append(multiple)
                    elif record_steps and limit <= 500:
                        # Still track if needed, or only track newly eliminated
                        pass

                step_counter += 1
                if record_steps and limit <= 2000:
                    steps.append(
                        SieveStep(
                            step_num=step_counter,
                            prime=p,
                            multiples_marked=marked_this_round,
                            newly_eliminated_count=len(marked_this_round),
                            total_eliminated_so_far=total_eliminated,
                        )
                    )

        primes = [num for num in range(2, limit + 1) if is_prime_arr[num]]
        prime_count = len(primes)
        composite_count = (limit - 1) - prime_count  # Numbers in [2..limit] that are not prime
        density = round((prime_count / limit) * 100, 2)
        pnt_estimate = round(limit / math.log(limit), 2) if limit > 1 else 0.0

        # Twin primes: (p, p + 2)
        twin_primes: List[Tuple[int, int]] = []
        max_gap = 0
        max_gap_pair: Optional[Tuple[int, int]] = None

        for i in range(len(primes) - 1):
            p1, p2 = primes[i], primes[i + 1]
            gap = p2 - p1
            if gap == 2:
                twin_primes.append((p1, p2))
            if gap > max_gap:
                max_gap = gap
                max_gap_pair = (p1, p2)

        return SieveResult(
            limit=limit,
            primes=primes,
            prime_count=prime_count,
            composite_count=composite_count,
            prime_density_percent=density,
            pnt_expected_count=pnt_estimate,
            twin_primes=twin_primes,
            max_prime_gap=max_gap,
            max_gap_pair=max_gap_pair,
            steps=steps,
        )

    # -------------------------------------------------------------------------
    # Prime Factorization & Recursive Factor Tree
    # -------------------------------------------------------------------------
    @classmethod
    def smallest_prime_factor(cls, n: int) -> int:
        """Returns the smallest prime divisor of integer n >= 2."""
        if n % 2 == 0:
            return 2
        if n % 3 == 0:
            return 3
        i = 5
        while i * i <= n:
            if n % i == 0:
                return i
            if n % (i + 2) == 0:
                return i + 2
            i += 6
        return n

    @classmethod
    def build_factor_tree(cls, n: int) -> FactorNode:
        """
        Recursively constructs a binary Prime Factor Tree.
        For composite n, splits into (smallest_prime_factor, n // smallest_prime_factor)
        or balanced factors where left is always a prime leaf and right continues decomposing.
        """
        if n <= 1:
            return FactorNode(value=n, is_prime=False)

        spf = cls.smallest_prime_factor(n)
        if spf == n:
            return FactorNode(value=n, is_prime=True)

        quotient = n // spf
        return FactorNode(
            value=n,
            is_prime=False,
            left=FactorNode(value=spf, is_prime=True),
            right=cls.build_factor_tree(quotient),
        )

    @classmethod
    def get_all_divisors(cls, n: int) -> List[int]:
        """Computes all positive divisors of n in O(sqrt(n)) sorted ascending."""
        if n <= 0:
            return []
        small: List[int] = []
        large: List[int] = []
        for i in range(1, math.isqrt(n) + 1):
            if n % i == 0:
                small.append(i)
                if i != n // i:
                    large.append(n // i)
        return small + large[::-1]

    @classmethod
    def compute_euler_totient(cls, n: int, factor_exponents: Dict[int, int]) -> int:
        """
        Computes Euler's Totient Function phi(n):
        phi(n) = n * product(1 - 1/p) for all distinct prime factors p of n.
        """
        if n <= 1:
            return n
        result = n
        for p in factor_exponents.keys():
            result = result // p * (p - 1)
        return result

    @classmethod
    def find_goldbach_pairs(cls, n: int, max_pairs: int = 10) -> List[Tuple[int, int]]:
        """
        For even integers n > 2, finds pairs of primes (p1, p2) such that p1 + p2 = n.
        """
        if n <= 2 or n % 2 != 0:
            return []
        pairs: List[Tuple[int, int]] = []
        for p in range(2, n // 2 + 1):
            if cls.is_prime(p) and cls.is_prime(n - p):
                pairs.append((p, n - p))
                if len(pairs) >= max_pairs:
                    break
        return pairs

    @classmethod
    def factorize(cls, n: int) -> FactorizationResult:
        """
        Executes complete prime factorization, factor tree generation,
        divisor classification, Euler's totient, and Goldbach decomposition.
        """
        if n < 2:
            raise ValueError("Number to factorize must be an integer >= 2.")
        if n > 10**12:
            raise ValueError("Number must be <= 1,000,000,000,000 for responsive trial division.")

        prime_factors: List[int] = []
        factor_exponents: Dict[int, int] = {}

        temp = n
        # Extract factors of 2
        while temp % 2 == 0:
            prime_factors.append(2)
            factor_exponents[2] = factor_exponents.get(2, 0) + 1
            temp //= 2

        # Extract odd factors
        divisor = 3
        while divisor * divisor <= temp:
            while temp % divisor == 0:
                prime_factors.append(divisor)
                factor_exponents[divisor] = factor_exponents.get(divisor, 0) + 1
                temp //= divisor
            divisor += 2

        if temp > 1:
            prime_factors.append(temp)
            factor_exponents[temp] = factor_exponents.get(temp, 0) + 1

        is_p = len(prime_factors) == 1

        # Build canonical formula string e.g. "2^3 × 3^2 × 5"
        terms = []
        for p in sorted(factor_exponents.keys()):
            exp = factor_exponents[p]
            terms.append(f"{p}^{exp}" if exp > 1 else f"{p}")
        canonical_formula = " × ".join(terms)

        # Build factor tree
        tree = cls.build_factor_tree(n)

        # Divisors & classification
        divisors = cls.get_all_divisors(n)
        proper_sum = sum(divisors) - n

        if is_p:
            classification = "prime"
        elif proper_sum == n:
            classification = "perfect"
        elif proper_sum > n:
            classification = "abundant"
        else:
            classification = "deficient"

        totient = cls.compute_euler_totient(n, factor_exponents)
        goldbach = cls.find_goldbach_pairs(n) if n <= 100_000 else []

        return FactorizationResult(
            number=n,
            is_prime=is_p,
            prime_factors=prime_factors,
            factor_exponents=factor_exponents,
            canonical_formula=canonical_formula,
            factor_tree=tree,
            all_divisors=divisors,
            divisor_count=len(divisors),
            proper_divisor_sum=proper_sum,
            classification=classification,
            euler_totient=totient,
            goldbach_pairs=goldbach,
        )
