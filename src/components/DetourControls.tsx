import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  if (!hasStartEnd) return null;

  return (
    <div className="panel">
      <h3>{t('detour.heading')}</h3>
      <p className="hint">{t('detour.hint')}</p>
      {waypoints.length > 0 && (
        <div className="waypoint-list">
          {waypoints.map((wp, i) => (
            <div key={i} className="waypoint-item">
              <span>
                {t('detour.wpLabel', { index: i + 1 })}: {wp[1].toFixed(5)}, {wp[0].toFixed(5)}
              </span>
              <button className="btn-sm" onClick={() => onRemoveWaypoint(i)}>
                &times;
              </button>
            </div>
          ))}
          <button className="btn-sm" onClick={onClearWaypoints}>
            {t('detour.clearAll')}
          </button>
        </div>
      )}
      <button className="btn-primary" onClick={onComputeRoute} disabled={computing}>
        {computing ? t('detour.computing') : t('detour.compute')}
      </button>
    </div>
  );
}
