import React, { useState } from 'react';

function formatDateInput(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

export default function EventForm({ onAdd }) {
  const todayIso = formatDateInput(new Date());
  const [date, setDate] = useState(todayIso);
  const [distance, setDistance] = useState('5.0');
  const [minutes, setMinutes] = useState('30');
  const [seconds, setSeconds] = useState('0');
  const [speed, setSpeed] = useState('');

  const computeSpeed = (distKm, min, sec) => {
    const d = parseFloat(distKm);
    const m = parseInt(min) || 0;
    const s = parseInt(sec) || 0;
    if (!isFinite(d) || d <= 0) return '';
    const totalMinutes = m + s / 60;
    if (totalMinutes <= 0) return '';
    const speedVal = d / (totalMinutes / 60);
    return (Math.round(speedVal * 10) / 10).toFixed(1);
  };

  const handleChange = (field, value) => {
    if (field === 'distance') setDistance(value);
    if (field === 'minutes') setMinutes(value);
    if (field === 'seconds') setSeconds(value);

    const newDist = field === 'distance' ? value : distance;
    const newMin = field === 'minutes' ? value : minutes;
    const newSec = field === 'seconds' ? value : seconds;

    const spd = computeSpeed(newDist, newMin, newSec);
    setSpeed(spd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const d = parseFloat(distance);
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const totalMin = m + s / 60;

    if (!isFinite(d) || d <= 0) {
      alert('Bitte eine gültige Distanz eingeben.');
      return;
    }
    if (totalMin <= 0) {
      alert('Bitte eine gültige Dauer eingeben.');
      return;
    }

    const computedSpeed = computeSpeed(d, m, s);

    const entry = {
      id: Date.now(),
      date,
      distanceKm: d.toFixed(1),
      durationMin: m,
      durationSec: s,
      speedKmh: computedSpeed
    };

    onAdd(entry);
    setDate(formatDateInput(new Date()));
    setDistance('5.0');
    setMinutes('30');
    setSeconds('0');
    setSpeed(computeSpeed('5.0', '30', '0'));
  };

  React.useEffect(() => {
    setSpeed(computeSpeed(distance, minutes, seconds));
    // eslint-disable-next-line
  }, []);

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Datum</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="form-row">
        <label>Entfernung (km)</label>
        <input
          type="number"
          step="0.1"
          value={distance}
          onChange={(e) => handleChange('distance', e.target.value)}
        />
        <small className="hint">Eine Nachkommastelle</small>
      </div>

      <div className="form-row">
        <label>Dauer</label>
        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
          <input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => handleChange('minutes', e.target.value)}
            placeholder="Min"
          />
          <span style={{alignSelf: 'center'}}>:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => handleChange('seconds', e.target.value)}
            placeholder="Sek"
          />
        </div>
      </div>

      <div className="form-row">
        <label>Geschwindigkeit (km/h)</label>
        <input
          type="number"
          step="0.1"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button className="btn" type="submit">
          Speichern
        </button>
      </div>
    </form>
  );
}
