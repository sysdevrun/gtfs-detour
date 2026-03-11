# GTFS Detour Planner

A browser-based tool to visualize GTFS transit trip shapes on a map, define a detour segment between two stops, and compute an alternative road route via the Geoportail routing API. Compare the original segment distance vs. the detour distance.

## Features

- **GTFS feed selection** — import a ZIP file, paste a URL, or search online catalogs (transport.data.gouv.fr, MobilityData)
- **Trip search** — autocomplete search by trip short name with direction/headsign disambiguation
- **Shape visualization** — display the full trip shape on a MapLibre map (IGN or OSM Liberty style)
- **Detour segment** — select start and end stops to highlight the segment to reroute
- **Waypoint placement** — click on the map to add draggable intermediate waypoints
- **Route computation** — compute the shortest car route via the Geoportail Navigation API (bdtopo-osrm)
- **Distance comparison** — view original segment distance, detour distance, and net difference

## Tech Stack

- **Vite + React + TypeScript**
- **[react-gtfs-selector](https://www.npmjs.com/package/react-gtfs-selector)** — GTFS source picker
- **[gtfs-sqljs](https://www.npmjs.com/package/gtfs-sqljs)** — in-browser GTFS querying via sql.js (Web Worker)
- **[MapLibre GL JS](https://maplibre.org/)** — map display
- **[@turf/turf](https://turfjs.org/)** — geometry operations
- **[Geoportail Navigation API](https://geoservices.ign.fr/)** — road routing

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 and:

1. Select a GTFS feed (file, URL, or online search)
2. Search for a trip by short name
3. Select start and end stops for the detour segment
4. Click on the map to add waypoints
5. Click "Compute detour route" to see the alternative path and distance comparison

## Build & Deploy

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

The app is automatically deployed to GitHub Pages on push to `main`.

## License

MIT
