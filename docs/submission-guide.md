# UrbanLens-YYC Submission Guide

Use this file as the final handoff checklist before sending the MASIV submission.

## What To Submit

- Source code from this repository.
- `README.md` with setup, Groq API key instructions, environment variables, architecture, API, deployment links, and demo notes.
- UML export: `docs/assets/uml-export.svg`.
- Supporting visuals:
  - `docs/assets/architecture-overview.svg`
  - `docs/assets/feature-overview.svg`
  - `docs/assets/screenshot-map-overview.png`
  - `docs/assets/screenshot-building-details.png`
  - `docs/assets/screenshot-query-results.png`
- Screenshot guide: `docs/screenshots.md`.
- Architecture decisions: `docs/architecture-decisions.md`.
- Future improvements: `docs/future-improvements.md`.
- Public frontend URL.
- Public backend URL or API status URL.
- Optional 2-3 minute walkthrough video.

## Final Smoke Test

Backend:

```bash
cd backend
.venv\Scripts\python.exe -m pytest -q
```

Frontend:

```bash
cd frontend
npm.cmd run lint
npm.cmd run build
```

Manual demo checks:

- Load the deployed 3D map at `https://urban-lens-yyc.vercel.app`.
- Run `show commercial buildings`.
- Click a building and review height, zoning, use, and assessment value.
- Toggle permit pins and click one permit.
- Toggle bus stops.
- Move the sun slider from day to night.
- Save, load, and delete a project under a test username.
- Check `/api/status` on the deployed backend.

## Packaging Notes

Do not include:

- `.env`
- `.venv`
- `node_modules`
- `dist`
- local `.db` files
- `.git`

Good ZIP name:

```text
UrbanLens-YYC-Shayan-Shaikh.zip
```

Recommended ZIP contents:

- `backend/`
- `frontend/`
- `docs/`
- `README.md`
- `render.yaml`
- `.gitignore`

Exclude local/generated files:

- `.tmp/`
- `.env`
- `.venv/`
- `node_modules/`
- `dist/`
- local `.db` files
- `.git/`

## Short Reviewer Pitch

UrbanLens-YYC is a full-stack urban intelligence prototype for Downtown Core / Stephen Ave. It combines Calgary open-data building footprints, parcel-matched assessment values, building permits, road context, bus stop markers, project persistence, and LLM-powered natural-language filtering in a Three.js dashboard.
