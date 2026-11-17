"""
Core Logic Engine for Palindrome & Anagram Verifier.
Implements:
1. Two-Pointer String Scanning with step-by-step trace and almost-palindrome detection.
2. Character Frequency Map Accumulation and delta comparison for anagram verification.
3. Longest Palindromic Substring detection (expand-around-center).
4. Multi-word anagram group clustering.
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple
import re


@dataclass
class PointerStep:
    step_num: int
    left_idx: int
    right_idx: int
    left_char: str
    right_char: str
    is_match: bool


@dataclass
class MismatchInfo:
    left_idx: int
    right_idx: int
    left_char: str
    right_char: str


@dataclass
class PalindromeResult:
    original_text: str
    clean_text: str
    is_palindrome: bool
    is_almost_palindrome: bool  # Can become palindrome by removing at most 1 character
    total_comparisons: int
    steps: List[PointerStep]
    mismatch: Optional[MismatchInfo]
    longest_palindrome_substring: str


@dataclass
class AnagramResult:
    text1: str
    text2: str
    clean_text1: str
    clean_text2: str
    is_anagram: bool
    is_sub_anagram: bool  # All chars of text1 exist in text2 with sufficient frequency
    total_unique_chars: int
    freq_map1: Dict[str, int]
    freq_map2: Dict[str, int]
    char_diff: Dict[str, int]   # freq1[ch] - freq2[ch]
    surplus_text1: Dict[str, int]
    surplus_text2: Dict[str, int]
    min_edits_needed: int       # Min character insertions/deletions to balance


class VerifierEngine:
    """First-principles Palindrome and Anagram verification engine."""

    # -------------------------------------------------------------------------
    # String Sanitization Helper
    # -------------------------------------------------------------------------
    @staticmethod
    def clean_string(text: str, strict: bool = False) -> str:
        """
        Cleans string for comparison:
        - If strict=False (default): removes all non-alphanumeric chars and converts to lower.
        - If strict=True: keeps case and punctuation, strips leading/trailing whitespace.
        """
        if not text:
            return ""
        if strict:
            return text.strip()
        # Keep only alphanumeric characters and lowercase
        return re.sub(r"[^a-zA-Z0-9]", "", text).lower()

    # -------------------------------------------------------------------------
    # Palindrome Verification (Two-Pointer Technique)
    # -------------------------------------------------------------------------
    @classmethod
    def verify_palindrome(cls, text: str, strict: bool = False) -> PalindromeResult:
        """
        Verifies if string is a palindrome using the classic two-pointer technique:
        - left pointer starts at 0
        - right pointer starts at len - 1
        - moves inward comparing symmetric pairs
        Also calculates step trace, mismatch location, almost-palindrome check,
        and longest palindromic substring.
        """
        clean = cls.clean_string(text, strict=strict)
        n = len(clean)

        if n <= 1:
            return PalindromeResult(
                original_text=text,
                clean_text=clean,
                is_palindrome=True,
                is_almost_palindrome=True,
                total_comparisons=0,
                steps=[],
                mismatch=None,
                longest_palindrome_substring=clean
            )

        left = 0
        right = n - 1
        steps: List[PointerStep] = []
        mismatch: Optional[MismatchInfo] = None
        is_pal = True
        step_counter = 0

        while left < right:
            step_counter += 1
            left_char = clean[left]
            right_char = clean[right]
            match = (left_char == right_char)

            steps.append(
                PointerStep(
                    step_num=step_counter,
                    left_idx=left,
                    right_idx=right,
                    left_char=left_char,
                    right_char=right_char,
                    is_match=match
                )
            )

            if not match:
                is_pal = False
                mismatch = MismatchInfo(
                    left_idx=left,
                    right_idx=right,
                    left_char=left_char,
                    right_char=right_char
                )
                break

            left += 1
            right -= 1

        # Check almost-palindrome if not an exact palindrome
        is_almost = is_pal
        if not is_pal and mismatch is not None:
            is_almost = cls._check_almost_palindrome(clean, mismatch.left_idx, mismatch.right_idx)

        longest_sub = cls.find_longest_palindromic_substring(clean)

        return PalindromeResult(
            original_text=text,
            clean_text=clean,
            is_palindrome=is_pal,
            is_almost_palindrome=is_almost,
            total_comparisons=len(steps),
            steps=steps,
            mismatch=mismatch,
            longest_palindrome_substring=longest_sub
        )

    @classmethod
    def _is_slice_palindrome(cls, s: str, low: int, high: int) -> bool:
        """Helper to verify if a substring slice s[low:high+1] is a palindrome."""
        while low < high:
            if s[low] != s[high]:
                return False
            low += 1
            high -= 1
        return True

    @classmethod
    def _check_almost_palindrome(cls, clean: str, l_mismatch: int, r_mismatch: int) -> bool:
        """
        Determines if deleting at most 1 character makes clean a palindrome.
        Tests deleting either clean[l_mismatch] or clean[r_mismatch].
        """
        return (
            cls._is_slice_palindrome(clean, l_mismatch + 1, r_mismatch) or
            cls._is_slice_palindrome(clean, l_mismatch, r_mismatch - 1)
        )

    @classmethod
    def find_longest_palindromic_substring(cls, clean: str) -> str:
        """
        Finds the longest palindromic substring using Expand Around Center:
        O(n^2) time, O(1) space.
        """
        if not clean:
            return ""
        start, end = 0, 0

        def expand(left: int, right: int) -> int:
            while left >= 0 and right < len(clean) and clean[left] == clean[right]:
                left -= 1
                right += 1
            return right - left - 1

        for i in range(len(clean)):
            len1 = expand(i, i)       # Odd length (single center char)
            len2 = expand(i, i + 1)   # Even length (twin center chars)
            max_len = max(len1, len2)
            if max_len > (end - start + 1):
                start = i - (max_len - 1) // 2
                end = i + max_len // 2

        return clean[start:end + 1]

    # -------------------------------------------------------------------------
    # Anagram Verification (Frequency Map Technique)
    # -------------------------------------------------------------------------
    @classmethod
    def build_frequency_map(cls, text: str, strict: bool = False) -> Dict[str, int]:
        """
        Builds a character frequency dictionary using pure accumulator logic:
        O(n) time, O(k) space where k <= alphabet size.
        """
        clean = cls.clean_string(text, strict=strict)
        freq: Dict[str, int] = {}
        for ch in clean:
            freq[ch] = freq.get(ch, 0) + 1
        return freq

    @classmethod
    def verify_anagram(cls, text1: str, text2: str, strict: bool = False) -> AnagramResult:
        """
        Verifies if two strings are anagrams using frequency map accumulator comparison:
        - Computes frequency map for text1 and text2.
        - Computes char_diff = freq1[c] - freq2[c].
        - Evaluates exact anagram, sub-anagram, surplus characters, and required edit distance.
        """
        clean1 = cls.clean_string(text1, strict=strict)
        clean2 = cls.clean_string(text2, strict=strict)

        freq1 = cls.build_frequency_map(text1, strict=strict)
        freq2 = cls.build_frequency_map(text2, strict=strict)

        all_chars = sorted(list(set(freq1.keys()) | set(freq2.keys())))
        char_diff: Dict[str, int] = {}
        surplus1: Dict[str, int] = {}
        surplus2: Dict[str, int] = {}
        edits = 0
        is_sub = True

        for ch in all_chars:
            count1 = freq1.get(ch, 0)
            count2 = freq2.get(ch, 0)
            diff = count1 - count2
            char_diff[ch] = diff

            if diff > 0:
                surplus1[ch] = diff
                edits += diff
            elif diff < 0:
                surplus2[ch] = abs(diff)
                edits += abs(diff)

            if count1 > count2:
                is_sub = False

        is_anagram = (len(clean1) == len(clean2)) and (edits == 0)

        return AnagramResult(
            text1=text1,
            text2=text2,
            clean_text1=clean1,
            clean_text2=clean2,
            is_anagram=is_anagram,
            is_sub_anagram=is_sub and (clean1 != ""),
            total_unique_chars=len(all_chars),
            freq_map1=freq1,
            freq_map2=freq2,
            char_diff=char_diff,
            surplus_text1=surplus1,
            surplus_text2=surplus2,
            min_edits_needed=edits
        )

    # -------------------------------------------------------------------------
    # Anagram Grouping (Multi-Word Clustering)
    # -------------------------------------------------------------------------
    @classmethod
    def group_anagrams(cls, words: List[str], strict: bool = False) -> Dict[str, List[str]]:
        """
        Groups an array of words into anagram categories:
        Key is the canonical sorted character signature of each word.
        Returns a dictionary mapping canonical signature -> list of matching words.
        """
        clusters: Dict[str, List[str]] = {}
        for word in words:
            clean = cls.clean_string(word, strict=strict)
            if not clean:
                continue
            signature = "".join(sorted(clean))
            if signature not in clusters:
                clusters[signature] = []
            clusters[signature].append(word)
        return clusters

    # -------------------------------------------------------------------------
    # Full Analytics Payload
    # -------------------------------------------------------------------------
    @classmethod
    def verify_all(cls, palindrome_input: str, anagram_str1: str, anagram_str2: str) -> Dict:
        """Runs both verifications and aggregates results for dashboards."""
        pal_res = cls.verify_palindrome(palindrome_input)
        ana_res = cls.verify_anagram(anagram_str1, anagram_str2)

        return {
            "palindrome": {
                "original_text": pal_res.original_text,
                "clean_text": pal_res.clean_text,
                "is_palindrome": pal_res.is_palindrome,
                "is_almost_palindrome": pal_res.is_almost_palindrome,
                "total_comparisons": pal_res.total_comparisons,
                "mismatch": asdict(pal_res.mismatch) if pal_res.mismatch else None,
                "longest_palindrome_substring": pal_res.longest_palindrome_substring,
                "steps": [asdict(s) for s in pal_res.steps],
            },
            "anagram": {
                "text1": ana_res.text1,
                "text2": ana_res.text2,
                "clean_text1": ana_res.clean_text1,
                "clean_text2": ana_res.clean_text2,
                "is_anagram": ana_res.is_anagram,
                "is_sub_anagram": ana_res.is_sub_anagram,
                "total_unique_chars": ana_res.total_unique_chars,
                "freq_map1": ana_res.freq_map1,
                "freq_map2": ana_res.freq_map2,
                "char_diff": ana_res.char_diff,
                "surplus_text1": ana_res.surplus_text1,
                "surplus_text2": ana_res.surplus_text2,
                "min_edits_needed": ana_res.min_edits_needed,
            }
        }

