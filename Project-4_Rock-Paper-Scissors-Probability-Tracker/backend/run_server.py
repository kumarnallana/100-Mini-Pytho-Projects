"""
Server launcher for Rock-Paper-Scissors FastAPI backend.
Runs uvicorn server on http://localhost:8000
"""

import uvicorn
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    print("🚀 Starting RPS Probability Tracker FastAPI server on http://127.0.0.1:8000 ...")
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)

