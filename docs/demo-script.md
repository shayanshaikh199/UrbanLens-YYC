# Demo Script

Use this as a short walkthrough for reviewing or recording the project.

## Two-Minute Flow

1. Open UrbanLensYYC and point out the Downtown Core / Stephen Ave focus area.
2. Toggle the permit layer off and on to show the live city data layer.
3. Run `show commercial buildings` from the natural-language query box.
4. Point out the parsed filter, match count, highlighted buildings, and matched building list.
5. Click a highlighted building and show address, height, zoning, land use, assessed value, and related permits.
6. Click a permit marker and show permit type, status, estimated project cost, issued date, and contractor.
7. Apply a manual filter such as commercial buildings over 20 m.
8. Save the current filter as a project, load it again, then delete it.
9. Show the Downtown insights panel as a quick summary of the selected area.

## Final Smoke Test

Run before packaging:

```bash
cd backend
.venv\Scripts\python.exe -m pytest -q
```

```bash
cd frontend
npm.cmd run build
```

Manual checks:

- Natural-language query highlights buildings.
- Manual filters update matched buildings.
- Building and permit click details work.
- Saved project save/load/delete works.
- `/api/status` returns buildings, permits, data source, and LLM configuration status without secrets.
