import sys
import os
from pathlib import Path

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
backend_dir = str(BASE_DIR / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set serverless environment flag if not present
if "VERCEL" not in os.environ:
    os.environ["VERCEL"] = "1"

# Import the FastAPI application
from app.main import app

# Export for Vercel Serverless Function runtime
handler = app
