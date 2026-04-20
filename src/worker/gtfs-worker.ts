import * as Comlink from 'comlink';
import { GtfsSqlJs } from 'gtfs-sqljs';
import { createSqlJsAdapter } from 'gtfs-sqljs/adapters/sql-js';

let gtfs: GtfsSqlJs;

const api = {
  async loadFromUrl(zipUrl: string, wasmUrl: string, onProgress?: (p: number) => void) {
    const adapter = await createSqlJsAdapter({ locateFile: () => wasmUrl });
    gtfs = await GtfsSqlJs.fromZip(zipUrl, {
      adapter,
      onProgress: onProgress ? Comlink.proxy((info: { percentComplete: number }) => onProgress(info.percentComplete)) : undefined,
    });
  },

  async loadFromData(zipData: ArrayBuffer, wasmUrl: string, onProgress?: (p: number) => void) {
    const adapter = await createSqlJsAdapter({ locateFile: () => wasmUrl });
    gtfs = await GtfsSqlJs.fromZipData(new Uint8Array(zipData), {
      adapter,
      onProgress: onProgress ? Comlink.proxy((info: { percentComplete: number }) => onProgress(info.percentComplete)) : undefined,
    });
  },

  async getRoutes() {
    const db = gtfs.getDatabase();
    const stmt = await db.prepare(`
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
    while (await stmt.step()) {
      routes.push(await stmt.getAsObject() as never);
    }
    await stmt.free();
    return routes;
  },

  async getTripGroupsForRoute(routeId: string) {
    const db = gtfs.getDatabase();
    const stmt = await db.prepare(`
      SELECT direction_id,
             COALESCE(trip_headsign, '') as trip_headsign,
             COALESCE(trip_short_name, '') as trip_short_name,
             COUNT(*) as count
      FROM trips
      WHERE route_id = ?
      GROUP BY direction_id, trip_headsign, trip_short_name
      ORDER BY direction_id, trip_headsign, trip_short_name
    `);
    await stmt.bind([routeId]);
    const groups: Array<{
      direction_id: number;
      trip_headsign: string;
      trip_short_name: string;
      count: number;
    }> = [];
    while (await stmt.step()) {
      groups.push(await stmt.getAsObject() as never);
    }
    await stmt.free();
    return groups;
  },

  async getTripsForGroup(routeId: string, directionId: number, tripHeadsign: string, tripShortName: string) {
    const db = gtfs.getDatabase();
    const stmt = await db.prepare(`
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
    await stmt.bind([routeId, directionId, tripHeadsign, tripShortName]);
    const trips: Array<{
      trip_id: string;
      trip_short_name: string;
      direction_id: number;
      trip_headsign: string;
      shape_id: string;
      route_short_name: string;
      route_long_name: string;
    }> = [];
    while (await stmt.step()) {
      trips.push(await stmt.getAsObject() as never);
    }
    await stmt.free();
    return trips;
  },

  async getStopTimesForTrip(tripId: string) {
    const db = gtfs.getDatabase();
    const stmt = await db.prepare(`
      SELECT st.stop_id, st.stop_sequence, s.stop_name, s.stop_lat, s.stop_lon
      FROM stop_times st
      JOIN stops s ON st.stop_id = s.stop_id
      WHERE st.trip_id = ?
      ORDER BY st.stop_sequence
    `);
    await stmt.bind([tripId]);
    const stops: Array<{
      stop_id: string;
      stop_name: string;
      stop_lat: number;
      stop_lon: number;
      stop_sequence: number;
    }> = [];
    while (await stmt.step()) {
      stops.push(await stmt.getAsObject() as never);
    }
    await stmt.free();
    return stops;
  },

  getShapeGeojson(shapeId: string) {
    return gtfs.getShapesToGeojson({ shapeId });
  },

  async close() {
    if (gtfs) await gtfs.close();
  },
};

export type GtfsWorkerApi = typeof api;

Comlink.expose(api);
