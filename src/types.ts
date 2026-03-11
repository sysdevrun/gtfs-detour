export interface TripInfo {
  trip_id: string;
  trip_short_name: string;
  route_short_name: string;
  route_long_name: string;
  direction_id: number;
  trip_headsign: string;
  shape_id: string;
}

export interface StopInfo {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  stop_sequence: number;
}
