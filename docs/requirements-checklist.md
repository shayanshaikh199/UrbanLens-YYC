# MASIV Requirements Checklist

This checklist maps the assignment requirements to the current UrbanLensYYC implementation.

## Core App

| Requirement | Status | Implementation |
| --- | --- | --- |
| Python backend, preferably FastAPI or Flask | Done | FastAPI app in `backend/app/main.py` |
| JavaScript frontend with React and Three.js | Done | React/Vite app with Three.js scene in `frontend/src` |
| Lightweight persistence such as SQLite | Done | SQLAlchemy + SQLite project storage in `backend/app/db` |
| Free-tier LLM API | Done | Groq integration with deterministic fallback in `backend/app/services/query_engine.py` |
| Clean modular code and error handling | Done | Separate API, services, models, hooks, and components with backend tests |

## City Data

| Requirement | Status | Implementation |
| --- | --- | --- |
| Fetch Calgary map data for at least 3-4 blocks | Done | Downtown Core / Stephen Ave bounds in Calgary data client |
| Use public open data | Done | City of Calgary building footprints, assessments, and permits |
| Process building footprints for frontend display | Done | Normalized footprint, center, height, zoning, land use, value data |
| Include useful metadata | Done | Address, height, floors, zoning, land use, assessed value |

## 3D Visualization

| Requirement | Status | Implementation |
| --- | --- | --- |
| Render selected block area in Three.js | Done | `CityScene`, `BuildingMesh`, and scene coordinate helpers |
| Represent buildings as extruded 3D shapes | Done | Building footprints are extruded by normalized height |
| Keep buildings interactable | Done | Building click and hover selection states |

## Building Interaction

| Requirement | Status | Implementation |
| --- | --- | --- |
| Clicking a building highlights it | Done | Selected and matched building materials in `BuildingMesh` |
| Details panel with fetched data | Done | `DataPanel` shows selected building details |
| Every building has data points | Done | Normalization fills core metadata for loaded buildings |

## Live City Data Layer

| Requirement | Status | Implementation |
| --- | --- | --- |
| Fetch recent Calgary building permits | Done | `c2es-76ed.json` via `fetch_building_permits` |
| Use SoQL location filtering | Done | `within_circle(point, lat, lng, radius)` |
| Render permits as 3D markers or pins | Done | `PermitMarker` in the Three.js scene |
| Toggle permit layer | Done | Permit layer toggle in the control rail |
| Clicking a marker shows details | Done | Selected permit details in `DataPanel` |

## LLM Querying

| Requirement | Status | Implementation |
| --- | --- | --- |
| Natural-language text input | Done | `QueryPanel` |
| Backend sends query to LLM for structured filter | Done | Groq JSON parsing path |
| Backend validates and applies filter | Done | `validate_filters` and `apply_filters` |
| Frontend highlights matching buildings | Done | `matched_building_ids` drive scene highlighting |
| Alternative/fallback explained | Done | README documents deterministic fallback behavior |

## Project Persistence

| Requirement | Status | Implementation |
| --- | --- | --- |
| Simple username input | Done | Username input in the control rail |
| Save active filters under a project name | Done | `POST /api/users/{username}/projects` |
| Display saved projects for current user | Done | `ProjectPanel` |
| Load saved project and re-apply filters | Done | Saved filters run through `/api/filter` |
| Delete saved projects | Extra | `DELETE /api/users/{username}/projects/{project_id}` |

## Required Delivery

| Requirement | Status | Notes |
| --- | --- | --- |
| Source code | Done | Repo contains backend, frontend, docs, deployment config |
| README setup instructions | Mostly done | README has local setup and deployment notes; final public URLs still need filling in |
| UML diagram | Partially done | Mermaid UML exists in `docs/uml.md`; export to PDF/PNG before final ZIP |
| Hosted public app link | Pending | Backend/frontend configs exist, but final URLs need to be deployed and recorded |
| ZIP package | Pending | Create final ZIP after deployment URLs and exported UML are ready |
| Optional walkthrough video | Optional | Recommended if time allows |

## Optional Bonus

| Requirement | Status | Implementation |
| --- | --- | --- |
| Sunlight or shadow study | Done | Sun study slider controls Three.js directional light and building shadows |

## Final Pre-Submission Checklist

- Export UML from `docs/uml.md` as a PNG or PDF.
- Deploy backend and frontend.
- Add deployed URLs to `README.md`.
- Run backend tests and frontend build one final time.
- Smoke test query, manual filter, building click, permit click, save, load, and delete.
- Create the final ZIP package without `.env`, `.venv`, `node_modules`, local database files, or caches.
