// src/App.js
import React, { useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import './App.css';
import InputForm from './components/InputForm';
import MapView from './components/MapView';
import ExportButton from './components/ExportButton';

function Legend() {
  return (
    <div className="legend">
      <h4>Route Key</h4>
      <div className="legend-item">
        <span className="leg-color grey" /> Overall route
      </div>
      <div className="legend-item">
        <span className="leg-color green" /> Safe (≤75% battery)
      </div>
      <div className="legend-item">
        <span className="leg-color orange" /> Near limit (75–100% battery)
      </div>
    </div>
  );
}

function App() {
  const [tripParams, setTripParams] = useState(null);
  const [error, setError] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const handlePlan = params => {
    if (params.capacity < 20 || params.capacity > 150) {
      setError('Battery must be between 20–150 kWh.');
      return;
    }
    if (params.consumption < 0.05 || params.consumption > 1) {
      setError('Consumption must be 0.05–1 kWh/mi.');
      return;
    }
    setError('');
    setTripParams(params);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        ⚡️ EV Charging Trip Planner
      </header>

      <div className="app-body">
        <aside className="sidebar">
          {/* Plan form */}
          <div className="plan-card">
            {error && <div className="error-banner">{error}</div>}
            <InputForm onSubmit={handlePlan} />
          </div>

          {/* Route key below the form */}
          <Legend />

          {/* Export button below the key */}
          {routeInfo && (
            <ExportButton
              start={routeInfo.start}
              stops={routeInfo.stops}
              end={routeInfo.end}
            />
          )}
        </aside>

        <main className="map-container">
          <MapView
            tripData={tripParams}
            onError={setError}
            onRoutePlotted={(start, stops, end) => {
              setRouteInfo({ start, stops, end });
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
