// src/utils/api.js
import mbxClient from '@mapbox/mapbox-sdk';
import geocoding from '@mapbox/mapbox-sdk/services/geocoding';
import directionsService from '@mapbox/mapbox-sdk/services/directions';
import axios from 'axios';

// initialize the Mapbox SDK client
const baseClient       = mbxClient({ accessToken: process.env.REACT_APP_MAPBOX_TOKEN });
const geocodingClient  = geocoding(baseClient);
const directionsClient = directionsService(baseClient);

// --- small in-memory cache for charger lookups ---
const _stationCache = new Map();

// --- sleep helper for throttling & back-off ---
function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Turn a place name (e.g. "Austin, TX") into a full GeoJSON feature.
 */
export async function geocode(place) {
  const res = await geocodingClient
    .forwardGeocode({
      query: place,
      limit: 1,
      types: ['place','region','locality']
    })
    .send();

  if (!res.body.features.length) {
    throw new Error(`No geocoding result for “${place}”`);
  }

  // return the entire feature (with .center and .context)
  return res.body.features[0];
}

/**
 * Fetch a driving route between two coords. Returns a GeoJSON LineString.
 */
export async function getRouteGeoJSON(startCoord, endCoord) {
  const res = await directionsClient
    .getDirections({
      profile: 'driving',
      waypoints: [
        { coordinates: startCoord },
        { coordinates: endCoord }
      ],
      geometries: 'geojson'
    })
    .send();

  return res.body.routes[0].geometry;
}

/**
 * Query Open Charge Map for stations near a point.
 * Uses a CRA proxy at /ocm to avoid CORS, with simple throttling, caching, and retry.
 *
 * @param {number} lat          latitude
 * @param {number} lon          longitude
 * @param {number} radiusMeters search radius in meters (default 5000m)
 * @returns {Promise<Array>}    array of POIs
 */
export async function findChargingStations(lat, lon, radiusMeters = 5000) {
  // cache key normalized to 4 decimal places
  const key = `${lat.toFixed(4)},${lon.toFixed(4)},${radiusMeters}`;
  if (_stationCache.has(key)) {
    return _stationCache.get(key);
  }

  // throttle: max ~4 calls/sec
  await _sleep(250);

  const fetchPOIs = async () => {
    const resp = await axios.get('/ocm/v3/poi/', {
      params: {
        key: process.env.REACT_APP_CHARGE_API_KEY,
        latitude: lat,
        longitude: lon,
        distance: radiusMeters / 1000,
        distanceunit: 'KM'
      }
    });
    return resp.data;
  };

  try {
    const data = await fetchPOIs();
    _stationCache.set(key, data);
    return data;

  } catch (err) {
    // on rate-limit, back off and retry once
    if (err.response?.status === 429) {
      console.warn('OCM 429: backing off 1s before retry');
      await _sleep(1000);
      const data = await fetchPOIs();
      _stationCache.set(key, data);
      return data;
    }
    // otherwise rethrow
    throw err;
  }
}

/**
 * Multi-stop driving route: returns a single LineString for all waypoints.
 */
export async function getMultiRouteGeoJSON(coordsArray) {
  // coordsArray: [ [lng,lat], [lng,lat], … ]
  const res = await directionsClient
    .getDirections({
      profile: 'driving',
      waypoints: coordsArray.map(c => ({ coordinates: c })),
      geometries: 'geojson'
    })
    .send();

  return res.body.routes[0].geometry;
}
