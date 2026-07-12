# Future Improvements

The core MASIV requirements and the sunlight/shadow optional bonus are implemented. These are reasonable next steps if the prototype were continued after submission.

## Data Accuracy

- Add a full geospatial join pipeline with parcel/building overlap percentages rather than center-in-polygon matching.
- Store source dataset timestamps and refresh history in the API status endpoint.
- Add a reviewer-facing data provenance panel for each selected building.

## User Experience

- Add a guided first-run tour for the query dock, saved searches, and layer controls.
- Add keyboard shortcuts for clearing matches, focusing selected buildings, and opening tools.
- Improve mobile layout if the product needed phone support.

## Performance

- Split the frontend bundle so Three.js and UI code load in separate chunks.
- Add API response compression and long-lived cache headers for static map datasets.
- Move larger civic layers to vector-tile style loading if the map expands beyond the current downtown area.

## Persistence

- Replace SQLite with managed Postgres for a longer-lived public deployment.
- Add project sharing links.
- Add named map views with camera position, sun time, and active layers.

## Analysis Features

- Add shadow-duration summaries per selected parcel.
- Add permit activity heatmaps.
- Add comparison mode for two saved queries.
- Add more civic layers such as CTrain stations, land-use districts, or heritage assets.
