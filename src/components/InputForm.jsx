import React, { useState } from 'react';
import './InputForm.css';

export default function InputForm({ onSubmit }) {
  const [start, setStart] = useState('');
  const [end, setEnd]     = useState('');
  const [cap, setCap]     = useState(75);
  const [cons, setCons]   = useState(0.3);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ start, end, capacity: cap, consumption: cons });
  };

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <h3>Plan a Trip</h3>

      <label>
        From:
        <input
          type="text"
          value={start}
          onChange={e => setStart(e.target.value)}
          placeholder="e.g. San Francisco, CA"
          required
        />
      </label>

      <label>
        To:
        <input
          type="text"
          value={end}
          onChange={e => setEnd(e.target.value)}
          placeholder="e.g. New York, NY"
          required
        />
      </label>

      <div className="two-col">
        <label>
          Battery (kWh):
          <input
            type="number"
            value={cap}
            onChange={e => setCap(+e.target.value)}
            min="20" max="150"
            required
          />
        </label>

        <label>
          Consump (kWh/mi):
          <input
            type="number"
            step="0.01"
            value={cons}
            onChange={e => setCons(+e.target.value)}
            min="0.05" max="1"
            required
          />
        </label>
      </div>

      <button type="submit">Plan My Trip</button>
    </form>
  );
}
