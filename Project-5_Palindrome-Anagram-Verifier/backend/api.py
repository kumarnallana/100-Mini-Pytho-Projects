"""
FastAPI REST API Service for Palindrome & Anagram Verifier.
Provides endpoints for:
1. Two-pointer palindrome analysis with step-by-step trace data.
2. Character frequency map anagram verification & delta comparison.
3. Multi-word anagram clustering.
4. Dual verification aggregated payload.
"""

from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from verifier_engine import (
    VerifierEngine,
    PointerStep,
    MismatchInfo,
    PalindromeResult,
    AnagramResult,
)

app = FastAPI(
    title="Palindrome & Anagram Verifier API",
    description="REST backend for two-pointer string scanning, frequency map comparison, and anagram clustering.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend and general client consumption
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

class PalindromeRequest(BaseModel):
    text: str = Field(..., min_length=1, description="String to verify for palindrome symmetry")
    strict: bool = Field(False, description="Whether to preserve case and punctuation (default: False)")


class PointerStepModel(BaseModel):
    step_num: int
    left_idx: int
    right_idx: int
    left_char: str
    right_char: str
    is_match: bool


class MismatchInfoModel(BaseModel):
    left_idx: int
    right_idx: int
    left_char: str
    right_char: str


class PalindromeResponse(BaseModel):
    original_text: str
    clean_text: str
    is_palindrome: bool
    is_almost_palindrome: bool
    total_comparisons: int
    steps: List[PointerStepModel]
    mismatch: Optional[MismatchInfoModel] = None
    longest_palindrome_substring: str


class AnagramRequest(BaseModel):
    text1: str = Field(..., min_length=1, description="First string for anagram comparison")
    text2: str = Field(..., min_length=1, description="Second string for anagram comparison")
    strict: bool = Field(False, description="Whether to preserve case and punctuation")


class AnagramResponse(BaseModel):
    text1: str
    text2: str
    clean_text1: str
    clean_text2: str
    is_anagram: bool
    is_sub_anagram: bool
    total_unique_chars: int
    freq_map1: Dict[str, int]
    freq_map2: Dict[str, int]
    char_diff: Dict[str, int]
    surplus_text1: Dict[str, int]
    surplus_text2: Dict[str, int]
    min_edits_needed: int


class GroupAnagramsRequest(BaseModel):
    words: List[str] = Field(..., min_length=1, description="List of words to cluster into anagram groups")
    strict: bool = Field(False, description="Whether to preserve casing")


class GroupAnagramsResponse(BaseModel):
    groups: Dict[str, List[str]]
    total_groups: int
    total_words: int


class DualVerifyRequest(BaseModel):
    palindrome_text: str = Field(..., min_length=1)
    anagram_text1: str = Field(..., min_length=1)
    anagram_text2: str = Field(..., min_length=1)
    strict: bool = Field(False)


class DualVerifyResponse(BaseModel):
    palindrome: PalindromeResponse
    anagram: AnagramResponse


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/health", tags=["System"])
def health_check():
    """Service health and identity probe."""
    return {
        "status": "healthy",
        "service": "palindrome-anagram-verifier-api",
        "version": "1.0.0"
    }


@app.post("/api/verify/palindrome", response_model=PalindromeResponse, tags=["Palindrome"])
def verify_palindrome_endpoint(payload: PalindromeRequest):
    """
    Executes two-pointer palindrome scanning with complete step trace,
    mismatch diagnostics, and almost-palindrome verification.
    """
    res = VerifierEngine.verify_palindrome(payload.text, strict=payload.strict)

    mismatch_data = (
        MismatchInfoModel(
            left_idx=res.mismatch.left_idx,
            right_idx=res.mismatch.right_idx,
            left_char=res.mismatch.left_char,
            right_char=res.mismatch.right_char,
        )
        if res.mismatch
        else None
    )

    steps_data = [
        PointerStepModel(
            step_num=s.step_num,
            left_idx=s.left_idx,
            right_idx=s.right_idx,
            left_char=s.left_char,
            right_char=s.right_char,
            is_match=s.is_match,
        )
        for s in res.steps
    ]

    return PalindromeResponse(
        original_text=res.original_text,
        clean_text=res.clean_text,
        is_palindrome=res.is_palindrome,
        is_almost_palindrome=res.is_almost_palindrome,
        total_comparisons=res.total_comparisons,
        steps=steps_data,
        mismatch=mismatch_data,
        longest_palindrome_substring=res.longest_palindrome_substring,
    )


@app.post("/api/verify/anagram", response_model=AnagramResponse, tags=["Anagram"])
def verify_anagram_endpoint(payload: AnagramRequest):
    """
    Executes frequency map anagram verification with character delta distribution,
    sub-anagram detection, and edit distance quantification.
    """
    res = VerifierEngine.verify_anagram(payload.text1, payload.text2, strict=payload.strict)

    return AnagramResponse(
        text1=res.text1,
        text2=res.text2,
        clean_text1=res.clean_text1,
        clean_text2=res.clean_text2,
        is_anagram=res.is_anagram,
        is_sub_anagram=res.is_sub_anagram,
        total_unique_chars=res.total_unique_chars,
        freq_map1=res.freq_map1,
        freq_map2=res.freq_map2,
        char_diff=res.char_diff,
        surplus_text1=res.surplus_text1,
        surplus_text2=res.surplus_text2,
        min_edits_needed=res.min_edits_needed,
    )


@app.post("/api/anagrams/group", response_model=GroupAnagramsResponse, tags=["Anagram"])
def group_anagrams_endpoint(payload: GroupAnagramsRequest):
    """
    Clusters an array of strings into anagram categories using canonical signatures.
    """
    groups = VerifierEngine.group_anagrams(payload.words, strict=payload.strict)
    return GroupAnagramsResponse(
        groups=groups,
        total_groups=len(groups),
        total_words=sum(len(v) for v in groups.values()),
    )


@app.post("/api/verify/dual", response_model=DualVerifyResponse, tags=["Composite"])
def dual_verify_endpoint(payload: DualVerifyRequest):
    """
    Executes concurrent verification for both palindrome and anagram suites.
    """
    pal_res = verify_palindrome_endpoint(
        PalindromeRequest(text=payload.palindrome_text, strict=payload.strict)
    )
    ana_res = verify_anagram_endpoint(
        AnagramRequest(text1=payload.anagram_text1, text2=payload.anagram_text2, strict=payload.strict)
    )

    return DualVerifyResponse(palindrome=pal_res, anagram=ana_res)
