const METERS_PER_LAT = 110540;

export function latLngToScene([lat, lng], [originLat, originLng]) {
  const metersPerLng = 111320 * Math.cos((originLat * Math.PI) / 180);
  const x = (lng - originLng) * metersPerLng;
  const z = (lat - originLat) * METERS_PER_LAT;
  return [x, z];
}
