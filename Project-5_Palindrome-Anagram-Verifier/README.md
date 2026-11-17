# Project 05: Palindrome & Anagram Verifier

> **Tier 1: Foundations & Accumulator Logic**  
> *Core Focus: Two-Pointer String Scanning, Frequency Map Accumulation, Almost-Palindrome Branching, and Multi-Word Anagram Clustering.*

---

## 🎯 Problem Statement

String symmetry and character permutation equivalence are foundational problems in computer science and data processing:
1. **Palindrome Verification**: Determining whether a string reads identically forwards and backwards under whitespace and punctuation invariance. Naive string reversal ($s == s[::-1]$) allocates an auxiliary copy in memory ($O(n)$ space). A first-principles **two-pointer inward scan** achieves $O(n)$ time while operating in $O(1)$ auxiliary space.
2. **Almost-Palindrome Detection**: Identifying if a string can achieve palindrome symmetry with at most one character deletion (handling branch decisions upon the first mismatch).
3. **Anagram Verification**: Determining whether two strings contain identical character multisets. While sorting both strings requires $O(n \log n)$ time, a **frequency map accumulator** achieves linear $O(n)$ time by tracking character multiplicities and computing delta discrepancies $\Delta(c) = \mathcal{F}_1(c) - \mathcal{F}_2(c)$.
4. **Anagram Clustering**: Grouping an arbitrary list of strings into equivalence families using canonical signatures.

This project delivers a complete, end-to-end full-stack solution featuring:
- **Python Verification Engine** with step-by-step pointer trace generation.
- **FastAPI REST API** with validation, error handling, and test coverage.
- **Next.js 14 & Tailwind CSS UI** with interactive two-pointer step animations, frequency histograms, and cluster cards.

---

## 🧠 Mental Model & Logical Breakdown

### 1. Two-Pointer Symmetrical Inward Scanning

```text
Index:     0   1   2   3   4   5   6
String:  [ R , A , C , E , C , A , R ]
           ▲                       ▲
        left=0                  right=6   --> Compare 'R' == 'R' (Match!)
               ▲               ▲
            left=1          right=5       --> Compare 'A' == 'A' (Match!)
                   ▲       ▲
                left=2  right=4           --> Compare 'C' == 'C' (Match!)
                       ▲
                   left=right=3           --> Convergence reached: VALID PALINDROME
```

- **Invariant**: At any step $k$, the prefix $S[0 \dots k-1]$ is the exact mirror image of the suffix $S[n-k \dots n-1]$.
- **Almost-Palindrome Decision**: Upon the first mismatch $S[\text{left}] \neq S[\text{right}]$, branch into two sub-problems:
  $$\text{IsPalindrome}(S[\text{left}+1 \dots \text{right}]) \quad \lor \quad \text{IsPalindrome}(S[\text{left} \dots \text{right}-1])$$

---

### 2. Frequency Map Accumulator & Delta Histogram

```text
String 1: "listen"   -->   F₁ = { 'l': 1, 'i': 1, 's': 1, 't': 1, 'e': 1, 'n': 1 }
String 2: "silent"   -->   F₂ = { 's': 1, 'i': 1, 'l': 1, 'e': 1, 'n': 1, 't': 1 }

Difference: Δ(c) = F₁(c) - F₂(c)
All Δ(c) == 0  AND  len(S₁) == len(S₂)  -->  EXACT ANAGRAM
```

---

## 📝 Pseudocode

### Two-Pointer Palindrome Verification

```text
ALGORITHM VERIFY_PALINDROME(TEXT, STRICT):
    CLEAN_TEXT = SANITIZE(TEXT, STRICT)
    LEFT = 0
    RIGHT = LENGTH(CLEAN_TEXT) - 1
    STEPS = []

    WHILE LEFT < RIGHT:
        L_CHAR = CLEAN_TEXT[LEFT]
        R_CHAR = CLEAN_TEXT[RIGHT]
        MATCH = (L_CHAR == R_CHAR)
        
        RECORD_STEP(STEPS, LEFT, RIGHT, L_CHAR, R_CHAR, MATCH)

        IF NOT MATCH:
            IS_ALMOST = CHECK_ALMOST_PALINDROME(CLEAN_TEXT, LEFT, RIGHT)
            RETURN RESULT(IS_PALINDROME=FALSE, IS_ALMOST=IS_ALMOST, STEPS)
        
        LEFT = LEFT + 1
        RIGHT = RIGHT - 1

    RETURN RESULT(IS_PALINDROME=TRUE, IS_ALMOST=TRUE, STEPS)
END ALGORITHM
```

### Frequency Map Anagram Verification

```text
ALGORITHM VERIFY_ANAGRAM(TEXT1, TEXT2, STRICT):
    CLEAN1 = SANITIZE(TEXT1, STRICT)
    CLEAN2 = SANITIZE(TEXT2, STRICT)
    
    FREQ1 = ACCUMULATE_FREQUENCIES(CLEAN1)
    FREQ2 = ACCUMULATE_FREQUENCIES(CLEAN2)
    
    ALL_CHARS = UNION(KEYS(FREQ1), KEYS(FREQ2))
    TOTAL_EDITS = 0
    IS_SUB = TRUE

    FOR EACH CHAR IN ALL_CHARS:
        C1 = FREQ1[CHAR] OR 0
        C2 = FREQ2[CHAR] OR 0
        DIFF = C1 - C2
        TOTAL_EDITS = TOTAL_EDITS + ABS(DIFF)
        IF C1 > C2:
            IS_SUB = FALSE

    IS_ANAGRAM = (LENGTH(CLEAN1) == LENGTH(CLEAN2)) AND (TOTAL_EDITS == 0)
    RETURN RESULT(IS_ANAGRAM, IS_SUB, TOTAL_EDITS)
END ALGORITHM
```

---

## 💻 Implementation Highlights

```python
# First-principles two-pointer inward scan
def verify_palindrome(text: str, strict: bool = False) -> PalindromeResult:
    clean = clean_string(text, strict=strict)
    left, right = 0, len(clean) - 1
    steps = []

    while left < right:
        match = (clean[left] == clean[right])
        steps.append(PointerStep(len(steps)+1, left, right, clean[left], clean[right], match))
        if not match:
            # Check almost-palindrome via 1-char deletion branches
            is_almost = (_is_slice_palindrome(clean, left + 1, right) or
                         _is_slice_palindrome(clean, left, right - 1))
            return PalindromeResult(text, clean, False, is_almost, len(steps), steps, ...)
        left += 1
        right -= 1

    return PalindromeResult(text, clean, True, True, len(steps), steps, ...)
```

---

## ⏱️ Complexity Analysis

| Algorithm / Feature | Time Complexity | Auxiliary Space | Rationale |
| :--- | :---: | :---: | :--- |
| **Two-Pointer Palindrome** | $\mathcal{O}(n)$ | $\mathcal{O}(1)^*$ | Symmetrical inward scan touches at most $\lceil n/2 \rceil$ character pairs without copying the string. |
| **Almost-Palindrome Check** | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ | Upon first mismatch, at most two $O(n)$ linear checks are performed. |
| **Longest Sub-Palindrome** | $\mathcal{O}(n^2)$ | $\mathcal{O}(1)$ | Expand-around-center checks $2n - 1$ centers in constant space. |
| **Frequency Map Anagram** | $\mathcal{O}(n + m)$ | $\mathcal{O}(k)$ | Single pass over both strings; dictionary memory is bounded by alphabet size $k \le |\Sigma|$. |
| **Anagram Grouping** | $\mathcal{O}(N \cdot K \log K)$ | $\mathcal{O}(N \cdot K)$ | Sorting character signatures for $N$ words of average length $K$. |

*\*Note: The step trace generator records $O(n)$ data points for frontend visual playback.*

---

## 🚀 How to Run

### 1. Terminal CLI Dashboard
```bash
python main.py
```

### 2. Backend Unit & Integration Tests
```bash
python -m pytest backend/ -v
```

### 3. FastAPI REST Server
```bash
python backend/run_server.py
# Server runs on http://127.0.0.1:8000
# OpenAPI Docs available at http://127.0.0.1:8000/docs
```

### 4. Next.js 14 Frontend
```bash
cd frontend
npm run dev
# Interactive UI runs on http://localhost:3000
```

---

## 💡 Key Takeaways

1. **Space-Efficient String Symmetry**:
   - Two-pointer scanning avoids unnecessary auxiliary string allocations required by `s == s[::-1]`, and terminates immediately on the first mismatched index.
2. **Frequency Map Invariant**:
   - Checking anagrams via sorted characters takes $O(n \log n)$; frequency mapping reduces this to optimal linear time $O(n + m)$ using dictionary accumulation.
3. **Resilient Dual-Mode Architecture**:
   - The Next.js frontend connects seamlessly to FastAPI with automated health polling, while maintaining an embedded client-side fallback engine so the visualizer operates offline if needed.

