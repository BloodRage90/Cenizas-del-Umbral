(()=>{
const ASSET_VERSION=window.CenizasAssets?.version||'2026-11-phase3';
const tracks={plaza:'Valdara · los nombres al sol',exploration:'La carta y el camino',taller:'Ordan · madera y bronce',criptas:'El río guarda nombres',bosque:'Susurros entre las hojas',lindero:'Antes de cruzar',embarcadero:'Agua de regreso',molino:'Ruedas sobre la garganta',monasterio:'Hospitalidad de ceniza',archivo:'La tinta recuerda',enfermeria:'Elara y Darien · volver',capilla:'Mara · memoria prestada',montana:'La deuda que no elegimos',antesala:'Nadie ocupa tu lugar',umbral:'El Coro Vacío',mystery:'La voz bajo el agua',battle:'Acero y voluntad','forest-battle':'Raíces en fuga','vigilia-battle':'La marcha de las firmas',custodian:'Piedra contra el río',ash:'Ceniza bajo el martillo',finale:'Romper el Coro','training-battle':'Dos pulsos, un paso',epilogue:'La ciudad vuelve a nombrar',intro:'Cenizas del Umbral · El llamado'};
const channels=[new Audio(),new Audio()];channels.forEach(a=>{a.loop=true;a.preload='none';a.volume=0;});
let enabled=false,volume=.3,context='exploration',playing='',active=0,unlocked=false,revision=0,timer=null;
try{enabled=localStorage.getItem('cenizas-music-enabled')==='true';volume=Number(localStorage.getItem('cenizas-music-volume')??.3);}catch{/* optional storage/API unavailable; safe fallback */}
volume=Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):.3;
const button=document.createElement('button');button.id='music-button';button.className='round';button.textContent='♪';button.setAttribute('aria-label','Música y volumen');document.querySelector('.utilities,.top-actions,.toolbar')?.prepend(button);
const dialog=document.createElement('dialog');dialog.id='music-dialog';dialog.setAttribute('aria-label','Música');dialog.innerHTML='<h2>Música del viaje</h2><label><input id="music-enabled" type="checkbox"> Activar música</label><label for="music-volume">Volumen</label><input id="music-volume" type="range" min="0" max="100" aria-label="Volumen de música"><p id="music-status" role="status"></p><p><a href="soundtrack.html" target="_blank" rel="noopener">Escuchar la banda sonora completa ↗</a></p><details><summary>Créditos musicales</summary><p>Resonancias: 24 composiciones y arreglos originales para Cenizas del Umbral. Instrumentos sintetizados, melodías compartidas entre personajes y lugares, y temas propios para el combate y el desenlace.</p><p>No se utilizaron grabaciones, muestras ni melodías de terceros. Composición y síntesis reproducible en scripts/compose-soundtrack.cjs.</p></details><button id="music-close">Volver al juego</button>';document.body.append(dialog);
const $=id=>document.getElementById(id);$('music-enabled').checked=enabled;$('music-volume').value=volume*100;
function persist(){try{localStorage.setItem('cenizas-music-enabled',String(enabled));localStorage.setItem('cenizas-music-volume',String(volume));}catch{/* optional storage/API unavailable; safe fallback */}}
function stopFade(){if(timer!==null)clearInterval(timer);timer=null;}
function suspend(){revision++;stopFade();channels.forEach(a=>a.pause());}
function update(){
 button.setAttribute('aria-label',enabled?'Música activada: ajustar volumen':'Activar música');
 if(!enabled||document.hidden){suspend();$('music-status').textContent=enabled?'Música en pausa':'Música desactivada';return;}
 if(!unlocked){$('music-status').textContent='Toca la pantalla para iniciar la música.';return;}
 const token=++revision;stopFade();const previous=channels[active];
 if(playing!==context){active=1-active;playing=context;channels[active].src='music/'+context+'.mp3?v='+encodeURIComponent(ASSET_VERSION);channels[active].volume=0;}
 const current=channels[active],other=channels[1-active],from=current.volume,otherFrom=other.volume;
 current.play().then(()=>{
  if(token!==revision)return;
  $('music-status').textContent=tracks[context];const began=performance.now();
  timer=setInterval(()=>{const progress=Math.min(1,(performance.now()-began)/900);current.volume=from+(volume-from)*progress;other.volume=otherFrom*(1-progress);if(progress===1){other.pause();stopFade();}},40);
 }).catch(()=>{if(token!==revision)return;previous.pause();current.pause();playing='';$('music-status').textContent='Pulsa Activar música para reintentar.';});
}
button.onclick=()=>{dialog.showModal();update();};$('music-close').onclick=()=>dialog.close();$('music-enabled').onchange=e=>{enabled=e.target.checked;unlocked=true;persist();update();};$('music-volume').oninput=e=>{volume=Math.max(0,Math.min(1,Number(e.target.value)/100));persist();update();};
function unlock(){if(unlocked)return;unlocked=true;update();}document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);document.addEventListener('visibilitychange',update);window.addEventListener('pagehide',suspend);
channels.forEach(a=>a.addEventListener('error',()=>{if(a!==channels[active])return;suspend();playing='';$('music-status').textContent='No se pudo cargar la música. Desactiva y activa para reintentar.';}));
window.CenizasMusic={enable(){enabled=true;unlocked=true;persist();update();},set(place,battle){const next=battle?(place==='training'?'training-battle':battle==='coro'||place==='umbral'?'finale':battle==='custodian'?'custodian':battle==='ash'?'ash':['bosque','lindero','embarcadero','molino','montana'].includes(place)?'forest-battle':['monasterio','archivo','enfermeria','capilla'].includes(place)?'vigilia-battle':'battle'):Object.hasOwn(tracks,place)?place:'exploration';if(next!==context){context=next;update();}}};update();
})();
const musicCredits=document.querySelector('#music-dialog details p');if(musicCredits)musicCredits.textContent='Resonancias: 25 composiciones y arreglos originales para Cenizas del Umbral. Instrumentos sintetizados, melodías compartidas entre personajes y lugares, y temas propios para el combate, el prólogo y el desenlace.';
