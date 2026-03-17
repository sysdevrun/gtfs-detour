const en = {
  appTitle: 'GTFS Detour Planner',
  mapStyle: 'Map style:',
  routingFailed: 'Routing failed: {{message}}',

  'gtfs.heading': '1. GTFS Feed',
  'gtfs.headingSelect': '1. Select GTFS Feed',
  'gtfs.changeFeed': 'Change feed',
  'gtfs.loading': 'Loading...',
  'gtfs.cancel': 'Cancel',

  'trip.heading': '2. Select Trip',
  'trip.filterPlaceholder': 'Filter routes...',
  'trip.noRoutes': 'No routes found',
  'trip.change': 'Change',
  'trip.outward': 'Outward (direction 0)',
  'trip.inward': 'Inward (direction 1)',
  'trip.noHeadsign': 'No headsign',
  'trip.tripCount_one': '{{count}} trip',
  'trip.tripCount_other': '{{count}} trips',
  'trip.dirPrefix': 'Dir {{id}}:',
  'trip.selectTrip': 'Select a trip:',
  'trip.shape': 'shape: {{id}}',

  'stops.heading': '3. Select Detour Stops',
  'stops.startLabel': 'Start of detour:',
  'stops.endLabel': 'End of detour:',
  'stops.selectStart': '— Select start stop —',
  'stops.selectEnd': '— Select end stop —',

  'distance.heading': '4. Distances',
  'distance.original': 'Original segment:',
  'distance.detour': 'Detour route:',
  'distance.net': 'Net difference:',
  'distance.km': '{{value}} km',

  'detour.heading': '5. Alternative Route',
  'detour.hint': 'Click on the map to add waypoints for the detour route.',
  'detour.wpLabel': 'WP{{index}}',
  'detour.clearAll': 'Clear all',
  'detour.computing': 'Computing...',
  'detour.compute': 'Compute detour route',

  'map.detourStart': 'Detour Start',
  'map.detourEnd': 'Detour End',
} as const;

export default en;
