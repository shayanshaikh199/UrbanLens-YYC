# Architecture Decisions

This file captures the implementation choices that matter most during review.

## Monorepo Structure

UrbanLens-YYC uses a small monorepo with `backend`, `frontend`, and `docs` folders. This keeps the API, 3D client, test suite, UML, screenshots, and deployment notes together for a short take-home submission.

## Backend

- **FastAPI** was chosen for typed request/response models, straightforward OpenAPI docs, and simple deployment.
- API routes are split by concern: map data, query/filtering, and saved projects.
- Calgary data normalization lives in service modules instead of route handlers so it can be tested independently.
- A Dockerfile is included under `backend/` for Railway deployment.

## Data Strategy

- Building footprints and heights come from City of Calgary open data.
- Assessment values are only shown when a building center falls inside a Calgary assessment parcel. If there is no parcel match, the app shows `Unknown` instead of inventing a value.
- Permit points come from the Calgary `c2es-76ed` building permit dataset.
- Road centerlines and bus stops are cached for civic context and demo reliability.

## LLM Strategy

- Groq handles natural-language parsing when configured.
- The backend validates every LLM result before applying it.
- Deterministic parsing handles common demo queries even if the LLM key is missing or the provider is unavailable.

## Persistence

- SQLite is used for the required lightweight user/project persistence.
- The app uses a simple username flow instead of full authentication, matching the assignment requirement.
- Saved searches store the query and validated filters, then re-run those filters when loaded.

## Frontend

- React handles UI state, saved searches, and API calls.
- Three.js via React Three Fiber renders the city scene.
- The map is the primary screen, with floating controls instead of a heavy dashboard layout.
- Building selection, permit selection, and query matches are visually distinct to make the demo easy to follow.

## Deployment

- Backend: Railway using `backend/Dockerfile`.
- Frontend: Vercel using `frontend/vercel.json`.
- CORS is restricted through `FRONTEND_ORIGINS` so the deployed frontend can call the deployed backend.
