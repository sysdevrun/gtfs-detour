import { useState } from 'react';
import { GtfsSelector, type GtfsSelectionResult } from 'react-gtfs-selector';
import 'react-gtfs-selector/style.css';
import { maybeProxy } from '../lib/proxy';

interface Props {
  onLoading: (label: string | null) => void;
  onLoaded: (feedName: string) => void;
  onReset: () => void;
  worker: {
    loadFromUrl: (url: string, wasmUrl: string) => Promise<void>;
    loadFromData: (data: ArrayBuffer, wasmUrl: string) => Promise<void>;
  };
  wasmUrl: string;
  loading: boolean;
  feedName: string | null;
}

export function GtfsPickerPanel({ onLoading, onLoaded, onReset, worker, wasmUrl, loading, feedName }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (result: GtfsSelectionResult) => {
    setError(null);
    try {
      if (result.type === 'file') {
        onLoading(result.fileName);
        const buffer = await result.blob.arrayBuffer();
        await worker.loadFromData(buffer, wasmUrl);
        onLoaded(result.fileName);
      } else {
        onLoading(result.title);
        const url = maybeProxy(result.url);
        await worker.loadFromUrl(url, wasmUrl);
        onLoaded(result.title);
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
        <h3>1. GTFS Feed</h3>
        <div className="feed-name">{feedName}</div>
        <button className="btn-sm" onClick={onReset}>Change feed</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel loading-panel">
        <h3>1. Select GTFS Feed</h3>
        <div className="loading-indicator">Loading...</div>
        <button className="btn-sm" onClick={() => {
          onLoading(null);
        }}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3>1. Select GTFS Feed</h3>
      {error && <div className="error-msg">{error}</div>}
      <GtfsSelector onSelect={handleSelect} />
    </div>
  );
}
