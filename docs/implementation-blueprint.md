# UrbanLensYYC Implementation Blueprint

## Recommended Architecture

Use a small monorepo with a Python API and React/Three.js client:

```text
UrbanLensYYC/
  backend/
    app/
      api/
      core/
      data/
      db/
      models/
      services/
    tests/
    pyproject.toml
  frontend/
    src/
      components/
      hooks/
      scene/
      services/
      state/
      types/
    package.json
  docs/
  README.md
```

Backend choice: **FastAPI**. It gives fast JSON APIs, typed request/response models, clean OpenAPI docs, and easy deployment.

Frontend choice: **Vite + React + Three.js**. Keep Three.js scene code isolated from React UI controls so rendering logic stays manageable.

Persistence choice: **SQLite + SQLModel or SQLAlchemy**. We only need users, projects, and saved filters, so this should stay lightweight.

LLM choice: **Groq first**, with a deterministic fallback parser for demo resilience. The assignment asks for a free LLM API, but a fallback prevents the whole app from failing during a live review if an API key is missing.

## Data Strategy

The hardest part is reliable building geometry plus useful attributes. We should pick a compact downtown/Beltline area where Calgary permits are dense and 3-4 blocks contain enough buildings to look impressive.

Preferred approach:

- Use Calgary Open Data building footprints from `cchr-krqg.geojson`.
- Use Calgary Open Data current year property assessments from `4bsw-nn7w.json`.
- Use building footprint elevation fields for height when available, especially `rooftop_elev_z - grd_elev_min_z`.
- Join footprints to assessments with a centroid/proximity strategy, then normalize address, zoning/land-use designation, and assessed value.
- Use Calgary permit data from `c2es-76ed` near the same center point.
- Keep a cached JSON copy of normalized buildings so the deployed demo does not depend on live public API latency.

This satisfies the 3D visualization and LLM filtering requirements without getting trapped in a long GIS data-joining project.

## Implementation Choices

Core choices:

- Calgary Open Data `cchr-krqg` for building footprints and elevation-derived heights.
- Calgary Open Data `4bsw-nn7w` for property assessment values and land-use/zoning fields.
- Calgary Open Data `c2es-76ed` for building permit markers.
- Groq as the first LLM provider with deterministic fallback parsing for resilience.
- Pre-cached normalized building data for reliable demos.
- A deterministic path for superlatives like `tallest` or `most expensive`, because ranking questions are better handled by sorting known data than by asking an LLM to invent a threshold.
- Vercel for frontend hosting and Render for backend hosting.

Product direction:

- Position the app as an urban analysis workbench for Calgary block-level building intelligence.
- Use a quiet civic/product interface with dense controls, clear map state, and fast inspection.
- Keep the backend modular with FastAPI service modules.
- Implement the MASIV-requested building permit markers explicitly.
- Use real SQLite-backed user/project records locally.

## API Shape

Initial endpoints:

- `GET /health`
- `GET /api/map/buildings`
  - returns normalized buildings with footprint coordinates, height, address, zoning/use, assessed value if available, and source metadata
- `GET /api/map/permits`
  - returns permit markers near the configured map center
- `POST /api/query`
  - accepts `{ "query": "...", "activeFilters": [...] }`
  - returns parsed filter JSON plus matching building IDs
- `POST /api/users`
  - creates or resolves a simple username
- `GET /api/users/{username}/projects`
- `POST /api/users/{username}/projects`
- `GET /api/users/{username}/projects/{project_id}`

## Data Models

Core persisted models:

- `User`
  - `id`
  - `username`
  - `created_at`
- `Project`
  - `id`
  - `user_id`
  - `name`
  - `filters_json`
  - `created_at`
  - `updated_at`

Runtime models:

- `Building`
  - `id`
  - `source`
  - `footprint`
  - `height_m`
  - `address`
  - `building_type`
  - `zoning`
  - `assessed_value`
  - `properties`
- `Permit`
  - `id`
  - `lat`
  - `lng`
  - `address`
  - `permit_type`
  - `status`
  - `estimated_project_cost`
  - `properties`
- `Filter`
  - `attribute`
  - `operator`
  - `value`
  - `unit`

## First Build Sequence

### 1. Connect GitHub and Branch

Blocked until we have either:

- the repository URL, such as `https://github.com/<owner>/UrbanLensYYC`, and the existing branch name, or
- a working GitHub auth session that can access the repo.

Local state right now:

- folder is an empty Git repository
- current branch is `master`
- no remote is configured
- local GitHub CLI token for `shayanshaikh199` is invalid

### 2. Scaffold the App

- Create `backend` FastAPI project.
- Create `frontend` Vite React project.
- Add root README with setup commands.
- Add `.env.example` files for backend and frontend.
- Add basic lint/test scripts.

### 3. Build Backend Data Pipeline

- Implement building data fetcher/normalizer.
- Implement permit data fetcher against Calgary `c2es-76ed`.
- Cache fetched city data in memory or local JSON during development to avoid repeatedly hitting public APIs.
- Add tests for normalization and filtering.

### 4. Build 3D Map MVP

- Render buildings from normalized GeoJSON-like data.
- Convert lat/lng into local scene coordinates.
- Extrude footprints by height.
- Add camera controls, hover/click picking, selected highlight, and details panel.

### 5. Add Permit Layer

- Render permit pins above the map.
- Add show/hide toggle.
- Add marker click details.

### 6. Add LLM Query Filtering

- Build a strict LLM prompt that returns only JSON.
- Validate returned filters server-side.
- Support the operators needed for the examples: `>`, `<`, `>=`, `<=`, `=`, `contains`, and `in`.
- Return matching building IDs.
- Highlight matches in Three.js.

### 7. Add Persistence

- Implement username flow.
- Save current filters as a named project.
- List and load saved projects.
- Re-apply loaded filters to the map.

### 8. Polish, UML, Deploy, Package

- Add UML diagrams in `docs/uml.md` and export as PNG/PDF if needed.
- Finish README setup, API key, architecture, deployment, and known limitations.
- Deploy backend and frontend on free services.
- Create final ZIP.

## Immediate Next Step

Once the GitHub repo/branch access is fixed, start with the scaffold and backend data pipeline. The project lives or dies on reliable data normalization, so the first real code milestone should be:

> `GET /api/map/buildings` and `GET /api/map/permits` returning clean, documented JSON for one chosen Calgary area.

After that, the Three.js map becomes a rendering problem instead of a research problem.
