# MASIV Fall 2026 Intern Test - Assignment Brief

Source PDF: `MASIV_InternTest_2026.pdf`

## Project

Build and launch a web-based 3D city dashboard for Calgary that demonstrates backend development, data persistence, frontend visualization, and LLM-assisted map querying.

Working product name: **UrbanLensYYC**.

## Submission Constraints

- Submit within 36 hours of receiving the brief.
- Deliver a ZIP file containing source code, `README.md` setup instructions, and a UML diagram as PDF/PNG or scanned image.
- Host the app on a free service and provide the public link.
- Optional: include a 2-3 minute walkthrough video.

## Required Stack

- Backend: Python, preferably FastAPI or Flask.
- Frontend: JavaScript, React, and Three.js.
- Database: lightweight persistence, such as SQLite.
- LLM: free-tier API, such as Groq or Hugging Face Inference API.
- Engineering quality: clean modular code, error handling, and clear code documentation.

## Functional Requirements

### Calgary City Data

- Fetch Calgary city map data for at least 3-4 city blocks.
- Use public open data sources such as City of Calgary Open Data, OpenStreetMap, or similar.
- Process the data for frontend display.
- Target data should include building footprints and should include or derive useful metadata such as height, address, zoning, assessed value, or similar.

### 3D Building Visualization

- Render the full selected block area in Three.js.
- Represent buildings as extruded 3D shapes based on footprints and height data.
- Keep all buildings interactable.

### Building Interaction

- Clicking a building highlights it.
- Clicking a building opens a popup/details panel with fetched data.
- Every building should have data points available.
- Suggested fields: address, height, zoning type, assessed property value, or comparable attributes.

### Live City Data Layer

- Fetch live or recent Calgary building permits in or around the selected blocks.
- Required dataset from the brief: `https://data.calgary.ca/resource/c2es-76ed.json` or `.geojson`.
- The permit dataset is point data and includes permit type, status, estimated project cost, and address.
- Supports SoQL filters, for example `within_circle(point, 51.0447, -114.0719, 500)`.
- Render permits as simple 3D markers or pins.
- Add a UI toggle to show/hide the permit layer.
- Clicking a marker shows permit details.

### LLM Querying

- Add a natural-language text input for map queries.
- Example queries:
  - `highlight buildings over 100 feet`
  - `show commercial buildings`
  - `show buildings in RC-G zoning`
  - `show buildings less than $500,000 in value`
- Backend sends the user query to an LLM and asks for a structured filter.
- LLM response should be JSON, for example:

```json
{
  "attribute": "height",
  "operator": ">",
  "value": 100
}
```

- Backend validates and applies the filter to the building dataset.
- Frontend highlights matching buildings in the 3D scene.
- If an alternative LLM approach is used, explain it in the README and include it in the UML.

### Project Persistence

- Let a user identify themselves with a simple username input.
- Full authentication is not required.
- Add a `Save Project` flow that stores the current active LLM-generated filters under a project name.
- Display a list of saved projects for the current user.
- Loading a saved project should restore filters and re-apply them to the 3D map.

### UML

- Include a UML diagram documenting solution structure and flow.
- Diagram should include user and project data models.
- Best candidates:
  - class/data model diagram for `User`, `Project`, `SavedFilter`, `Building`, and `Permit`
  - sequence diagram for natural-language query -> LLM parse -> backend filter -> frontend highlight

## Optional Bonus

Only after core requirements are complete:

- Add an environmental visualization touch such as sunlight/shadow studies.
- A practical version: Three.js directional sun light with a time-of-day slider casting real-time building shadows.

## Delivery Checklist

- [ ] Backend exposes city/building data endpoint.
- [ ] Backend exposes building permit endpoint.
- [ ] Backend exposes LLM query endpoint.
- [ ] Backend exposes user/project save/load endpoints.
- [ ] SQLite schema and migrations/init path exist.
- [ ] Frontend renders 3D buildings.
- [ ] Frontend supports click selection and building details.
- [ ] Permit layer toggle and marker click details work.
- [ ] Natural-language query highlights matching buildings.
- [ ] Save/load project flow works.
- [ ] README includes setup, API key instructions, and deployment instructions.
- [ ] UML diagram is committed.
- [ ] App is hosted publicly.
- [ ] ZIP package is ready for submission.
