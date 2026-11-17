"""
Server launcher for Palindrome & Anagram Verifier FastAPI backend.
Runs uvicorn server on http://127.0.0.1:8000 (or specified PORT).
"""

import os
import sys
import uvicorn

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Palindrome & Anagram Verifier API on http://127.0.0.1:{port} ...")
    uvicorn.run("api:app", host="127.0.0.1", port=port, reload=True)

