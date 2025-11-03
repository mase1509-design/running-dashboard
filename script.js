document.addEventListener('DOMContentLoaded',()=>{
const db=firebase.firestore();const tableBody=document.querySelector('#entriesTable tbody');
const dateInput=document.getElementById('date'),distanceInput=document.getElementById('distance');
const minutesInput=document.getElementById('minutes'),secondsInput=document.getElementById('seconds');
const saveBtn=document.getElementById('saveBtn'),clearBtn=document.getElementById('clearAllBtn');
const totalDistanceEl=document.getElementById('totalDistance'),totalTimeEl=document.getElementById('totalTime'),avgSpeedEl=document.getElementById('avgSpeed');
const emptyEl=document.getElementById('empty');

function todayIso(){return new Date().toISOString().slice(0,10);}
function computeSpeedKmH(d,m,s){const dist=parseFloat(d),min=parseInt(m)||0,sec=parseInt(s)||0;
if(!isFinite(dist)||dist<=0)return '';const totalMin=min+sec/60;if(totalMin<=0)return '';return Math.round(dist/(totalMin/60)*10)/10;}
function secondsToHMS(totalSec){const m=Math.floor(totalSec/60),s=totalSec%60;return m+':'+String(s).padStart(2,'0');}
function refreshStats(entries){if(entries.length===0){totalDistanceEl.textContent='0.0 km';totalTimeEl.textContent='0:00';avgSpeedEl.textContent='0.0 km/h';return;}
let totalKm=0,totalSec=0,sumSpeed=0;entries.forEach(e=>{totalKm+=parseFloat(e.distanceKm)||0;totalSec+=(parseInt(e.durationMin)||0)*60+(parseInt(e.durationSec)||0);sumSpeed+=parseFloat(e.speedKmh)||0;});
totalDistanceEl.textContent=totalKm.toFixed(1)+' km';totalTimeEl.textContent=secondsToHMS(totalSec);avgSpeedEl.textContent=(sumSpeed/entries.length).toFixed(1)+' km/h';}
function refreshTable(){db.collection('runs').orderBy('date','desc').get().then(snapshot=>{tableBody.innerHTML='';if(snapshot.empty){emptyEl.style.display='block';refreshStats([]);return;}
emptyEl.style.display='none';let entries=[];snapshot.forEach(doc=>entries.push({...doc.data(),id:doc.id}));refreshStats(entries);
entries.forEach((e,idx)=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${e.date}</td><td>${parseFloat(e.distanceKm).toFixed(1)}</td><td>${e.durationMin} min ${e.durationSec}s</td><td>${e.speedKmh}</td><td style="white-space:nowrap"><button data-id="${e.id}" class="action-btn delete-btn">🗑️</button></td>`;tableBody.appendChild(tr);});
document.querySelectorAll('.delete-btn').forEach(btn=>{btn.addEventListener('click',()=>{if(confirm('Eintrag löschen?')){db.collection('runs').doc(btn.dataset.id).delete().then(()=>refreshTable());}});});});}

document.getElementById('entryForm').addEventListener('submit',e=>{e.preventDefault();
const date=dateInput.value||todayIso();const dist=parseFloat(distanceInput.value);
const min=parseInt(minutesInput.value)||0;const sec=parseInt(secondsInput.value)||0;const totalMin=min+sec/60;if(!isFinite(dist)||dist<=0){alert('Gültige Distanz angeben');return;}
if(totalMin<=0){alert('Gültige Dauer angeben');return;}
const speed=computeSpeedKmH(dist,min,sec);
db.collection('runs').add({date:date,distanceKm:dist.toFixed(1),durationMin:min,durationSec:sec,speedKmh:speed}).then(()=>{refreshTable();document.getElementById('entryForm').reset();dateInput.value=todayIso();});});

clearBtn.addEventListener('click',()=>{if(confirm('Alle Einträge löschen?')){db.collection('runs').get().then(snap=>{snap.forEach(doc=>db.collection('runs').doc(doc.id).delete().then(()=>refreshTable()));});}});

dateInput.value=todayIso();refreshTable();});
