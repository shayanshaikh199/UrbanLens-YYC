# Deployment Checklist

Live deployment:

- Frontend: `https://urban-lens-yyc.vercel.app`
- Backend: `https://urbanlens-yyc-api-production.up.railway.app`
- API status: `https://urbanlens-yyc-api-production.up.railway.app/api/status`

## Backend

- Railway deploy can use `backend/Dockerfile`.
- Set Railway root directory to `backend`.
- Leave the Railway build command blank when using the Dockerfile.
- Leave the Railway start command blank when using the Dockerfile.
- Deploy from `render.yaml` with `backend` as the service root.
- Set `GROQ_API_KEY` as a secret environment variable.
- Set `GROQ_MODEL` to `llama-3.3-70b-versatile`.
- Set `DATABASE_URL` to the production database URL. SQLite is acceptable for a prototype; managed Postgres is better for a longer-lived deployment.
- Set `FRONTEND_ORIGINS` to the deployed frontend origin.

Smoke checks:

```text
GET /health
GET /api/status
GET /api/map/buildings
GET /api/map/permits
POST /api/query
```

`/api/status` should return the Downtown Core / Stephen Ave area, non-zero building and permit counts, and LLM configuration status without exposing any API key.

## Frontend

- Deploy the `frontend` directory to Vercel.
- Set `VITE_API_URL` to the deployed backend URL.
- Confirm the browser console has no errors on load.
- Run a quick query and verify highlighted buildings appear.
- Save and load a project with a test username.

## Final Demo Pass

- Use the quick query buttons to show query parsing.
- Click a matched building from the result list.
- Click a permit marker and inspect permit details.
- Save the current filter as a project.
- Load the saved project and verify match highlights return.
