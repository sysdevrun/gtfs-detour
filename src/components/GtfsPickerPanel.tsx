import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Comlink from 'comlink';
import { GtfsSelector, type GtfsSelectionResult } from 'react-gtfs-selector';
import 'react-gtfs-selector/style.css';
import { maybeProxy } from '../lib/proxy';

interface Props {
  onLoading: (label: string | null) => void;
  onLoaded: (feedName: string, url?: string) => void;
  onProgress: (percent: number) => void;
  onReset: () => void;
  worker: {
    loadFromUrl: (url: string, wasmUrl: string, onProgress?: (p: number) => void) => Promise<void>;
    loadFromData: (data: ArrayBuffer, wasmUrl: string, onProgress?: (p: number) => void) => Promise<void>;
  };
  wasmUrl: string;
  loading: boolean;
  feedName: string | null;
  progress: number | null;
}

export function GtfsPickerPanel({ onLoading, onLoaded, onProgress, onReset, worker, wasmUrl, loading, feedName, progress }: Props) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (result: GtfsSelectionResult) => {
    setError(null);
    try {
      const progressProxy = Comlink.proxy((p: number) => onProgress(p));
      if (result.type === 'file') {
        onLoading(result.fileName);
        const buffer = await result.blob.arrayBuffer();
        await worker.loadFromData(buffer, wasmUrl, progressProxy);
        onLoaded(result.fileName);
      } else {
        onLoading(result.title);
        const url = maybeProxy(result.url);
        await worker.loadFromUrl(url, wasmUrl, progressProxy);
        onLoaded(result.title, result.url);
      }
    } catch (err) {
      console.error('Failed to load GTFS:', err);
      setError((err as Error).message);
      onLoading(null);
    }
  };

  if (feedName) {
    return (
      <div className="panel feed-loaded">
        <h3>{t('gtfs.heading')}</h3>
        <div className="feed-name">{feedName}</div>
        <button className="btn-sm" onClick={onReset}>{t('gtfs.changeFeed')}</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel loading-panel">
        <h3>{t('gtfs.headingSelect')}</h3>
        <div className="loading-indicator">
          {t('gtfs.loading')}{progress != null && ` ${Math.round(progress)}%`}
        </div>
        {progress != null && (
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${Math.round(progress)}%` }} />
          </div>
        )}
        <button className="btn-sm" onClick={() => {
          onLoading(null);
        }}>{t('gtfs.cancel')}</button>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>{t('gtfs.headingSelect')}</h3>
      {error && <div className="error-msg">{error}</div>}
      <GtfsSelector onSelect={handleSelect} />
    </div>
  );
}
