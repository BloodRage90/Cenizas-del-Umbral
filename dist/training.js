(()=>{
'use strict';
const $=id=>document.getElementById(id),KEY='cenizas-atb-training-v1',R=window.CenizasATB;
let battle=new R.Battle(),selected=null,paused=true,focused=document.hasFocus(),last=0,lastPaint=0,lastSave=0,storageOK=true,invalidSave=false;
try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(R.valid(saved))battle=new R.Battle(saved);else invalidSave=true;}}catch{storageOK=false;}
function save(){try{localStorage.setItem(KEY,JSON.stringify(battle.s));storageOK=true;}catch{storageOK=false;}$('storage').textContent=storageOK?'Práctica guardada por separado':'Sin guardado: almacenamiento no disponible';}
const cards=new Map(),cells=[];
for(const u of battle.s.units.filter(u=>u.team==='party')){const b=document.createElement('button');b.className='card';b.innerHTML='<strong></strong><span class="stats"></span><progress max="100"></progress><span class="charge-label"></span>';b.querySelector('strong').textContent=u.name;b.querySelector('progress').setAttribute('aria-label','ATB de '+u.name);b.onclick=()=>{if(battle.ready(u.id)){selected=u.id;render();}};$('party').append(b);cards.set(u.id,b);}
for(let y=0;y<R.HEIGHT;y++)for(let x=0;x<R.WIDTH;x++){const b=document.createElement('button');b.className='cell';b.onclick=()=>{const occupant=battle.s.units.find(u=>u.x===x&&u.y===y&&u.hp>0);if(occupant?.team==='party'&&battle.ready(occupant.id)){selected=occupant.id;render();return;}if(selected&&!paused&&battle.move(selected,x,y)){save();render();}};$('board').append(b);cells.push({b,x,y,unitId:null});}
function render(){
 if(selected&&!battle.ready(selected))selected=null;
 const s=battle.s,u=battle.unit(selected),reachable=new Set((selected&&!paused?battle.reachable(selected):[]).map(p=>p.x+','+p.y));
 $('mode').value=s.mode;$('pause').textContent=paused?'Continuar':'Pausar';$('pause').disabled=!!s.result;
 $('selected').textContent=u?u.name+' · elige tu acción':'Elige un personaje listo';
 $('hint').textContent=paused?'El encuentro está en pausa.':u?(s.mode==='wait'?'Reloj en pausa mientras eliges. ':'El reloj continúa. ')+u.moves+' pasos disponibles.':'Selecciona una barra completa. Esperar permite coordinar a ambos.';
 $('enemy-hp').textContent='Eco · '+battle.unit('echo').hp+'/48 PG';
 const w=s.warning;$('warning').textContent=s.result?(s.result==='victory'?'El Eco se disipa. ¡Entrenamiento completado!':'El grupo ha caído. Puedes volver a practicar.'):w?'⚠ Pulso en fila '+(w.row+1)+' · '+(w.remaining/1000).toFixed(1)+' s de combate. Sal de la franja.':paused?'Encuentro en pausa. Continúa cuando estés listo.':'Observa las barras. El Eco anunciará su siguiente pulso.';
 for(const unit of s.units.filter(v=>v.team==='party')){const b=cards.get(unit.id),ready=battle.ready(unit.id);b.disabled=!ready||paused;b.classList.toggle('current',unit.id===selected);b.setAttribute('aria-pressed',String(unit.id===selected));b.querySelector('.stats').textContent=unit.hp+'/'+unit.max+' PG · '+unit.mp+' PM'+(unit.guard?' · protegido':'');b.querySelector('progress').value=unit.charge;b.querySelector('.charge-label').textContent=unit.hp===0?'Fuera de combate':ready?'LISTO · elegir':Math.floor(unit.charge)+' % · cargando';}
 for(const {b,x,y}of cells){const unit=s.units.find(v=>v.x===x&&v.y===y);b.classList.toggle('reachable',reachable.has(x+','+y));b.classList.toggle('danger',!!w&&w.row===y);b.classList.toggle('selected',!!unit&&unit.id===selected);b.classList.toggle('down',!!unit&&unit.hp===0);
  const id=unit?.id||'';if(b.dataset.unit!==id){b.dataset.unit=id;b.replaceChildren();if(unit){b.append(window.CenizasBattleVisuals.art(unit.id,'whisper'));const label=document.createElement('span');label.className='unit-name';label.textContent=unit.name;b.append(label);}const mark=document.createElement('span');mark.className='mark';mark.setAttribute('aria-hidden','true');b.append(mark);}
  b.querySelector('.mark').textContent=(w?.row===y?'⚠':'')+(reachable.has(x+','+y)?'◇':'')+(unit?.id===selected?'◆':'');b.setAttribute('aria-label',`Fila ${y+1}, columna ${x+1}${unit?', '+unit.name+', '+unit.hp+' PG':''}${reachable.has(x+','+y)?', destino alcanzable':''}${w?.row===y?', peligro':''}`);
 }
 for(const b of document.querySelectorAll('[data-action]')){const reason=battle.reason(selected,b.dataset.action);b.disabled=paused||!!reason;b.title=reason||'Ejecutar';}
 $('combo-reason').textContent=selected?battle.reason(selected,'combo')||'Ambos listos: puedes ejecutar la técnica doble.':'Resonancia: ambos listos, 2 PM cada uno y alcance 2.';
 $('wait').disabled=paused||!selected||!!s.result;
 const history=s.log.slice(-6).join('\n');if($('log').dataset.history!==history){$('log').dataset.history=history;$('log').replaceChildren(...s.log.slice(-6).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
 $('result').textContent=s.result==='victory'?'Victoria · tu campaña sigue intacta':s.result==='defeat'?'Práctica terminada':'';
}
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{if(paused||!selected)return;const action=b.dataset.action;if(battle.act(selected,action)){selected=null;$('feedback').textContent=battle.s.log.at(-1);save();render();}});
$('wait').onclick=()=>{selected=null;render();};
$('pause').onclick=()=>{paused=!paused;last=performance.now();render();};
$('mode').onchange=e=>{battle.s.mode=e.target.value;save();render();};
$('restart').onclick=()=>{paused=true;render();$('reset-dialog').showModal();};
$('reset-cancel').onclick=()=>$('reset-dialog').close();
$('reset-confirm').onclick=()=>{battle=new R.Battle();selected=null;paused=true;$('feedback').textContent='Nuevo entrenamiento preparado.';$('reset-dialog').close();save();render();};
document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)||$('reset-dialog').open)return;const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];if(d&&selected&&!paused){e.preventDefault();const u=battle.unit(selected);if(battle.move(selected,u.x+d[0],u.y+d[1])){save();render();}}});
function suspend(){paused=true;last=0;save();render();}
window.addEventListener('blur',()=>{focused=false;suspend();});window.addEventListener('focus',()=>{focused=true;last=0;});document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();last=0;});window.addEventListener('pagehide',save);
function frame(now){const delta=last?Math.min(100,now-last):0;last=now;battle.tick(delta,{paused:paused||!focused||document.hidden||$('reset-dialog').open,menu:!!selected});if(now-lastPaint>100){render();lastPaint=now;}if(now-lastSave>1000&&!paused&&focused&&!document.hidden){save();lastSave=now;}requestAnimationFrame(frame);}
if(invalidSave)$('feedback').textContent='El guardado de práctica no era compatible. Se preparó un entrenamiento nuevo; la campaña no se ha tocado.';
render();$('pause').textContent='Comenzar';$('storage').textContent=storageOK?'Guardado independiente de la campaña':'Sin guardado: almacenamiento no disponible';requestAnimationFrame(frame);
})();
