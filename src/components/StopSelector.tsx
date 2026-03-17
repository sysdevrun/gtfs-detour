import { useTranslation } from 'react-i18next';
import type { StopInfo } from '../types';

interface Props {
  stops: StopInfo[];
  startStop: StopInfo | null;
  endStop: StopInfo | null;
  onStartChange: (stop: StopInfo | null) => void;
  onEndChange: (stop: StopInfo | null) => void;
}

export function StopSelector({ stops, startStop, endStop, onStartChange, onEndChange }: Props) {
  const { t } = useTranslation();
  if (stops.length === 0) return null;

  return (
    <div className="panel">
      <h3>{t('stops.heading')}</h3>
      <label>
        {t('stops.startLabel')}
        <select
          value={startStop?.stop_id ?? ''}
          onChange={(e) => {
            const stop = stops.find((s) => s.stop_id === e.target.value) ?? null;
            onStartChange(stop);
          }}
        >
          <option value="">{t('stops.selectStart')}</option>
          {stops.map((s) => (
            <option key={`start-${s.stop_id}-${s.stop_sequence}`} value={s.stop_id}>
              {s.stop_sequence}. {s.stop_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {t('stops.endLabel')}
        <select
          value={endStop?.stop_id ?? ''}
          onChange={(e) => {
            const stop = stops.find((s) => s.stop_id === e.target.value) ?? null;
            onEndChange(stop);
          }}
        >
          <option value="">{t('stops.selectEnd')}</option>
          {stops
            .filter((s) => !startStop || s.stop_sequence > startStop.stop_sequence)
            .map((s) => (
              <option key={`end-${s.stop_id}-${s.stop_sequence}`} value={s.stop_id}>
                {s.stop_sequence}. {s.stop_name}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
