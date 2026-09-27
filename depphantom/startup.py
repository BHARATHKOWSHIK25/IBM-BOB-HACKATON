"""startup.py — DepPhantom backend launch script.

Usage (from depphantom/ directory):
    python startup.py

Or with options:
    python startup.py --port 8080 --reload
"""
from __future__ import annotations
import sys
import os
import argparse

# Ensure the depphantom/ directory is on the path
_HERE = os.path.dirname(os.path.abspath(__file__))
if _HERE not in sys.path:
    sys.path.insert(0, _HERE)


def main():
    parser = argparse.ArgumentParser(description="DepPhantom Security Gateway")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port (default: 8000)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload (development)")
    parser.add_argument("--workers", type=int, default=1, help="Number of worker processes")
    args = parser.parse_args()

    try:
        import uvicorn
    except ImportError:
        print("ERROR: uvicorn not installed. Run: pip install -r backend/requirements.txt")
        sys.exit(1)

    print(f"")
    print(f"  DepPhantom Security Gateway")
    print(f"  ─────────────────────────────────────────")
    print(f"  Starting on http://{args.host}:{args.port}")
    print(f"  API docs: http://localhost:{args.port}/api/docs")
    print(f"  Health:   http://localhost:{args.port}/api/health")
    print(f"  ─────────────────────────────────────────")
    print(f"")

    uvicorn.run(
        "backend.main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
        workers=args.workers if not args.reload else 1,
        log_level="info",
    )


if __name__ == "__main__":
    main()
