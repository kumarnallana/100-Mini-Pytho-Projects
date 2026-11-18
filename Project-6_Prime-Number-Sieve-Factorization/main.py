"""
CLI Dashboard for Prime Number Sieve & Factorization.
Demonstrates:
1. Sieve of Eratosthenes elimination steps, twin primes, and prime density.
2. Prime factorization with canonical exponent formula.
3. Recursive ASCII Prime Factor Tree rendering and number-theoretic analytics.
"""

import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from prime_engine import PrimeEngine, FactorNode


def print_box(title: str, lines: list[str], width: int = 72) -> None:
    """Renders a clean Unicode box with centered title."""
    print(f"┌{'─' * width}┐")
    print(f"│{title.center(width)}│")
    print(f"├{'─' * width}┤")
    for line in lines:
        print(f"│ {line.ljust(width - 2)} │")
    print(f"└{'─' * width}┘")


def render_factor_tree_lines(node: FactorNode, prefix: str = "", is_last: bool = True) -> list[str]:
    """Recursively builds ASCII tree lines for a FactorNode."""
    lines = []
    connector = "└── " if is_last else "├── "
    badge = "[PRIME]" if node.is_prime else "[COMPOSITE]"
    label = f"{node.value} {badge}"
    if prefix == "":
        lines.append(label)
    else:
        lines.append(f"{prefix}{connector}{label}")

    children = [c for c in (node.left, node.right) if c is not None]
    child_prefix = prefix + ("    " if is_last else "│   ")
    for idx, child in enumerate(children):
        lines.extend(render_factor_tree_lines(child, child_prefix, idx == len(children) - 1))
    return lines


def display_sieve_demo(limit: int = 100) -> None:
    """Runs and renders Sieve of Eratosthenes diagnostics."""
    res = PrimeEngine.sieve_of_eratosthenes(limit)

    overview = [
        f"Sieve Upper Limit:      {res.limit:,}",
        f"Primes Found:           {res.prime_count:,}  |  Composites: {res.composite_count:,}",
        f"Prime Density:          {res.prime_density_percent}%  (PNT Estimate: ~{res.pnt_expected_count})",
        f"Twin Prime Pairs:       {len(res.twin_primes)}  (e.g. {res.twin_primes[:5]})",
        f"Max Prime Gap:          {res.max_prime_gap}  (between {res.max_gap_pair[0]} and {res.max_gap_pair[1]})" if res.max_gap_pair else "Max Prime Gap:          0",
    ]
    print()
    print_box(f"SIEVE OF ERATOSTHENES (2 .. {limit})", overview)

    step_lines = [
        "Round | Prime (p) | Newly Eliminated | Total Eliminated | Sample Marked",
        "──────┼───────────┼──────────────────┼──────────────────┼──────────────────",
    ]
    for s in res.steps:
        sample = str(s.multiples_marked[:5]) + ("..." if len(s.multiples_marked) > 5 else "")
        step_lines.append(
            f" #{s.step_num:<3} | {s.prime:<9} | {s.newly_eliminated_count:<16} | {s.total_eliminated_so_far:<16} | {sample}"
        )
    print()
    print_box("ELIMINATION TRACE ROUNDS (p <= sqrt(N))", step_lines)


def display_factorization_demo(n: int = 360) -> None:
    """Runs and renders factorization metrics and visual ASCII factor tree."""
    res = PrimeEngine.factorize(n)

    overview = [
        f"Target Number:          {res.number:,}",
        f"Canonical Formula:      {res.canonical_formula}",
        f"Classification:         {res.classification.upper()}  (Proper Divisor Sum = {res.proper_divisor_sum})",
        f"Euler's Totient φ(n):   {res.euler_totient:,} coprime integers <= {res.number:,}",
        f"Total Divisors ({res.divisor_count}):    {str(res.all_divisors[:12])}" + ("..." if len(res.all_divisors) > 12 else ""),
        f"Goldbach Pairs:         {res.goldbach_pairs[:4]}" if res.goldbach_pairs else "Goldbach Pairs:         N/A (odd or <= 2)",
    ]
    print()
    print_box(f"PRIME FACTORIZATION & NUMBER THEORY ({n})", overview)

    tree_lines = render_factor_tree_lines(res.factor_tree)
    print()
    print_box(f"RECURSIVE PRIME FACTOR TREE ({n})", tree_lines)
    print()


def run_cli_demo() -> None:
    print("=" * 74)
    print(" 🔢 INITIALIZING PROJECT 06: PRIME NUMBER SIEVE & FACTORIZATION SUITE")
    print("=" * 74)
    display_sieve_demo(100)
    display_factorization_demo(360)


if __name__ == "__main__":
    run_cli_demo()
