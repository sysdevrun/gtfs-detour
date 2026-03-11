import { useState, useEffect, useRef } from 'react';
import type { TripInfo } from '../types';

interface Props {
  worker: {
    getUniqueTripsShortNames: () => Promise<string[]>;
    getTripsByShortName: (name: string) => Promise<TripInfo[]>;
  };
  onTripSelected: (trip: TripInfo) => void;
}

export function TripSearch({ worker, onTripSelected }: Props) {
  const [allNames, setAllNames] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [trips, setTrips] = useState<TripInfo[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    worker.getUniqueTripsShortNames().then(setAllNames);
  }, [worker]);

  useEffect(() => {
    const q = query.toLowerCase();
    const matches = q.length === 0
      ? allNames.slice(0, 20)
      : allNames.filter((n) => n.toLowerCase().includes(q)).slice(0, 20);
    setFiltered(matches);
    setActiveIndex(-1);
  }, [query, allNames]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const selectName = async (name: string) => {
    setSelectedName(name);
    setQuery(name);
    setShowDropdown(false);
    setActiveIndex(-1);
    const matchingTrips = await worker.getTripsByShortName(name);
    setTrips(matchingTrips);
    if (matchingTrips.length === 1) {
      onTripSelected(matchingTrips[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        selectName(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="panel">
      <h3>2. Find Trip</h3>
      <div className="autocomplete">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type trip short name..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
            setSelectedName(null);
            setTrips([]);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {showDropdown && filtered.length > 0 && (
          <ul className="autocomplete-dropdown" ref={listRef}>
            {filtered.map((name, i) => (
              <li
                key={name}
                className={i === activeIndex ? 'active' : ''}
                onMouseDown={() => selectName(name)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedName && trips.length > 1 && (
        <div className="trip-list">
          <p>Multiple trips found — select one:</p>
          {trips.map((t) => (
            <button
              key={t.trip_id}
              className="trip-option"
              onClick={() => onTripSelected(t)}
            >
              <strong>{t.route_short_name}</strong> {t.trip_headsign || t.route_long_name}
              <span className="trip-dir">Dir {t.direction_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
