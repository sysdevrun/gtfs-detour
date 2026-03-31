import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as Comlink from 'comlink';
import type { GtfsWorkerApi } from './worker/gtfs-worker';
import { GtfsPickerPanel } from './components/GtfsPickerPanel';
import { TripSelector } from './components/TripSelector';
import { StopSelector } from './components/StopSelector';
import { DetourControls } from './components/DetourControls';
import { DistanceInfo } from './components/DistanceInfo';
import { MapView, MAP_STYLES, type MapStyleKey } from './map/MapView';
import { sliceShape, lineLength } from './lib/geometry';
import { computeItinerary } from './lib/routing';
import { maybeProxy } from './lib/proxy';
import { parseHash, updateHash } from './lib/hash-config';
import type { TripInfo, StopInfo } from './types';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

function App() {
  const { t, i18n } = useTranslation();
  const initialConfig = useMemo(() => parseHash(), []);

  const workerRef = useRef<Comlink.Remote<GtfsWorkerApi> | null>(null);
  const [workerReady, setWorkerReady] = useState(false);
  const [gtfsLoading, setGtfsLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [feedName, setFeedName] = useState<string | null>(null);

  const [selectedTrip, setSelectedTrip] = useState<TripInfo | null>(null);
  const [stops, setStops] = useState<StopInfo[]>([]);
  const [shapeGeojson, setShapeGeojson] = useState<GeoJSON.FeatureCollection | null>(null);
  const [shapeLine, setShapeLine] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

  const [startStop, setStartStop] = useState<StopInfo | null>(null);
  const [endStop, setEndStop] = useState<StopInfo | null>(null);
  const [segmentGeojson, setSegmentGeojson] = useState<GeoJSON.Feature<GeoJSON.LineString> | null>(null);
  const [segmentDistance, setSegmentDistance] = useState<number | null>(null);

  const [waypoints, setWaypoints] = useState<[number, number][]>([]);
  const [detourGeojson, setDetourGeojson] = useState<GeoJSON.Geometry | null>(null);
  const [detourDistance, setDetourDistance] = useState<number | null>(null);
  const [computing, setComputing] = useState(false);

  const [mapStyle, setMapStyleState] = useState<MapStyleKey>(
    initialConfig.tiles && initialConfig.tiles in MAP_STYLES
      ? initialConfig.tiles as MapStyleKey
      : 'ign'
  );

  // Init worker
  useEffect(() => {
    const w = new Worker(new URL('./worker/gtfs-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = Comlink.wrap<GtfsWorkerApi>(w);
    setWorkerReady(true);
    return () => { w.terminate(); workerRef.current = null; setWorkerReady(false); };
  }, []);

  // Auto-load GTFS from URL hash
  useEffect(() => {
    if (!workerReady || !workerRef.current || !initialConfig.gtfs) return;
    setGtfsLoading(true);
    setLoadProgress(null);
    const proxiedUrl = maybeProxy(initialConfig.gtfs);
    workerRef.current.loadFromUrl(proxiedUrl, sqlWasmUrl, Comlink.proxy((p: number) => setLoadProgress(p)))
      .then(() => {
        setGtfsLoading(false);
        setLoadProgress(null);
        setFeedName(initialConfig.title || initialConfig.gtfs!);
      })
      .catch((err: unknown) => {
        console.error('Failed to auto-load GTFS from hash:', err);
        setGtfsLoading(false);
        setLoadProgress(null);
        updateHash({ gtfs: undefined, title: undefined });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerReady]);

  const setMapStyle = useCallback((key: MapStyleKey) => {
    setMapStyleState(key);
    updateHash({ tiles: key === 'ign' ? undefined : key });
  }, []);

  // When trip selected, load shape + stops
  useEffect(() => {
    if (!selectedTrip || !workerRef.current) return;
    const worker = workerRef.current;

    (async () => {
      const [geojson, tripStops] = await Promise.all([
        worker.getShapeGeojson(selectedTrip.shape_id),
        worker.getStopTimesForTrip(selectedTrip.trip_id),
      ]);
      setShapeGeojson(geojson as GeoJSON.FeatureCollection);
      setStops(tripStops);

      const lineFeature = (geojson as GeoJSON.FeatureCollection).features.find(
        (f) => f.geometry.type === 'LineString'
      ) as GeoJSON.Feature<GeoJSON.LineString> | undefined;
      setShapeLine(lineFeature ?? null);

      setStartStop(null);
      setEndStop(null);
      setSegmentGeojson(null);
      setSegmentDistance(null);
      setWaypoints([]);
      setDetourGeojson(null);
      setDetourDistance(null);
    })();
  }, [selectedTrip]);

  // Compute segment when both stops selected
  useEffect(() => {
    if (!startStop || !endStop || !shapeLine) {
      setSegmentGeojson(null);
      setSegmentDistance(null);
      return;
    }
    const segment = sliceShape(
      shapeLine,
      [startStop.stop_lon, startStop.stop_lat],
      [endStop.stop_lon, endStop.stop_lat]
    );
    setSegmentGeojson(segment);
    setSegmentDistance(lineLength(segment));
    setWaypoints([]);
    setDetourGeojson(null);
    setDetourDistance(null);
  }, [startStop, endStop, shapeLine]);

  const handleMapClick = useCallback(
    (lngLat: [number, number]) => {
      if (!startStop || !endStop) return;
      setWaypoints((prev) => [...prev, lngLat]);
    },
    [startStop, endStop]
  );

  const handleWaypointDrag = useCallback((index: number, lngLat: [number, number]) => {
    setWaypoints((prev) => prev.map((wp, i) => (i === index ? lngLat : wp)));
  }, []);

  const handleComputeRoute = async () => {
    if (!startStop || !endStop) return;
    setComputing(true);
    try {
      const result = await computeItinerary(
        [startStop.stop_lon, startStop.stop_lat],
        [endStop.stop_lon, endStop.stop_lat],
        waypoints
      );
      setDetourGeojson(result.geometry);
      setDetourDistance(result.distance);
    } catch (err) {
      console.error('Routing error:', err);
      alert(t('routingFailed', { message: (err as Error).message }));
    } finally {
      setComputing(false);
    }
  };

  const handleGtfsReset = () => {
    updateHash({ gtfs: undefined, title: undefined });
    setFeedName(null);
    setGtfsLoading(false);
    setLoadProgress(null);
    setSelectedTrip(null);
    setStops([]);
    setShapeGeojson(null);
    setShapeLine(null);
    setStartStop(null);
    setEndStop(null);
    setSegmentGeojson(null);
    setSegmentDistance(null);
    setWaypoints([]);
    setDetourGeojson(null);
    setDetourDistance(null);
    // Re-create worker to get a fresh gtfs-sqljs instance
    if (workerRef.current) {
      const w = new Worker(new URL('./worker/gtfs-worker.ts', import.meta.url), { type: 'module' });
      workerRef.current = Comlink.wrap<GtfsWorkerApi>(w);
    }
  };

  useEffect(() => {
    const parts = [t('appTitle')];
    if (feedName) parts.push(feedName);
    if (selectedTrip) {
      const tripParts = [selectedTrip.route_short_name, selectedTrip.trip_short_name].filter(Boolean);
      if (tripParts.length > 0) parts.push(tripParts.join(' — '));
    }
    document.title = parts.join(' · ');
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language, feedName, selectedTrip]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebarOnMobile = useCallback(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleTripSelected = useCallback((trip: TripInfo) => {
    setSelectedTrip(trip);
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const worker = workerReady ? workerRef.current : null;

  return (
    <div className="app-layout">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((s) => !s)}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? '\u2715' : '\u2630'}
      </button>
      <div
        className={`sidebar-backdrop${sidebarOpen ? ' sidebar-backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar${sidebarOpen ? ' sidebar--open' : ''}`}>
        <h2>{t('appTitle')}</h2>

        {worker && (
          <GtfsPickerPanel
            worker={worker}
            wasmUrl={sqlWasmUrl}
            onLoading={(label) => {
              setGtfsLoading(!!label);
              if (!label) setLoadProgress(null);
            }}
            onLoaded={(name, url) => {
              setGtfsLoading(false);
              setLoadProgress(null);
              setFeedName(name);
              if (url) {
                updateHash({ gtfs: url, title: name });
              } else {
                updateHash({ gtfs: undefined, title: undefined });
              }
            }}
            onProgress={setLoadProgress}
            onReset={handleGtfsReset}
            loading={gtfsLoading}
            feedName={feedName}
            progress={loadProgress}
          />
        )}

        {feedName && worker && (
          <TripSelector worker={worker} onTripSelected={handleTripSelected} />
        )}

        {selectedTrip && (
          <StopSelector
            stops={stops}
            startStop={startStop}
            endStop={endStop}
            onStartChange={(s) => {
              setStartStop(s);
              setEndStop(null);
            }}
            onEndChange={(s) => { setEndStop(s); closeSidebarOnMobile(); }}
          />
        )}

        <DistanceInfo segmentDistance={segmentDistance} detourDistance={detourDistance} />

        <DetourControls
          waypoints={waypoints}
          onClearWaypoints={() => setWaypoints([])}
          onRemoveWaypoint={(i) => setWaypoints((prev) => prev.filter((_, j) => j !== i))}
          onComputeRoute={handleComputeRoute}
          computing={computing}
          hasStartEnd={!!startStop && !!endStop}
        />

        <div className="panel map-style-panel">
          <label>
            {t('mapStyle')}
            <select value={mapStyle} onChange={(e) => setMapStyle(e.target.value as MapStyleKey)}>
              {Object.entries(MAP_STYLES).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </aside>

      <MapView
        styleKey={mapStyle}
        shapeGeojson={shapeGeojson}
        segmentGeojson={segmentGeojson}
        detourGeojson={detourGeojson}
        startStop={startStop}
        endStop={endStop}
        waypoints={waypoints}
        onMapClick={handleMapClick}
        onWaypointDrag={handleWaypointDrag}
      />
    </div>
  );
}

export default App;
