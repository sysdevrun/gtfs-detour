const de = {
  appTitle: 'GTFS-Umleitungsplaner',
  mapStyle: 'Kartenstil:',
  routingFailed: 'Routenberechnung fehlgeschlagen: {{message}}',

  'gtfs.heading': '1. GTFS-Feed',
  'gtfs.headingSelect': '1. GTFS-Feed auswählen',
  'gtfs.changeFeed': 'Feed wechseln',
  'gtfs.loading': 'Laden...',
  'gtfs.cancel': 'Abbrechen',

  'trip.heading': '2. Fahrt auswählen',
  'trip.filterPlaceholder': 'Linien filtern...',
  'trip.noRoutes': 'Keine Linien gefunden',
  'trip.change': 'Ändern',
  'trip.outward': 'Hinfahrt (Richtung 0)',
  'trip.inward': 'Rückfahrt (Richtung 1)',
  'trip.noHeadsign': 'Kein Fahrtziel',
  'trip.tripCount_one': '{{count}} Fahrt',
  'trip.tripCount_other': '{{count}} Fahrten',
  'trip.dirPrefix': 'Ri. {{id}}:',
  'trip.selectTrip': 'Fahrt auswählen:',
  'trip.shape': 'Verlauf: {{id}}',

  'stops.heading': '3. Umleitungshaltestellen wählen',
  'stops.startLabel': 'Beginn der Umleitung:',
  'stops.endLabel': 'Ende der Umleitung:',
  'stops.selectStart': '— Starthaltestelle wählen —',
  'stops.selectEnd': '— Endhaltestelle wählen —',

  'distance.heading': '4. Entfernungen',
  'distance.original': 'Originalabschnitt:',
  'distance.detour': 'Umleitungsroute:',
  'distance.net': 'Nettodifferenz:',
  'distance.km': '{{value}} km',

  'detour.heading': '5. Alternativroute',
  'detour.hint': 'Klicken Sie auf die Karte, um Wegpunkte für die Umleitungsroute hinzuzufügen.',
  'detour.wpLabel': 'WP{{index}}',
  'detour.clearAll': 'Alle löschen',
  'detour.computing': 'Berechnung...',
  'detour.compute': 'Umleitungsroute berechnen',

  'map.detourStart': 'Umleitungsbeginn',
  'map.detourEnd': 'Umleitungsende',
} as const;

export default de;
