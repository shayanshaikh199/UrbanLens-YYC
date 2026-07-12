# UrbanLens-YYC Backend

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

## Groq API Key

For local LLM parsing, create a free Groq key at [https://console.groq.com](https://console.groq.com), open **API Keys**, create a key, and place it in `backend/.env`:

```text
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

Paste the private key as the value of `GROQ_API_KEY` locally or into Railway service variables for production.

Do not commit `.env`.

## Data Cache

The map endpoints read normalized JSON from `app/data/cache/` when present. To refresh from Calgary Open Data:

```bash
python scripts/build_cache.py
```

The cache keeps demos stable while the script documents the live public data pipeline.
