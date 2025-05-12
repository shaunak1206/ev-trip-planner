// src/components/ExportStepsButton.jsx
import React from 'react';

export default function ExportStepsButton({ steps, filename = 'instructions.txt' }) {
  const handleExportSteps = () => {
    if (!steps || !steps.length) {
      alert('No turn-by-turn steps available to export.');
      return;
    }

    // 1) Build a human-readable string of instructions
    const text = steps
      .map((step, i) => {
        // Mapbox “step” object has a .maneuver with instruction text,
        // and a .distance in meters (we convert to miles here).
        const instr = step.maneuver.instruction;
        const miles = (step.distance * 0.000621371).toFixed(2);
        return `${i + 1}. ${instr} — ${miles} mi`;
      })
      .join('\n');

    // 2) Create a Blob and an object URL
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);

    // 3) Programmatically click an <a> to download
    const a = document.createElement('a');
    a.href        = url;
    a.download    = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 4) Release the object URL
    URL.revokeObjectURL(url);
  };

  return (
    <button className="export-steps-btn" onClick={handleExportSteps}>
      Export Turn-by-Turn Instructions
    </button>
  );
}
