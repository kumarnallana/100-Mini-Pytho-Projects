"""
CLI Demonstration for Palindrome & Anagram Verifier.
Demonstrates:
1. Two-pointer symmetric inward scan with pointer trace table.
2. Character frequency map accumulator & delta diff table.
3. Almost-palindrome detection and longest palindromic substring extraction.
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))

from verifier_engine import VerifierEngine


def print_box(title: str, lines: list[str], width: int = 70) -> None:
    """Renders a clean Unicode box with centered title."""
    print(f"┌{'─' * width}┐")
    print(f"│{title.center(width)}│")
    print(f"├{'─' * width}┤")
    for line in lines:
        print(f"│ {line.ljust(width - 2)} │")
    print(f"└{'─' * width}┘")


def display_palindrome_demo(text: str) -> None:
    """Executes and formats two-pointer palindrome verification."""
    res = VerifierEngine.verify_palindrome(text)

    status_str = "✅ VALID PALINDROME" if res.is_palindrome else (
        "⚠️ ALMOST PALINDROME (1 char deletion needed)" if res.is_almost_palindrome else "❌ NOT A PALINDROME"
    )

    overview = [
        f"Input Text:            \"{res.original_text}\"",
        f"Clean Normalized:      \"{res.clean_text}\" (Length: {len(res.clean_text)})",
        f"Result:                {status_str}",
        f"Two-Pointer Steps:     {res.total_comparisons} comparisons made",
        f"Longest Palindrome:    \"{res.longest_palindrome_substring}\" (Len: {len(res.longest_palindrome_substring)})",
    ]
    if res.mismatch:
        overview.append(
            f"First Mismatch:        Index {res.mismatch.left_idx} ('{res.mismatch.left_char}') != "
            f"Index {res.mismatch.right_idx} ('{res.mismatch.right_char}')"
        )

    print()
    print_box("TWO-POINTER PALINDROME SCANNER", overview)

    if res.steps:
        trace_lines = [
            "Step | Left Pointer        | Right Pointer       | Match?",
            "─────┼─────────────────────┼─────────────────────┼─────────",
        ]
        for s in res.steps:
            m_icon = "✓ MATCH" if s.is_match else "✗ MISMATCH"
            trace_lines.append(
                f" #{s.step_num:<3} | Index {s.left_idx:<2} ('{s.left_char}')    | Index {s.right_idx:<2} ('{s.right_char}')    | {m_icon}"
            )
        print()
        print_box("TWO-POINTER STEP-BY-STEP TRACE", trace_lines)


def display_anagram_demo(text1: str, text2: str) -> None:
    """Executes and formats frequency map anagram comparison."""
    res = VerifierEngine.verify_anagram(text1, text2)

    status_str = "✅ VALID ANAGRAM" if res.is_anagram else (
        "🔍 SUB-ANAGRAM (Subset)" if res.is_sub_anagram else "❌ NOT AN ANAGRAM"
    )

    overview = [
        f"String 1:              \"{res.text1}\" (Clean: \"{res.clean_text1}\")",
        f"String 2:              \"{res.text2}\" (Clean: \"{res.clean_text2}\")",
        f"Result:                {status_str}",
        f"Unique Characters:     {res.total_unique_chars}",
        f"Edit Distance (diff):  {res.min_edits_needed} character mutations needed",
    ]
    if res.surplus_text1:
        overview.append(f"Surplus in String 1:   {res.surplus_text1}")
    if res.surplus_text2:
        overview.append(f"Surplus in String 2:   {res.surplus_text2}")

    print()
    print_box("FREQUENCY MAP ANAGRAM VERIFIER", overview)

    # Frequency comparison table
    all_chars = sorted(list(set(res.freq_map1.keys()) | set(res.freq_map2.keys())))
    freq_lines = [
        "Char | Count (Str 1) | Count (Str 2) | Delta (Str1 - Str2) | Status",
        "─────┼────────────────┼────────────────┼─────────────────────┼────────",
    ]
    for ch in all_chars:
        c1 = res.freq_map1.get(ch, 0)
        c2 = res.freq_map2.get(ch, 0)
        d = res.char_diff.get(ch, 0)
        st = "BALANCED" if d == 0 else (f"+{d} in Str1" if d > 0 else f"{d} in Str2")
        freq_lines.append(f" '{ch}' | {c1:14d} | {c2:14d} | {d:19d} | {st}")

    print()
    print_box("CHARACTER FREQUENCY COMPARISON HISTOGRAM", freq_lines)
    print()


def run_cli_demo() -> None:
    """Runs interactive demonstration of both algorithms."""
    print("=" * 72)
    print(" 🚀 INITIALIZING PROJECT 05: PALINDROME & ANAGRAM VERIFICATION SUITE")
    print("=" * 72)

    # 1. Palindrome demo
    display_palindrome_demo("A man, a plan, a canal: Panama")

    # 2. Almost-palindrome demo
    display_palindrome_demo("abca")

    # 3. Anagram demo
    display_anagram_demo("Dormitory", "Dirty room")


if __name__ == "__main__":
    run_cli_demo()

