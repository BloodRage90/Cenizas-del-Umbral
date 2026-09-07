/* Resolve once on confirmation; animation presents the recorded dice, never rerolls. */
window.CenizasDice=(()=>{
 const $=id=>document.getElementById(id),dialog=$('dice-dialog');let active=false;
 function show({title,detail='',optional=false,resolve,auto=false,autoAdvance=false,combat=false}){
  if(active)return Promise.resolve(null);active=true;$('dice-auto-setting').hidden=!combat;
  return new Promise(done=>{let phase='ready',outcome=null,timer=null;
   $('dice-title').textContent=title;$('dice-detail').textContent=detail;$('dice-result').textContent='';$('dice-tray').replaceChildren();
   const preview=document.createElement('div');preview.className='die preview';preview.textContent='?';$('dice-tray').append(preview);
   const go=$('dice-roll'),exit=$('dice-exit');go.hidden=false;go.disabled=false;go.textContent='Tirar dados';exit.hidden=!optional;exit.textContent='Salir sin tirar';
   function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(timer);dialog.classList.remove('rolling');phase='closed';dialog.close();active=false;done(value);}
   function scheduleAdvance(){if(phase!=='result')return;clearTimeout(timer);go.hidden=false;if(combat?window.CenizasPreferences.auto:autoAdvance)timer=setTimeout(()=>finish(outcome),3000);else go.focus();}
   window.addEventListener('battle-auto-change',scheduleAdvance);
   function reveal(){if(phase!=='rolling')return;clearTimeout(timer);phase='result';dialog.classList.remove('rolling');$('dice-tray').replaceChildren();
    for(const d of outcome.dice||[]){const wrap=document.createElement('div');wrap.className='die-wrap';const cube=document.createElement('div');cube.className='die';cube.textContent=d.value;const caption=document.createElement('small');caption.textContent=d.label||'d'+d.sides;wrap.append(cube,caption);$('dice-tray').append(wrap);}
    if(!outcome.dice?.length)$('dice-tray').textContent='✓';$('dice-result').textContent=outcome.summary||'';go.disabled=false;go.textContent='Continuar';scheduleAdvance();
   }
   function begin(){if(phase!=='ready')return;phase='rolling';exit.hidden=true;go.disabled=true;go.textContent='Tirando…';
    try{outcome=resolve();}catch(e){phase='result';$('dice-result').textContent='No se pudo resolver la tirada. Cierra y vuelve a intentarlo.';go.disabled=false;go.textContent='Cerrar';return;}
    dialog.classList.add('rolling');timer=setTimeout(reveal,matchMedia('(prefers-reduced-motion: reduce)').matches?80:(autoAdvance?450:1100));
   }
   go.onclick=()=>phase==='ready'?begin():phase==='result'?finish(outcome):null;exit.onclick=()=>{if(phase==='ready'&&optional)finish(null);};
   dialog.oncancel=e=>{e.preventDefault();if(phase==='ready'&&optional)finish(null);};
   dialog.showModal();if(auto)begin();else go.focus();
  });
 }
 return {show};
})();
