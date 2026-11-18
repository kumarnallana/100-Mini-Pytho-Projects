"""
Unit Tests for PrimeEngine.
Verifies 6k ± 1 primality testing, Sieve of Eratosthenes elimination trace,
prime factorization, recursive factor trees, Euler's totient, and Goldbach pairs.
"""

import math
import pytest
from prime_engine import PrimeEngine, FactorNode


def collect_tree_leaves(node: FactorNode) -> list[int]:
    """Helper to verify all leaf nodes in the factor tree are prime and multiply to root."""
    if node.left is None and node.right is None:
        return [node.value]
    leaves = []
    if node.left:
        leaves.extend(collect_tree_leaves(node.left))
    if node.right:
        leaves.extend(collect_tree_leaves(node.right))
    return leaves


def test_primality_testing():
    assert PrimeEngine.is_prime(-7) is False
    assert PrimeEngine.is_prime(0) is False
    assert PrimeEngine.is_prime(1) is False
    assert PrimeEngine.is_prime(2) is True
    assert PrimeEngine.is_prime(3) is True
    assert PrimeEngine.is_prime(4) is False
    assert PrimeEngine.is_prime(29) is True
    assert PrimeEngine.is_prime(561) is False   # Carmichael number (3 * 11 * 17)
    assert PrimeEngine.is_prime(7919) is True   # 1000th prime
    assert PrimeEngine.is_prime(104729) is True # 10000th prime


def test_nearest_primes():
    assert PrimeEngine.nearest_primes(2) == {"previous_prime": None, "next_prime": 3}
    assert PrimeEngine.nearest_primes(10) == {"previous_prime": 7, "next_prime": 11}
    assert PrimeEngine.nearest_primes(13) == {"previous_prime": 11, "next_prime": 17}


def test_sieve_of_eratosthenes_basic():
    res30 = PrimeEngine.sieve_of_eratosthenes(30)
    assert res30.primes == [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    assert res30.prime_count == 10
    assert res30.composite_count == 19  # 29 integers in [2..30] minus 10 primes
    assert (3, 5) in res30.twin_primes
    assert (17, 19) in res30.twin_primes
    assert res30.max_prime_gap == 6     # Gap between 23 and 29

    # Step 1 eliminates multiples of 2 starting at 4; Step 2 eliminates multiples of 3 starting at 9
    assert len(res30.steps) == 3        # Primes <= sqrt(30) are 2, 3, 5
    assert res30.steps[0].prime == 2
    assert 4 in res30.steps[0].multiples_marked
    assert res30.steps[1].prime == 3
    assert res30.steps[1].multiples_marked == [9, 15, 21, 27]
    assert res30.steps[2].prime == 5
    assert res30.steps[2].multiples_marked == [25]


def test_sieve_100_count_and_validation():
    res100 = PrimeEngine.sieve_of_eratosthenes(100)
    assert res100.prime_count == 25

    with pytest.raises(ValueError, match=">= 2"):
        PrimeEngine.sieve_of_eratosthenes(1)

    with pytest.raises(ValueError, match="<= 1,000,000"):
        PrimeEngine.sieve_of_eratosthenes(2_000_000)


def test_prime_factorization_and_tree():
    res = PrimeEngine.factorize(360)
    assert res.is_prime is False
    assert res.prime_factors == [2, 2, 2, 3, 3, 5]
    assert res.factor_exponents == {2: 3, 3: 2, 5: 1}
    assert res.canonical_formula == "2^3 × 3^2 × 5"
    assert res.euler_totient == 96  # 360 * (1/2) * (2/3) * (4/5) = 96
    assert res.divisor_count == 24  # (3+1)*(2+1)*(1+1) = 24
    assert res.classification == "abundant"

    # Verify recursive factor tree invariant
    leaves = collect_tree_leaves(res.factor_tree)
    assert sorted(leaves) == res.prime_factors
    assert math.prod(leaves) == 360
    assert all(PrimeEngine.is_prime(v) for v in leaves)


def test_number_classifications():
    # Prime
    res_p = PrimeEngine.factorize(97)
    assert res_p.is_prime is True
    assert res_p.classification == "prime"
    assert res_p.euler_totient == 96
    assert res_p.factor_tree.left is None and res_p.factor_tree.right is None

    # Perfect numbers: 6 (1+2+3=6), 28 (1+2+4+7+14=28)
    assert PrimeEngine.factorize(6).classification == "perfect"
    assert PrimeEngine.factorize(28).classification == "perfect"

    # Deficient number: 10 (1+2+5=8 < 10)
    assert PrimeEngine.factorize(10).classification == "deficient"

    # Invalid input
    with pytest.raises(ValueError, match=">= 2"):
        PrimeEngine.factorize(1)


def test_goldbach_pairs():
    pairs_28 = PrimeEngine.find_goldbach_pairs(28)
    assert pairs_28 == [(5, 23), (11, 17)]
    assert all(p1 + p2 == 28 and PrimeEngine.is_prime(p1) and PrimeEngine.is_prime(p2) for p1, p2 in pairs_28)

    # Odd numbers return empty list
    assert PrimeEngine.find_goldbach_pairs(27) == []
