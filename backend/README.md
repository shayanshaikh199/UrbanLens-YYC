# UrbanLensYYC Backend

FastAPI service for Calgary building data, permit markers, LLM query parsing, and project persistence.

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

## Data Cache

The map endpoints read normalized JSON from `app/data/cache/` when present. To refresh from Calgary Open Data:

```bash
python scripts/build_cache.py
```

The cache keeps demos stable while the script documents the live public data pipeline.
