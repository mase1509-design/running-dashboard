// Running Dashboard Light Edition - JS (robust)
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

  function todayIso() { return new Date().toISOString().slice(0,10); }

  function loadEntries(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];
    try { const data = JSON.parse(raw); return Array.isArray(data) ? data : []; }
    catch(e){ console.error('Invalid JSON in localStorage', e); return []; }
  }

  function saveEntries(entries){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
    catch(e){ console.error('Failed to save', e); }
  }

  function computeSpeedKmH(distKm, min, sec){
    const d = parseFloat(distKm);
    const m = parseInt(min,10) || 0;
    const s = parseInt(sec,10) || 0;
    if(!isFinite(d) || d<=0) return '';
    const totalMin = m + s/60;
    if(totalMin<=0) return '';
    const speed = d / (totalMin/60);
    return Math.round(speed*10)/10;
  }

  function secondsToHMS(totalSec){
    const h = Math.floor(totalSec/3600);
    const m = Math.floor((totalSec%3600)/60);
    const s = totalSec%60;
    if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  function refreshStats(entries){
    if(!entries || entries.length===0){ totalDistanceEl.textContent='0.0 km'; totalTimeEl.textContent='0:00'; avgSpeedEl.textContent='0.0 km/h'; return; }
    let totalKm=0, totalSec=0, sumSpeed=0;
    entries.forEach(e=>{ totalKm += parseFloat(e.distanceKm)||0; totalSec += (parseInt(e.durationMin,10)||0)*60 + (parseInt(e.durationSec,10)||0); sumSpeed += parseFloat(e.speedKmh)||0; });
    const avg = entries.length>0 ? Math.round((sumSpeed/entries.length)*10)/10 : 0.0;
    totalDistanceEl.textContent = totalKm.toFixed(1) + ' km';
    totalTimeEl.textContent = secondsToHMS(totalSec);
    avgSpeedEl.textContent = avg.toFixed(1) + ' km/h';
  }

  function refreshTable(){
    const entries = loadEntries();
    entries.sort((a,b)=>{ if(a.date===b.date) return (b.id||0)-(a.id||0); return a.date<b.date?1:-1; });
    saveEntries(entries);
    tableBody.innerHTML = '';
    if(entries.length===0){ emptyEl.style.display='block'; refreshStats(entries); return; }
    emptyEl.style.display='none';
    entries.forEach((e,idx)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${e.date}</td>
        <td style="text-align:right">${parseFloat(e.distanceKm).toFixed(1)}</td>
        <td style="text-align:right">${e.durationMin} min ${e.durationSec}s</td>
        <td style="text-align:right">${e.speedKmh}</td>
        <td style="white-space:nowrap">
          <button class="action-btn" data-action="edit" data-idx="${idx}">✏️</button>
          <button class="action-btn" data-action="delete" data-idx="${idx}">🗑️</button>
        </td>`;
      tableBody.appendChild(tr);
    });
    refreshStats(entries);
  }

  function initForm(){ dateInput.value=todayIso(); distanceInput.value='5.0'; minutesInput.value='30'; secondsInput.value='0'; speedInput.value=computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || ''; }

  [distanceInput, minutesInput, secondsInput].forEach(el=>el.addEventListener('input', ()=>{ speedInput.value = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || ''; }));

  form.addEventListener('submit', (ev)=>{ ev.preventDefault();
    const date = dateInput.value || todayIso();
    const dist = parseFloat(distanceInput.value);
    const minutes = parseInt(minutesInput.value,10) || 0;
    const seconds = parseInt(secondsInput.value,10) || 0;
    const totalMin = minutes + seconds/60;
    if(!isFinite(dist) || dist<=0){ alert('Gib eine gültige Distanz in km an.'); return; }
    if(totalMin<=0){ alert('Gib eine gültige Dauer an.'); return; }
    let speedVal = parseFloat(speedInput.value);
    if(!isFinite(speedVal) || speedVal<=0) speedVal = computeSpeedKmH(dist, minutes, seconds);
    speedVal = Math.round(speedVal*10)/10;
    const entry = { id: Date.now(), date, distanceKm: dist.toFixed(1), durationMin: minutes, durationSec: seconds, speedKmh: speedVal.toFixed(1) };
    const entries = loadEntries(); entries.unshift(entry); saveEntries(entries); refreshTable(); initForm();
  });

  tableBody.addEventListener('click', (e)=>{ const btn = e.target.closest('button'); if(!btn) return;
    const action = btn.dataset.action; const idx = parseInt(btn.dataset.idx,10);
    let entries = loadEntries();
    if(isNaN(idx) || idx<0 || idx>=entries.length){ console.error('Invalid index', idx); refreshTable(); return; }
    if(action==='delete'){ if(confirm('Eintrag löschen?')){ entries.splice(idx,1); saveEntries(entries); refreshTable(); } }
    else if(action==='edit'){ const entry = entries[idx]; dateInput.value=entry.date; distanceInput.value=parseFloat(entry.distanceKm).toFixed(1); minutesInput.value=entry.durationMin; secondsInput.value=entry.durationSec; speedInput.value=entry.speedKmh; entries.splice(idx,1); saveEntries(entries); refreshTable(); window.scrollTo({top:0,behavior:'smooth'}); }
  });

  clearAllBtn.addEventListener('click', ()=>{ if(confirm('Alle Einträge wirklich löschen?')){ localStorage.removeItem(STORAGE_KEY); refreshTable(); initForm(); } });

  initForm(); refreshTable();
});
