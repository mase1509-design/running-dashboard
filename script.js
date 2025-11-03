// Running Dashboard - fixed script (DOMContentLoaded, robust, sorted newest-first)
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'running_dashboard_entries_final_v1';

  const form = document.getElementById('entryForm');
  const dateInput = document.getElementById('date');
  const distanceInput = document.getElementById('distance');
  const minutesInput = document.getElementById('minutes');
  const secondsInput = document.getElementById('seconds');
  const speedInput = document.getElementById('speed');
  const tableBody = document.querySelector('#entriesTable tbody');
  const emptyEl = document.getElementById('empty');
  const clearAllBtn = document.getElementById('clearAllBtn');

  const totalDistanceEl = document.getElementById('totalDistance');
  const totalTimeEl = document.getElementById('totalTime');
  const avgSpeedEl = document.getElementById('avgSpeed');

  if (!form || !dateInput || !distanceInput || !minutesInput || !secondsInput || !speedInput || !tableBody) {
    console.error('Ein oder mehrere DOM-Elemente fehlen. Prüfe die IDs in index.html.');
    return;
  }

  function todayIso() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function loadEntries() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) return [];
      return data;
    } catch (e) {
      console.error('Fehler beim Parsen von LocalStorage:', e);
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Fehler beim Speichern in LocalStorage:', e);
    }
  }

  function computeSpeedKmH(distKm, min, sec) {
    const d = parseFloat(distKm);
    const m = parseInt(min, 10) || 0;
    const s = parseInt(sec, 10) || 0;
    if (!isFinite(d) || d <= 0) return '';
    const totalMin = m + s / 60;
    if (totalMin <= 0) return '';
    const speed = d / (totalMin / 60);
    return Math.round(speed * 10) / 10;
  }

  function secondsToHMS(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function refreshStats(entries) {
    if (!entries || entries.length === 0) {
      totalDistanceEl.textContent = '0.0 km';
      totalTimeEl.textContent = '0:00';
      avgSpeedEl.textContent = '0.0 km/h';
      return;
    }
    let totalKm = 0;
    let totalSec = 0;
    let sumSpeed = 0;
    entries.forEach(e => {
      totalKm += parseFloat(e.distanceKm) || 0;
      totalSec += (parseInt(e.durationMin, 10) || 0) * 60 + (parseInt(e.durationSec, 10) || 0);
      sumSpeed += parseFloat(e.speedKmh) || 0;
    });
    const avgSpeed = entries.length > 0 ? Math.round((sumSpeed / entries.length) * 10) / 10 : 0.0;
    totalDistanceEl.textContent = totalKm.toFixed(1) + ' km';
    totalTimeEl.textContent = secondsToHMS(totalSec);
    avgSpeedEl.textContent = avgSpeed.toFixed(1) + ' km/h';
  }

  function refreshTable() {
    const entries = loadEntries();
    // sort by date desc (newest first). If same date, sort by id desc
    entries.sort((a, b) => {
      if (a.date === b.date) return (b.id || 0) - (a.id || 0);
      return a.date < b.date ? 1 : -1;
    });
    // save sorted order
    saveEntries(entries);

    tableBody.innerHTML = '';
    if (entries.length === 0) {
      emptyEl.style.display = 'block';
      refreshStats(entries);
      return;
    } else {
      emptyEl.style.display = 'none';
    }

    entries.forEach((e, idx) => {
      const tr = document.createElement('tr');
      // sanitize values for safety (simple)
      const date = String(e.date || '');
      const dist = (parseFloat(e.distanceKm) || 0).toFixed(1);
      const dMin = parseInt(e.durationMin, 10) || 0;
      const dSec = parseInt(e.durationSec, 10) || 0;
      const speed = (parseFloat(e.speedKmh) || 0).toFixed(1);

      tr.innerHTML = `
        <td>${date}</td>
        <td style="text-align:right">${dist}</td>
        <td style="text-align:right">${dMin} min ${dSec}s</td>
        <td style="text-align:right">${speed}</td>
        <td style="white-space:nowrap">
          <button class="action-btn" data-action="edit" data-idx="${idx}">✏️</button>
          <button class="action-btn" data-action="delete" data-idx="${idx}">🗑️</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    refreshStats(entries);
  }

  // initialize form defaults
  function initForm() {
    dateInput.value = todayIso();
    distanceInput.value = '5.0';
    minutesInput.value = '30';
    secondsInput.value = '0';
    const sp = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value);
    speedInput.value = sp !== '' ? sp : '';
  }

  // live compute speed when inputs change
  [distanceInput, minutesInput, secondsInput].forEach(el => {
    el.addEventListener('input', () => {
      const sp = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value);
      speedInput.value = sp !== '' ? sp : '';
    });
  });

  // submit handler
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const date = dateInput.value || todayIso();
    const dist = parseFloat(distanceInput.value);
    const minutes = parseInt(minutesInput.value, 10) || 0;
    const seconds = parseInt(secondsInput.value, 10) || 0;
    const totalMin = minutes + seconds / 60;
    if (!isFinite(dist) || dist <= 0) {
      alert('Gib eine gültige Distanz in km an.');
      return;
    }
    if (totalMin <= 0) {
      alert('Gib eine gültige Dauer an.');
      return;
    }
    let speedVal = parseFloat(speedInput.value);
    if (!isFinite(speedVal) || speedVal <= 0) {
      speedVal = computeSpeedKmH(dist, minutes, seconds);
    }
    speedVal = Math.round(speedVal * 10) / 10;

    const entry = {
      id: Date.now(),
      date,
      distanceKm: dist.toFixed(1),
      durationMin: minutes,
      durationSec: seconds,
      speedKmh: speedVal.toFixed(1)
    };

    const entries = loadEntries();
    entries.unshift(entry); // newest first
    saveEntries(entries);
    refreshTable();
    initForm();

    // accessibility: move focus to the table
    tableBody.querySelector('tr')?.focus();
  });

  // table actions (edit/delete)
  tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = parseInt(btn.dataset.idx, 10);
    let entries = loadEntries();
    if (Number.isNaN(idx) || idx < 0 || idx >= entries.length) {
      console.error('Ungültiger Index für Tabelle:', idx);
      refreshTable();
      return;
    }
    if (action === 'delete') {
      if (confirm('Eintrag löschen?')) {
        entries.splice(idx, 1);
        saveEntries(entries);
        refreshTable();
      }
    } else if (action === 'edit') {
      const entry = entries[idx];
      dateInput.value = entry.date;
      distanceInput.value = parseFloat(entry.distanceKm).toFixed(1);
      minutesInput.value = entry.durationMin;
      secondsInput.value = entry.durationSec;
      speedInput.value = entry.speedKmh;
      // remove the old entry; it will be re-added on submit
      entries.splice(idx, 1);
      saveEntries(entries);
      refreshTable();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // clear all
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Alle Einträge wirklich löschen?')) {
      localStorage.removeItem(STORAGE_KEY);
      refreshTable();
      initForm();
    }
  });

  // initial
  initForm();
  refreshTable();
}); // DOMContentLoaded
