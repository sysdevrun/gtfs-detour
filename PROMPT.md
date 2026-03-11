# Prompts used

## Initial prompt

Create a vite typescript project that let the user select a GTFS. If gtfs is online, uses a CORS proxy.

Once GTFS is selected, show in a Maplibre map with https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json as style file
Let the user input a trip short name: help the user find the trip short names

Once a trip is selected, fetch the shape of the trip and display the geojson of the shape on maplibre

THen let the user selects:
- stop (from list of stops of the trip) of the start of the detour
- stop of the end of the detour

Add makers on the map
Use turfjs to compute the segment of the shape between the two stops, higlight this segment on the map, compute distance in km.

Show distance for the user too.

Let also the user to add markers to compute an alternative path between start and stop. Use the service described by
https://www.geoportail.gouv.fr/depot/swagger/itineraire.yaml to compute the itineraries. Show distance of the detour, and net total between distance of new path
minus detour

Ask questions to refine the plan


### User answered Claude's questions
  ⎿  · For the alternative detour path, should the user draw waypoints by clicking directly on the map, or input coordinates manually? → Click on map (Recommended)
     · What routing profile should be used for the Geoportail itinerary API? → Car only
     · Should trip_short_name search be a simple text filter, or do you want autocomplete with fuzzy matching? → Autocomplete dropdown
     · Should the UI be a single-page linear flow (all steps visible) or a step-by-step wizard? → All visible at once

## 2nd prompt

Add a README.md describing the project
Add CI so it deploys on github pages (for git@github.com:sysdevrun/gtfs-detour.git repo with default subdir for pages) on main branch

Also let the user cancel the GTFS selection. When loading, hide the GTFS selection (but let the user cancel its choice)
for transport.data.gouv.fr , let the words between dots breaks to a new line

For find Trip:
- show suggestions if no input is done
- let the user select with arrows

Let the user selects between IGN and https://maputnik.github.io/osm-liberty/style.json for maplibre style

Add git@github.com:sysdevrun/gtfs-detour.git as git repo, commit and push

## 3rd prompt
Replace osm-liberty by https://tuiles.enliberte.fr/styles/bright.json Install pmtiles and add pmtiles protocol as it's required for tuiles en libertes (see
  https://tuiles.enliberte.fr/ )

  