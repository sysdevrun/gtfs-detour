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

  getRoutes() {
    const db = gtfs.getDatabase();
    const stmt = db.prepare(`
      SELECT route_id, route_short_name, route_long_name,
             COALESCE(route_color, '') as route_color,
             COALESCE(route_text_color, '') as route_text_color
      FROM routes
      ORDER BY route_short_name, route_long_name
    `);
    const routes: Array<{
      route_id: string;
      route_short_name: string;
      route_long_name: string;
      route_color: string;
      route_text_color: string;
    }> = [];
    while (stmt.step()) {
      routes.push(stmt.getAsObject() as never);
    }
    stmt.free();
    return routes;
  },

  getTripGroupsForRoute(routeId: string) {
    const db = gtfs.getDatabase();
    const stmt = db.prepare(`
      SELECT direction_id,
             COALESCE(trip_headsign, '') as trip_headsign,
             COALESCE(trip_short_name, '') as trip_short_name,
             COUNT(*) as count
      FROM trips
      WHERE route_id = ?
      GROUP BY direction_id, trip_headsign, trip_short_name
      ORDER BY direction_id, trip_headsign, trip_short_name
    `);
    stmt.bind([routeId]);
    const groups: Array<{
      direction_id: number;
      trip_headsign: string;
      trip_short_name: string;
      count: number;
    }> = [];
    while (stmt.step()) {
      groups.push(stmt.getAsObject() as never);
    }
    stmt.free();
    return groups;
  },

  getTripsForGroup(routeId: string, directionId: number, tripHeadsign: string, tripShortName: string) {
    const db = gtfs.getDatabase();
    const stmt = db.prepare(`
      SELECT t.trip_id, t.trip_short_name, t.direction_id, t.trip_headsign, t.shape_id,
             r.route_short_name, r.route_long_name
      FROM trips t
      JOIN routes r ON t.route_id = r.route_id
      WHERE t.route_id = ?
        AND t.direction_id = ?
        AND COALESCE(t.trip_headsign, '') = ?
        AND COALESCE(t.trip_short_name, '') = ?
      ORDER BY t.trip_id
      LIMIT 50
    `);
    stmt.bind([routeId, directionId, tripHeadsign, tripShortName]);
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
