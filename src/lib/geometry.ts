import * as turf from '@turf/turf';

export function sliceShape(
  shapeLine: GeoJSON.Feature<GeoJSON.LineString>,
  startCoord: [number, number], // [lon, lat]
  endCoord: [number, number]
): GeoJSON.Feature<GeoJSON.LineString> {
  const startPt = turf.point(startCoord);
  const endPt = turf.point(endCoord);
  const sliced = turf.lineSlice(startPt, endPt, shapeLine);
  return sliced as GeoJSON.Feature<GeoJSON.LineString>;
}

export function lineLength(line: GeoJSON.Feature<GeoJSON.LineString>): number {
  return turf.length(line, { units: 'kilometers' });
}

export function snapToLine(
  line: GeoJSON.Feature<GeoJSON.LineString>,
  point: [number, number]
): [number, number] {
  const pt = turf.point(point);
  const snapped = turf.nearestPointOnLine(line, pt);
  return snapped.geometry.coordinates as [number, number];
}
