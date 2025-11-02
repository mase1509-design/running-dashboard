// Running Dashboard Final - pure JS, LocalStorage, stats, animated logo
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

function todayIso(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}

function loadEntries(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return [];
  try{ return JSON.parse(raw); }catch(e){ return []; }
}

function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function computeSpeedKmH(distKm, min, sec){
  const d = parseFloat(distKm);
  const m = parseInt(min) || 0;
  const s = parseInt(sec) || 0;
  if(!isFinite(d) || d <= 0) return '';
  const totalMin = m + s/60;
  if(totalMin <= 0) return '';
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
  if(!entries || entries.length===0){
    totalDistanceEl.textContent = '0.0 km';
    totalTimeEl.textContent = '0:00';
    avgSpeedEl.textContent = '0.0 km/h';
    return;
  }
  let totalKm = 0;
  let totalSec = 0;
  let sumSpeed = 0;
  entries.forEach(e=>{
    totalKm += parseFloat(e.distanceKm);
    totalSec += (parseInt(e.durationMin)||0)*60 + (parseInt(e.durationSec)||0);
    sumSpeed += parseFloat(e.speedKmh)||0;
  });
  const avgSpeed = (entries.length>0) ? (Math.round((sumSpeed/entries.length)*10)/10).toFixed(1) : 0.0;
  totalDistanceEl.textContent = totalKm.toFixed(1) + ' km';
  totalTimeEl.textContent = secondsToHMS(totalSec);
  avgSpeedEl.textContent = avgSpeed + ' km/h';
}

function refreshTable(){
  const entries = loadEntries();
  entries.sort((a,b)=>{
    if(a.date === b.date) return b.id - a.id;
    return (a.date < b.date) ? 1 : -1;
  });
  saveEntries(entries);
  tableBody.innerHTML = '';
  if(entries.length === 0){
    emptyEl.style.display = 'block'; return;
  } else { emptyEl.style.display = 'none'; }
  entries.forEach((e, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.date}</td>
      <td style="text-align:right">${parseFloat(e.distanceKm).toFixed(1)}</td>
      <td style="text-align:right">${e.durationMin} min ${e.durationSec}s</td>
      <td style="text-align:right">${e.speedKmh}</td>
      <td style="white-space:nowrap">
        <button class="action-btn" data-action="edit" data-idx="${idx}">✏️</button>
        <button class="action-btn" data-action="delete" data-idx="${idx}">🗑️</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  refreshStats(entries);
}

# init form defaults
initForm = function(){
  dateInput.value = todayIso();
  distanceInput.value = '5.0';
  minutesInput.value = '30';
  secondsInput.value = '0';
  speedInput.value = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || '';
}

distanceInput.addEventListener('input', ()=>{
  speedInput.value = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || '';
});
minutesInput.addEventListener('input', ()=>{
  speedInput.value = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || '';
});
secondsInput.addEventListener('input', ()=>{
  if(parseInt(secondsInput.value) > 59) secondsInput.value = 59;
  speedInput.value = computeSpeedKmH(distanceInput.value, minutesInput.value, secondsInput.value) || '';
});

form.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const date = dateInput.value || todayIso();
  const dist = parseFloat(distanceInput.value);
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  const totalMin = minutes + seconds/60;
  if(!isFinite(dist) || dist <= 0){ alert('Gib eine gültige Distanz in km an.'); return; }
  if(totalMin <= 0){ alert('Gib eine gültige Dauer an.'); return; }
  let speedVal = parseFloat(speedInput.value);
  if(!isFinite(speedVal) || speedVal <= 0){
    speedVal = computeSpeedKmH(dist, minutes, seconds);
  }
  speedVal = Math.round(speedVal*10)/10;

  const entry = {
    id: Date.now(),
    date,
    distanceKm: dist.toFixed(1),
    durationMin: minutes,
    durationSec: seconds,
    speedKmh: speedVal.toFixed(1)
  };

  const entries = loadEntries();
  entries.unshift(entry);
  saveEntries(entries);
  refreshTable();
  initForm();
});

tableBody.addEventListener('click', (e)=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const action = btn.dataset.action;
  const idx = parseInt(btn.dataset.idx);
  let entries = loadEntries();
  if(action === 'delete'){
    if(confirm('Eintrag löschen?')){
      entries.splice(idx,1);
      saveEntries(entries);
      refreshTable();
    }
  } else if(action === 'edit'){
    const entry = entries[idx];
    dateInput.value = entry.date;
    distanceInput.value = parseFloat(entry.distanceKm).toFixed(1);
    minutesInput.value = entry.durationMin;
    secondsInput.value = entry.durationSec;
    speedInput.value = entry.speedKmh;
    entries.splice(idx,1);
    saveEntries(entries);
    refreshTable();
    window.scrollTo({top:0,behavior:'smooth'});
  }
});

clearAllBtn.addEventListener('click', ()=>{
  if(confirm('Alle Einträge wirklich löschen?')){
    localStorage.removeItem(STORAGE_KEY);
    refreshTable();
    initForm();
  }
});

// init
initForm();
refreshTable();
