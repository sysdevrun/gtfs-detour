const fr = {
  appTitle: 'Planificateur de détours GTFS',
  mapStyle: 'Style de carte :',
  routingFailed: 'Échec du routage : {{message}}',

  'gtfs.heading': '1. Flux GTFS',
  'gtfs.headingSelect': '1. Sélectionner un flux GTFS',
  'gtfs.changeFeed': 'Changer de flux',
  'gtfs.loading': 'Chargement...',
  'gtfs.cancel': 'Annuler',

  'trip.heading': '2. Sélectionner un trajet',
  'trip.filterPlaceholder': 'Filtrer les lignes...',
  'trip.noRoutes': 'Aucune ligne trouvée',
  'trip.change': 'Changer',
  'trip.outward': 'Aller (direction 0)',
  'trip.inward': 'Retour (direction 1)',
  'trip.noHeadsign': 'Pas de destination',
  'trip.tripCount_one': '{{count}} trajet',
  'trip.tripCount_other': '{{count}} trajets',
  'trip.dirPrefix': 'Dir {{id}} :',
  'trip.selectTrip': 'Sélectionner un trajet :',
  'trip.shape': 'tracé : {{id}}',

  'stops.heading': '3. Sélectionner les arrêts de détour',
  'stops.startLabel': 'Début du détour :',
  'stops.endLabel': 'Fin du détour :',
  'stops.selectStart': '— Sélectionner l\'arrêt de début —',
  'stops.selectEnd': '— Sélectionner l\'arrêt de fin —',

  'distance.heading': '4. Distances',
  'distance.original': 'Segment original :',
  'distance.detour': 'Itinéraire de détour :',
  'distance.net': 'Différence nette :',
  'distance.km': '{{value}} km',

  'detour.heading': '5. Itinéraire alternatif',
  'detour.hint': 'Cliquez sur la carte pour ajouter des points de passage.',
  'detour.wpLabel': 'PP{{index}}',
  'detour.clearAll': 'Tout effacer',
  'detour.computing': 'Calcul en cours...',
  'detour.compute': 'Calculer l\'itinéraire de détour',

  'map.detourStart': 'Début du détour',
  'map.detourEnd': 'Fin du détour',
} as const;

export default fr;
