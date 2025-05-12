// src/components/MapView.jsx
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { geocode, getRouteWithSteps, getRouteGeoJSON, findChargingStations } from '../utils/api';
import length from '@turf/length';
import along from '@turf/along';



// just under your imports
function makeBatteryElement(iconUrl) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '32px',
    height: '32px',
    backgroundImage: `url(${iconUrl})`,   // ← backticks here!
    backgroundSize:   'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    cursor: 'pointer'
  });
  return el;
}

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export default function MapView({ tripData, onError, onRoutePlotted }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  // 1) Initialize map once
  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-98.5795, 39.8283],
      zoom: 3,
    });
  }, []);

  // 2) Redraw when tripData changes
  useEffect(() => {
    if (!map.current || !tripData) return;

    (async () => {
      // --- clean up old markers & segments ---
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (map.current.getLayer('segments')) {
        map.current.removeLayer('segments');
        map.current.removeSource('segments');
      }

      // a) Geocode
      const startFeat = await geocode(tripData.start);
      const endFeat   = await geocode(tripData.end);
      const startCoord = startFeat.center;
      const endCoord   = endFeat.center;


    const startMarker = new mapboxgl.Marker({ color: '#e67e22' })
      .setLngLat(startCoord)
      .setPopup(new mapboxgl.Popup()
        .setText(`Start: ${tripData.start}`)   // ← and here
      )
      .addTo(map.current);
       
      markersRef.current.push(startMarker);


      const endMarker = new mapboxgl.Marker({ color: '#e67e22' })
        .setLngLat(endCoord)
        .setPopup(new mapboxgl.Popup()
          .setText(`End: ${tripData.end}`)       // ← and here
        )
        .addTo(map.current);

      markersRef.current.push(endMarker);



      // b) Country‐check: only allow U.S. cities
      const getCountry = feat =>
        feat.context.find(c => c.id.startsWith('country'));
      const startCountry = getCountry(startFeat);
      const endCountry   = getCountry(endFeat);
 
      if (!startCountry || startCountry.short_code !== 'us') {
        onError('Start location must be in the United States.');
        return;
      }
      if (!endCountry || endCountry.short_code !== 'us') {
        onError('End location must be in the United States.');
        return;
      }
      // clear any previous error
      onError('');


      // c) Draw grey “overall” route
      const route = await getRouteWithSteps(startCoord, endCoord);
      const overall = route.geometry;            // the LineString
      const steps   = route.legs[0].steps;        // your turn-by-turn array
      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(overall);
      } else {
        map.current.addSource('route', { type: 'geojson', data: overall });
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: { 'line-width': 3, 'line-color': '#888' },
        });
      }
      // fit view
      const bounds = overall.coordinates.reduce(
        (b, coord) =>
          b.extend(coord),
        new mapboxgl.LngLatBounds(
          overall.coordinates[0],
          overall.coordinates[0]
        )
      );
      map.current.fitBounds(bounds, { padding: 20 });

      // d) Compute charging‐station stops
      const maxRange = tripData.capacity / tripData.consumption; // miles
      let current = startCoord;
      const stops = [];
      const searchRadius = 50000; // 50km

      while (
        length(
          { type: 'LineString', coordinates: [current, endCoord] },
          { units: 'miles' }
        ) > maxRange
      ) {
        const segment = await getRouteGeoJSON(current, endCoord);
        const pt = along(segment, maxRange - 0.1, { units: 'miles' });
        const [lon, lat] = pt.geometry.coordinates;

        const pois = await findChargingStations(lat, lon, searchRadius);
        if (!pois.length) break;

        const best = pois.reduce(
          (best, poi) => {
            const { Longitude, Latitude, Title } = poi.AddressInfo;
            const d = Math.hypot(Latitude - lat, Longitude - lon);
            return d < best.dist
              ? { dist: d, coord: [Longitude, Latitude], title: Title }
              : best;
          },
          { dist: Infinity, coord: null, title: null }
        );
        if (!best.coord) break;

        stops.push(best);
        current = best.coord;
      }

      // e) Place default orange markers
      stops.forEach((s) => {
        const marker = new mapboxgl.Marker({
          element: makeBatteryElement('/battery-charging.png'),
          offset: [0, -16]
        })
          .setLngLat(s.coord)
          .setPopup(new mapboxgl.Popup().setText(s.title))
          .addTo(map.current);
        markersRef.current.push(marker);
      });

      // f) Notify parent so ExportButton can render
      onRoutePlotted?.(startCoord, stops, endCoord, steps);



      // g) Draw green/orange legs
      const waypoints = [startCoord, ...stops.map((s) => s.coord), endCoord];
      const legGeoms = await Promise.all(
        waypoints.slice(1).map((dest, i) =>
          getRouteGeoJSON(waypoints[i], dest)
        )
      );

      const features = legGeoms.map((geom) => {
        const distLeg = length(geom, { units: 'miles' });
        const ratio = Math.min(distLeg / maxRange, 1);
        const color = ratio > 0.75 ? '#ff7f0e' : '#2ca02c';
        return { type: 'Feature', properties: { color }, geometry: geom };
      });

      const fc = { type: 'FeatureCollection', features };
      if (map.current.getSource('segments')) {
        map.current.getSource('segments').setData(fc);
      } else {
        map.current.addSource('segments', {
          type: 'geojson',
          data: fc,
        });
        map.current.addLayer({
          id: 'segments',
          type: 'line',
          source: 'segments',
          paint: {
            'line-width': 6,
            'line-color': ['get', 'color'],
          },
        });
      }
    })().catch(console.error);
  }, [tripData]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
}
