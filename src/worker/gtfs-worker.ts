import * as Comlink from 'comlink';
// @ts-expect-error no type declarations for sql.js
import initSqlJs from 'sql.js';
import { GtfsSqlJs } from 'gtfs-sqljs';

let gtfs: GtfsSqlJs;

const api = {
  async loadFromUrl(zipUrl: string, wasmUrl: string, onProgress?: (p: number) => void) {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    gtfs = await GtfsSqlJs.fromZip(zipUrl, {
      SQL,
      onProgress: onProgress ? Comlink.proxy((info: { percentComplete: number }) => onProgress(info.percentComplete)) : undefined,
    });
  },

  async loadFromData(zipData: ArrayBuffer, wasmUrl: string) {
    const SQL = await initSqlJs({ locateFile: () => wasmUrl });
    gtfs = await GtfsSqlJs.fromZipData(new Uint8Array(zipData), { SQL });
  },

  getUniqueTripsShortNames(): string[] {
    const db = gtfs.getDatabase();
    const stmt = db.prepare('SELECT DISTINCT trip_short_name FROM trips WHERE trip_short_name IS NOT NULL AND trip_short_name != \'\' ORDER BY trip_short_name');
    const names: string[] = [];
    while (stmt.step()) {
      names.push(stmt.getAsObject().trip_short_name as string);
    }
    stmt.free();
    return names;
  },

  getTripsByShortName(shortName: string) {
    const db = gtfs.getDatabase();
    const stmt = db.prepare(`
      SELECT t.trip_id, t.trip_short_name, t.direction_id, t.trip_headsign, t.shape_id,
             r.route_short_name, r.route_long_name
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      WHERE t.trip_short_name = ?
      LIMIT 50
    `);
    stmt.bind([shortName]);
    const trips: Array<{
      trip_id: string;
      trip_short_name: string;
      direction_id: number;
      trip_headsign: string;
      shape_id: string;
      route_short_name: string;
      route_long_name: string;
    }> = [];
    while (stmt.step()) {
      trips.push(stmt.getAsObject() as never);
    }
    stmt.free();
    return trips;
  },

  getStopTimesForTrip(tripId: string) {
    const db = gtfs.getDatabase();
    const stmt = db.prepare(`
      SELECT st.stop_id, st.stop_sequence, s.stop_name, s.stop_lat, s.stop_lon
      FROM stop_times st
      JOIN stops s ON st.stop_id = s.stop_id
      WHERE st.trip_id = ?
      ORDER BY st.stop_sequence
    `);
    stmt.bind([tripId]);
    const stops: Array<{
      stop_id: string;
      stop_name: string;
      stop_lat: number;
      stop_lon: number;
      stop_sequence: number;
    }> = [];
    while (stmt.step()) {
      stops.push(stmt.getAsObject() as never);
    }
    stmt.free();
    return stops;
  },

  getShapeGeojson(shapeId: string) {
    return gtfs.getShapesToGeojson({ shapeId });
  },

  close() {
    if (gtfs) gtfs.close();
  },
};

export type GtfsWorkerApi = typeof api;

Comlink.expose(api);
