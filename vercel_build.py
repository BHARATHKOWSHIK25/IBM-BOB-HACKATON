"""Build the Vite frontend before Vercel bundles the FastAPI function."""
from __future__ import annotations

import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT / "frontend"


def main() -> None:
    subprocess.run(["npm", "ci"], cwd=FRONTEND, check=True)
    subprocess.run(["npm", "run", "build"], cwd=FRONTEND, check=True)


if __name__ == "__main__":
    main()
