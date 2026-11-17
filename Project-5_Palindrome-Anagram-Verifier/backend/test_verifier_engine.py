"""
Unit Tests for VerifierEngine.
Verifies two-pointer palindrome scanning, almost-palindrome detection,
frequency map anagram verification, and multi-word anagram clustering.
"""

import pytest
from verifier_engine import VerifierEngine, PointerStep, PalindromeResult, AnagramResult


def test_classic_palindromes():
    # Famous sentences with spaces & punctuation
    res1 = VerifierEngine.verify_palindrome("A man, a plan, a canal: Panama")
    assert res1.is_palindrome is True
    assert res1.is_almost_palindrome is True
    assert res1.mismatch is None

    res2 = VerifierEngine.verify_palindrome("racecar")
    assert res2.is_palindrome is True
    assert res2.total_comparisons == 3  # r-r, a-a, c-c

    res3 = VerifierEngine.verify_palindrome("Was it a car or a cat I saw?")
    assert res3.is_palindrome is True


def test_non_palindromes_and_mismatch():
    res = VerifierEngine.verify_palindrome("python")
    assert res.is_palindrome is False
    assert res.mismatch is not None
    assert res.mismatch.left_char == "p"
    assert res.mismatch.right_char == "n"


def test_palindrome_edge_cases():
    # Empty string
    assert VerifierEngine.verify_palindrome("").is_palindrome is True
    # Single character
    assert VerifierEngine.verify_palindrome("Z").is_palindrome is True
    # Two identical chars
    assert VerifierEngine.verify_palindrome("aa").is_palindrome is True
    # Two different chars
    assert VerifierEngine.verify_palindrome("ab").is_palindrome is False


def test_almost_palindrome():
    # "abca" can delete 'b' to get "aca" or 'c' to get "aba"
    res1 = VerifierEngine.verify_palindrome("abca")
    assert res1.is_palindrome is False
    assert res1.is_almost_palindrome is True

    # "radkar" can delete 'd' to get "rakar" or 'k' to get "radar"
    res2 = VerifierEngine.verify_palindrome("radkar")
    assert res2.is_palindrome is False
    assert res2.is_almost_palindrome is True

    # "abcdef" requires more than 1 deletion
    res3 = VerifierEngine.verify_palindrome("abcdef")
    assert res3.is_almost_palindrome is False


def test_longest_palindromic_substring():
    assert VerifierEngine.find_longest_palindromic_substring("babad") in ["bab", "aba"]
    assert VerifierEngine.find_longest_palindromic_substring("cbbd") == "bb"
    assert VerifierEngine.find_longest_palindromic_substring("racecar") == "racecar"
    assert VerifierEngine.find_longest_palindromic_substring("") == ""


def test_strict_mode():
    # "Racecar" has uppercase R and lowercase r
    res_relaxed = VerifierEngine.verify_palindrome("Racecar", strict=False)
    assert res_relaxed.is_palindrome is True

    res_strict = VerifierEngine.verify_palindrome("Racecar", strict=True)
    assert res_strict.is_palindrome is False  # 'R' != 'r'


def test_classic_anagrams():
    res1 = VerifierEngine.verify_anagram("listen", "silent")
    assert res1.is_anagram is True
    assert res1.min_edits_needed == 0
    assert all(val == 0 for val in res1.char_diff.values())

    res2 = VerifierEngine.verify_anagram("Dormitory", "Dirty room")
    assert res2.is_anagram is True

    res3 = VerifierEngine.verify_anagram("The Eyes", "They See")
    assert res3.is_anagram is True


def test_non_anagrams_and_diff():
    res = VerifierEngine.verify_anagram("rat", "car")
    assert res.is_anagram is False
    assert res.surplus_text1 == {"t": 1}
    assert res.surplus_text2 == {"c": 1}
    assert res.min_edits_needed == 2


def test_sub_anagram():
    # "cat" chars are present in "catch"
    res = VerifierEngine.verify_anagram("cat", "catch")
    assert res.is_anagram is False
    assert res.is_sub_anagram is True


def test_group_anagrams():
    words = ["eat", "tea", "tan", "ate", "nat", "bat"]
    grouped = VerifierEngine.group_anagrams(words)
    assert len(grouped) == 3
    # Sort groups for consistent comparison
    assert sorted(grouped["aet"]) == ["ate", "eat", "tea"]
    assert sorted(grouped["ant"]) == ["nat", "tan"]
    assert grouped["abt"] == ["bat"]


def test_verify_all_aggregation():
    data = VerifierEngine.verify_all("racecar", "listen", "silent")
    assert "palindrome" in data
    assert "anagram" in data
    assert data["palindrome"]["is_palindrome"] is True
    assert data["anagram"]["is_anagram"] is True

