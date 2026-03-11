interface Props {
  waypoints: [number, number][];
  onClearWaypoints: () => void;
  onRemoveWaypoint: (index: number) => void;
  onComputeRoute: () => void;
  computing: boolean;
  hasStartEnd: boolean;
}

export function DetourControls({
  waypoints,
  onClearWaypoints,
  onRemoveWaypoint,
  onComputeRoute,
  computing,
  hasStartEnd,
}: Props) {
  if (!hasStartEnd) return null;

  return (
    <div className="panel">
      <h3>5. Alternative Route</h3>
      <p className="hint">Click on the map to add waypoints for the detour route.</p>
      {waypoints.length > 0 && (
        <div className="waypoint-list">
          {waypoints.map((wp, i) => (
            <div key={i} className="waypoint-item">
              <span>
                WP{i + 1}: {wp[1].toFixed(5)}, {wp[0].toFixed(5)}
              </span>
              <button className="btn-sm" onClick={() => onRemoveWaypoint(i)}>
                &times;
              </button>
            </div>
          ))}
          <button className="btn-sm" onClick={onClearWaypoints}>
            Clear all
          </button>
        </div>
      )}
      <button className="btn-primary" onClick={onComputeRoute} disabled={computing}>
        {computing ? 'Computing...' : 'Compute detour route'}
      </button>
    </div>
  );
}
