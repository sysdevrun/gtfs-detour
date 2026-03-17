import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';
import type { StopInfo } from '../types';

export const MAP_STYLES = {
  ign: { label: 'IGN', url: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json' },
  enliberte: { label: 'Tuiles en libert\u00e9', url: 'https://tuiles.enliberte.fr/styles/bright.json' },
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

interface Props {
  styleKey: MapStyleKey;
  shapeGeojson: GeoJSON.FeatureCollection | null;
  segmentGeojson: GeoJSON.Feature<GeoJSON.LineString> | null;
  detourGeojson: GeoJSON.Geometry | null;
  startStop: StopInfo | null;
  endStop: StopInfo | null;
  waypoints: [number, number][];
  onMapClick: (lngLat: [number, number]) => void;
  onWaypointDrag: (index: number, lngLat: [number, number]) => void;
}

export function MapView({
  styleKey,
  shapeGeojson,
  segmentGeojson,
  detourGeojson,
  startStop,
  endStop,
  waypoints,
  onMapClick,
  onWaypointDrag,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const waypointMarkersRef = useRef<maplibregl.Marker[]>([]);

  // Register pmtiles protocol once
  useEffect(() => {
    const protocol = new Protocol();
    maplibregl.addProtocol('pmtiles', protocol.tile);
    return () => { maplibregl.removeProtocol('pmtiles'); };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLES[styleKey].url,
      center: [2.35, 46.85],
      zoom: 5,
    });
    map.addControl(new maplibregl.NavigationControl());
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Style change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(MAP_STYLES[styleKey].url);
  }, [styleKey]);

  // Re-add sources/layers after style change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onStyleLoad = () => {
      // Re-add shape
      if (shapeGeojson && !map.getSource('shape')) {
        map.addSource('shape', { type: 'geojson', data: shapeGeojson });
        map.addLayer({
          id: 'shape-line',
          type: 'line',
          source: 'shape',
          paint: { 'line-color': '#4A90D9', 'line-width': 4, 'line-opacity': 0.5 },
        });
      }
      // Re-add segment
      if (segmentGeojson && !map.getSource('segment')) {
        map.addSource('segment', { type: 'geojson', data: segmentGeojson });
        map.addLayer({
          id: 'segment-line',
          type: 'line',
          source: 'segment',
          paint: { 'line-color': '#E74C3C', 'line-width': 6, 'line-opacity': 0.8 },
        });
      }
      // Re-add detour
      if (detourGeojson && !map.getSource('detour')) {
        map.addSource('detour', {
          type: 'geojson',
          data: { type: 'Feature', geometry: detourGeojson, properties: {} },
        });
        map.addLayer({
          id: 'detour-line',
          type: 'line',
          source: 'detour',
          paint: { 'line-color': '#2ECC71', 'line-width': 5, 'line-opacity': 0.8, 'line-dasharray': [2, 2] },
        });
      }
    };

    map.on('style.load', onStyleLoad);
    return () => { map.off('style.load', onStyleLoad); };
  }, [shapeGeojson, segmentGeojson, detourGeojson]);

  // Map click handler
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: maplibregl.MapMouseEvent) => {
      onMapClick([e.lngLat.lng, e.lngLat.lat]);
    };
    map.on('click', handler);
    return () => { map.off('click', handler); };
  }, [onMapClick]);

  // Shape layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onReady = () => {
      if (map.getLayer('shape-line')) map.removeLayer('shape-line');
      if (map.getSource('shape')) map.removeSource('shape');

      if (!shapeGeojson) return;

      map.addSource('shape', { type: 'geojson', data: shapeGeojson });
      map.addLayer({
        id: 'shape-line',
        type: 'line',
        source: 'shape',
        paint: {
          'line-color': '#4A90D9',
          'line-width': 4,
          'line-opacity': 0.5,
        },
      });

      // Fit bounds
      const coords = shapeGeojson.features.flatMap((f) => {
        const geom = f.geometry;
        if (geom.type === 'LineString') return geom.coordinates;
        if (geom.type === 'MultiLineString') return geom.coordinates.flat();
        return [];
      });
      if (coords.length > 0) {
        const bounds = coords.reduce(
          (b, c) => b.extend(c as [number, number]),
          new maplibregl.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number])
        );
        map.fitBounds(bounds, { padding: 60 });
      }
    };

    if (map.isStyleLoaded()) onReady();
    else map.once('style.load', onReady);
  }, [shapeGeojson]);

  // Segment highlight layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('segment-line')) map.removeLayer('segment-line');
    if (map.getSource('segment')) map.removeSource('segment');

    if (!segmentGeojson) return;

    map.addSource('segment', { type: 'geojson', data: segmentGeojson });
    map.addLayer({
      id: 'segment-line',
      type: 'line',
      source: 'segment',
      paint: {
        'line-color': '#E74C3C',
        'line-width': 6,
        'line-opacity': 0.8,
      },
    });
  }, [segmentGeojson]);

  // Detour route layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('detour-line')) map.removeLayer('detour-line');
    if (map.getSource('detour')) map.removeSource('detour');

    if (!detourGeojson) return;

    map.addSource('detour', {
      type: 'geojson',
      data: { type: 'Feature', geometry: detourGeojson, properties: {} },
    });
    map.addLayer({
      id: 'detour-line',
      type: 'line',
      source: 'detour',
      paint: {
        'line-color': '#2ECC71',
        'line-width': 5,
        'line-opacity': 0.8,
        'line-dasharray': [2, 2],
      },
    });
  }, [detourGeojson]);

  // Stop markers
  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const map = mapRef.current;
    if (!map) return;

    const addStopMarker = (stop: StopInfo, color: string, label: string) => {
      const el = document.createElement('div');
      el.className = 'stop-marker';
      el.style.backgroundColor = color;
      el.title = `${label}: ${stop.stop_name}`;
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([stop.stop_lon, stop.stop_lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setText(`${label}: ${stop.stop_name}`))
        .addTo(map);
      markersRef.current.push(marker);
    };

    if (startStop) addStopMarker(startStop, '#E74C3C', t('map.detourStart'));
    if (endStop) addStopMarker(endStop, '#E67E22', t('map.detourEnd'));
  }, [startStop, endStop, t]);

  // Waypoint markers
  useEffect(() => {
    waypointMarkersRef.current.forEach((m) => m.remove());
    waypointMarkersRef.current = [];

    const map = mapRef.current;
    if (!map) return;

    waypoints.forEach((wp, i) => {
      const el = document.createElement('div');
      el.className = 'waypoint-marker';
      el.textContent = String(i + 1);
      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(wp)
        .addTo(map);
      marker.on('dragend', () => {
        const pos = marker.getLngLat();
        onWaypointDrag(i, [pos.lng, pos.lat]);
      });
      waypointMarkersRef.current.push(marker);
    });
  }, [waypoints, onWaypointDrag]);

  return <div ref={containerRef} className="map-container" />;
}
