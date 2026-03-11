export interface RouteResult {
  geometry: GeoJSON.Geometry;
  distance: number; // km
  duration: number; // hours
}

export async function computeItinerary(
  start: [number, number], // [lon, lat]
  end: [number, number],
  intermediates: [number, number][] = []
): Promise<RouteResult> {
  const params = new URLSearchParams({
    resource: 'bdtopo-osrm',
    profile: 'car',
    optimization: 'shortest',
    start: start.join(','),
    end: end.join(','),
    geometryFormat: 'geojson',
    getSteps: 'false',
    getBbox: 'false',
    distanceUnit: 'kilometer',
    crs: 'EPSG:4326',
  });

  if (intermediates.length > 0) {
    params.set('intermediates', intermediates.map((p) => p.join(',')).join('|'));
  }

  const url = `https://data.geopf.fr/navigation/itineraire?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Routing API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return {
    geometry: data.geometry,
    distance: data.distance,
    duration: data.duration,
  };
}
