import { PalindromeResponse, AnagramResponse, GroupAnagramsResponse } from "../types/verifier";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function verifyPalindrome(
  text: string,
  strict: boolean = false
): Promise<PalindromeResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/verify/palindrome`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, strict }),
    });
    if (!res.ok) throw new Error("API call failed");
    return await res.json();
  } catch {
    return fallbackPalindrome(text, strict);
  }
}

export async function verifyAnagram(
  text1: string,
  text2: string,
  strict: boolean = false
): Promise<AnagramResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/verify/anagram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text1, text2, strict }),
    });
    if (!res.ok) throw new Error("API call failed");
    return await res.json();
  } catch {
    return fallbackAnagram(text1, text2, strict);
  }
}

export async function groupAnagrams(
  words: string[],
  strict: boolean = false
): Promise<GroupAnagramsResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/anagrams/group`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words, strict }),
    });
    if (!res.ok) throw new Error("API call failed");
    return await res.json();
  } catch {
    return fallbackGroupAnagrams(words, strict);
  }
}

// ----------------------------------------------------------------------------
// Client-side Fallbacks for resilient offline exploration
// ----------------------------------------------------------------------------

function cleanStr(text: string, strict: boolean): string {
  if (strict) return text.trim();
  return text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function fallbackPalindrome(text: string, strict: boolean): PalindromeResponse {
  const clean = cleanStr(text, strict);
  let left = 0;
  let right = clean.length - 1;
  const steps = [];
  let isPal = true;
  let mismatch = null;
  let step = 0;

  while (left < right) {
    step++;
    const lCh = clean[left];
    const rCh = clean[right];
    const match = lCh === rCh;
    steps.push({
      step_num: step,
      left_idx: left,
      right_idx: right,
      left_char: lCh,
      right_char: rCh,
      is_match: match,
    });
    if (!match) {
      isPal = false;
      mismatch = { left_idx: left, right_idx: right, left_char: lCh, right_char: rCh };
      break;
    }
    left++;
    right--;
  }

  // Check almost-palindrome
  let isAlmost = isPal;
  if (!isPal && mismatch) {
    const checkSub = (s: string, l: number, r: number) => {
      while (l < r) {
        if (s[l] !== s[r]) return false;
        l++;
        r--;
      }
      return true;
    };
    isAlmost =
      checkSub(clean, mismatch.left_idx + 1, mismatch.right_idx) ||
      checkSub(clean, mismatch.left_idx, mismatch.right_idx - 1);
  }

  return {
    original_text: text,
    clean_text: clean,
    is_palindrome: isPal,
    is_almost_palindrome: isAlmost,
    total_comparisons: steps.length,
    steps,
    mismatch,
    longest_palindrome_substring: isPal ? clean : clean.slice(0, 1),
  };
}

function fallbackAnagram(text1: string, text2: string, strict: boolean): AnagramResponse {
  const clean1 = cleanStr(text1, strict);
  const clean2 = cleanStr(text2, strict);

  const freq1: Record<string, number> = {};
  for (const ch of clean1) freq1[ch] = (freq1[ch] || 0) + 1;

  const freq2: Record<string, number> = {};
  for (const ch of clean2) freq2[ch] = (freq2[ch] || 0) + 1;

  const allChars = Array.from(new Set([...Object.keys(freq1), ...Object.keys(freq2)])).sort();
  const charDiff: Record<string, number> = {};
  const surplus1: Record<string, number> = {};
  const surplus2: Record<string, number> = {};
  let edits = 0;
  let isSub = true;

  for (const ch of allChars) {
    const c1 = freq1[ch] || 0;
    const c2 = freq2[ch] || 0;
    const diff = c1 - c2;
    charDiff[ch] = diff;
    if (diff > 0) {
      surplus1[ch] = diff;
      edits += diff;
    } else if (diff < 0) {
      surplus2[ch] = Math.abs(diff);
      edits += Math.abs(diff);
    }
    if (c1 > c2) isSub = false;
  }

  return {
    text1,
    text2,
    clean_text1: clean1,
    clean_text2: clean2,
    is_anagram: clean1.length === clean2.length && edits === 0,
    is_sub_anagram: isSub && clean1.length > 0,
    total_unique_chars: allChars.length,
    freq_map1: freq1,
    freq_map2: freq2,
    char_diff: charDiff,
    surplus_text1: surplus1,
    surplus_text2: surplus2,
    min_edits_needed: edits,
  };
}

function fallbackGroupAnagrams(words: string[], strict: boolean): GroupAnagramsResponse {
  const groups: Record<string, string[]> = {};
  for (const w of words) {
    const c = cleanStr(w, strict);
    if (!c) continue;
    const sig = c.split("").sort().join("");
    if (!groups[sig]) groups[sig] = [];
    groups[sig].push(w);
  }
  return {
    groups,
    total_groups: Object.keys(groups).length,
    total_words: Object.values(groups).flat().length,
  };
}

