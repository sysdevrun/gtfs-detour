import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { RouteInfo, TripGroup, TripInfo } from '../types';

interface Props {
  worker: {
    getRoutes: () => Promise<RouteInfo[]>;
    getTripGroupsForRoute: (routeId: string) => Promise<TripGroup[]>;
    getTripsForGroup: (routeId: string, directionId: number, tripHeadsign: string, tripShortName: string) => Promise<TripInfo[]>;
  };
  onTripSelected: (trip: TripInfo) => void;
}

function normalizeColor(color: string): string {
  if (!color) return '';
  return color.startsWith('#') ? color : '#' + color;
}

function contrastColor(bgColor: string, textColor: string): string {
  if (textColor) return normalizeColor(textColor);
  if (!bgColor) return '#333';
  const hex = bgColor.replace('#', '');
  if (hex.length !== 6) return '#333';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000' : '#fff';
}

export function TripSelector({ worker, onTripSelected }: Props) {
  const { t } = useTranslation();
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteInfo | null>(null);
  const [tripGroups, setTripGroups] = useState<TripGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TripGroup | null>(null);
  const [trips, setTrips] = useState<TripInfo[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    worker.getRoutes().then(setRoutes);
  }, [worker]);

  // Load trip groups when route selected
  useEffect(() => {
    if (!selectedRoute) {
      setTripGroups([]);
      setSelectedGroup(null);
      setTrips([]);
      return;
    }
    worker.getTripGroupsForRoute(selectedRoute.route_id).then((groups) => {
      setTripGroups(groups);
      setSelectedGroup(null);
      setTrips([]);
    });
  }, [selectedRoute, worker]);

  // Load trips when group selected
  useEffect(() => {
    if (!selectedRoute || !selectedGroup) {
      setTrips([]);
      return;
    }
    worker.getTripsForGroup(
      selectedRoute.route_id,
      selectedGroup.direction_id,
      selectedGroup.trip_headsign,
      selectedGroup.trip_short_name
    ).then((t) => {
      setTrips(t);
      if (t.length === 1) {
        onTripSelected(t[0]);
      }
    });
  }, [selectedRoute, selectedGroup, worker, onTripSelected]);

  const filteredRoutes = filter
    ? routes.filter((r) => {
        const q = filter.toLowerCase();
        return r.route_short_name.toLowerCase().includes(q)
          || r.route_long_name.toLowerCase().includes(q);
      })
    : routes;

  // Group by direction
  const outward = tripGroups.filter((g) => g.direction_id === 0);
  const inward = tripGroups.filter((g) => g.direction_id === 1);

  return (
    <div className="panel">
      <h3>{t('trip.heading')}</h3>

      {/* Step 1: Route selection */}
      {!selectedRoute && (
        <>
          <input
            type="text"
            className="route-filter"
            placeholder={t('trip.filterPlaceholder')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="route-list">
            {filteredRoutes.map((r) => {
              const bg = normalizeColor(r.route_color);
              const fg = contrastColor(bg, r.route_text_color);
              return (
                <button
                  key={r.route_id}
                  className="route-item"
                  onClick={() => { setSelectedRoute(r); setFilter(''); }}
                >
                  <span
                    className="route-badge"
                    style={bg ? { backgroundColor: bg, color: fg } : undefined}
                  >
                    {r.route_short_name || '?'}
                  </span>
                  <span className="route-name">{r.route_long_name}</span>
                </button>
              );
            })}
            {filteredRoutes.length === 0 && (
              <div className="no-results">{t('trip.noRoutes')}</div>
            )}
          </div>
        </>
      )}

      {/* Selected route header */}
      {selectedRoute && (
        <div className="selected-route">
          <span
            className="route-badge"
            style={normalizeColor(selectedRoute.route_color) ? {
              backgroundColor: normalizeColor(selectedRoute.route_color),
              color: contrastColor(normalizeColor(selectedRoute.route_color), selectedRoute.route_text_color),
            } : undefined}
          >
            {selectedRoute.route_short_name || '?'}
          </span>
          <span className="route-name">{selectedRoute.route_long_name}</span>
          <button className="btn-sm" onClick={() => { setSelectedRoute(null); setSelectedGroup(null); setTrips([]); }}>
            {t('trip.change')}
          </button>
        </div>
      )}

      {/* Step 2: Direction / group selection */}
      {selectedRoute && !selectedGroup && tripGroups.length > 0 && (
        <div className="direction-groups">
          {outward.length > 0 && (
            <div className="direction-section">
              <h4>{t('trip.outward')}</h4>
              {outward.map((g, i) => (
                <button
                  key={`out-${i}`}
                  className="trip-option"
                  onClick={() => setSelectedGroup(g)}
                >
                  {g.trip_short_name && <strong>{g.trip_short_name} </strong>}
                  {g.trip_headsign || t('trip.noHeadsign')}
                  <span className="trip-count">{t('trip.tripCount', { count: g.count })}</span>
                </button>
              ))}
            </div>
          )}
          {inward.length > 0 && (
            <div className="direction-section">
              <h4>{t('trip.inward')}</h4>
              {inward.map((g, i) => (
                <button
                  key={`in-${i}`}
                  className="trip-option"
                  onClick={() => setSelectedGroup(g)}
                >
                  {g.trip_short_name && <strong>{g.trip_short_name} </strong>}
                  {g.trip_headsign || t('trip.noHeadsign')}
                  <span className="trip-count">{t('trip.tripCount', { count: g.count })}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected group header */}
      {selectedGroup && (
        <div className="selected-group">
          <span>
            {t('trip.dirPrefix', { id: selectedGroup.direction_id })} {selectedGroup.trip_short_name && <strong>{selectedGroup.trip_short_name} </strong>}
            {selectedGroup.trip_headsign || t('trip.noHeadsign')}
          </span>
          <button className="btn-sm" onClick={() => { setSelectedGroup(null); setTrips([]); }}>
            {t('trip.change')}
          </button>
        </div>
      )}

      {/* Step 3: Trip selection */}
      {selectedGroup && trips.length > 1 && (
        <div className="trip-list">
          <p>{t('trip.selectTrip')}</p>
          {trips.map((trip) => (
            <button
              key={trip.trip_id}
              className="trip-option"
              onClick={() => onTripSelected(trip)}
            >
              <span className="trip-id">{trip.trip_id}</span>
              {trip.shape_id && <span className="trip-shape">{t('trip.shape', { id: trip.shape_id })}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
