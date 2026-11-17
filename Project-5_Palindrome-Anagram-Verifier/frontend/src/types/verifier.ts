export interface PointerStep {
  step_num: number;
  left_idx: number;
  right_idx: number;
  left_char: string;
  right_char: string;
  is_match: boolean;
}

export interface MismatchInfo {
  left_idx: number;
  right_idx: number;
  left_char: string;
  right_char: string;
}

export interface PalindromeResponse {
  original_text: string;
  clean_text: string;
  is_palindrome: boolean;
  is_almost_palindrome: boolean;
  total_comparisons: number;
  steps: PointerStep[];
  mismatch?: MismatchInfo | null;
  longest_palindrome_substring: string;
}

export interface AnagramResponse {
  text1: string;
  text2: string;
  clean_text1: string;
  clean_text2: string;
  is_anagram: boolean;
  is_sub_anagram: boolean;
  total_unique_chars: number;
  freq_map1: Record<string, number>;
  freq_map2: Record<string, number>;
  char_diff: Record<string, number>;
  surplus_text1: Record<string, number>;
  surplus_text2: Record<string, number>;
  min_edits_needed: number;
}

export interface GroupAnagramsResponse {
  groups: Record<string, string[]>;
  total_groups: number;
  total_words: number;
}
