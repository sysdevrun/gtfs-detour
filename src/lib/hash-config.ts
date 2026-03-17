/**
 * URL hash-based configuration persistence.
 * Format: #gtfs=https%3A%2F%2F...&title=Mon+GTFS&tiles=enliberte
 */

export interface HashConfig {
  gtfs?: string;   // original (non-proxied) GTFS feed URL
  title?: string;  // feed display name
  tiles?: string;  // map tile style key
}

const KNOWN_KEYS: (keyof HashConfig)[] = ['gtfs', 'title', 'tiles'];

/** Parse window.location.hash into a HashConfig */
export function parseHash(): HashConfig {
  const raw = window.location.hash.slice(1);
  if (!raw) return {};
  const params = new URLSearchParams(raw);
  const config: HashConfig = {};
  for (const key of KNOWN_KEYS) {
    const val = params.get(key);
    if (val) config[key] = val;
  }
  return config;
}

/** Update hash config by merging with current values. Pass undefined to remove a key. */
export function updateHash(updates: Partial<Record<keyof HashConfig, string | undefined>>): void {
  const current = parseHash();
  const merged = { ...current };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      delete merged[key as keyof HashConfig];
    } else {
      merged[key as keyof HashConfig] = value;
    }
  }
  const params = new URLSearchParams();
  for (const key of KNOWN_KEYS) {
    if (merged[key]) {
      params.set(key, merged[key]);
    }
  }
  const str = params.toString();
  window.history.replaceState(null, '', str ? `#${str}` : window.location.pathname + window.location.search);
}
