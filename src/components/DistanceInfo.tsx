interface Props {
  segmentDistance: number | null;
  detourDistance: number | null;
}

export function DistanceInfo({ segmentDistance, detourDistance }: Props) {
  if (segmentDistance === null) return null;

  const net = detourDistance !== null ? detourDistance - segmentDistance : null;

  return (
    <div className="panel distance-info">
      <h3>4. Distances</h3>
      <div className="distance-row">
        <span>Original segment:</span>
        <strong>{segmentDistance.toFixed(2)} km</strong>
      </div>
      {detourDistance !== null && (
        <>
          <div className="distance-row">
            <span>Detour route:</span>
            <strong>{detourDistance.toFixed(2)} km</strong>
          </div>
          <div className={`distance-row net ${net! > 0 ? 'positive' : 'negative'}`}>
            <span>Net difference:</span>
            <strong>
              {net! > 0 ? '+' : ''}
              {net!.toFixed(2)} km
            </strong>
          </div>
        </>
      )}
    </div>
  );
}
