import { useTranslation } from 'react-i18next';

interface Props {
  segmentDistance: number | null;
  detourDistance: number | null;
}

export function DistanceInfo({ segmentDistance, detourDistance }: Props) {
  const { t } = useTranslation();
  if (segmentDistance === null) return null;

  const net = detourDistance !== null ? detourDistance - segmentDistance : null;

  return (
    <div className="panel distance-info">
      <h3>{t('distance.heading')}</h3>
      <div className="distance-row">
        <span>{t('distance.original')}</span>
        <strong>{t('distance.km', { value: segmentDistance.toFixed(2) })}</strong>
      </div>
      {detourDistance !== null && (
        <>
          <div className="distance-row">
            <span>{t('distance.detour')}</span>
            <strong>{t('distance.km', { value: detourDistance.toFixed(2) })}</strong>
          </div>
          <div className={`distance-row net ${net! > 0 ? 'positive' : 'negative'}`}>
            <span>{t('distance.net')}</span>
            <strong>
              {net! > 0 ? '+' : ''}
              {t('distance.km', { value: net!.toFixed(2) })}
            </strong>
          </div>
        </>
      )}
    </div>
  );
}
