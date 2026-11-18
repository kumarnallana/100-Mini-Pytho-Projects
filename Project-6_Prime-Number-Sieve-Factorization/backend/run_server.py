"""
Server launcher for Prime Number Sieve & Factorization FastAPI backend.
Runs uvicorn server on http://127.0.0.1:8000 (or specified PORT).
"""

import os
import sys
import uvicorn

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Prime Number Sieve & Factorization API on http://127.0.0.1:{port} ...")
    uvicorn.run("api:app", host="127.0.0.1", port=port, reload=True)
