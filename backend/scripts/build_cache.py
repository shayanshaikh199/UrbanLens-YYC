from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.map_data import refresh_buildings_cache, refresh_permits_cache  # noqa: E402


def main() -> None:
    buildings = refresh_buildings_cache()
    permits = refresh_permits_cache()
    print(f"Cached {buildings['metadata']['count']} buildings")
    print(f"Cached {permits['metadata']['count']} permits")


if __name__ == "__main__":
    main()
