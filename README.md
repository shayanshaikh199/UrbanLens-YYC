# UrbanLensYYC

UrbanLensYYC is a full-stack 3D Calgary city dashboard for the MASIV Fall 2026 intern test.

The target product is an interactive React + Three.js map of several Calgary blocks with:

- extruded building footprints
- clickable building details
- Calgary building permit markers
- natural-language LLM filtering
- username-based project save/load
- UML and deployment documentation

The current map area is **Downtown Core / Stephen Ave, Calgary AB**.

## Planning Docs

- [Assignment brief](docs/assignment-brief.md)
- [Implementation blueprint](docs/implementation-blueprint.md)
- [UML diagrams](docs/uml.md)

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/build_cache.py
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Current Status

Built:

- FastAPI backend with health, map data, query, filter, and project endpoints
- cached Calgary building and permit datasets
- deterministic query fallback for height, zoning, land use, value, and superlatives
- SQLite-backed username/project persistence
- React + Three.js frontend with 3D buildings, permit pins, query controls, and save/load UI

Next:

- refine the 3D scene details and interaction polish
- connect production environment variables
- prepare final ZIP package
