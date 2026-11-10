/* Resolve once on confirmation; animation presents the recorded dice, never rerolls. */
window.CenizasDice=(()=>{
 const $=id=>document.getElementById(id),dialog=$('dice-dialog');let active=false;
 function d20(value='?',sides=20,index=0,preview=false){const wrap=document.createElement('div');wrap.className='die-wrap';const die=document.createElement('div');die.className='die-3d'+(preview?' preview':'');die.dataset.sides=sides;die.dataset.value=value;die.style.setProperty('--roll-delay',`${index*110}ms`);const shown=preview?'?':String(value);die.innerHTML=`<svg class="d20-svg" viewBox="0 0 120 120" aria-hidden="true"><polygon class="d20-facet facet-a" points="60,4 15,28 52,45"/><polygon class="d20-facet facet-b" points="60,4 105,28 68,45"/><polygon class="d20-facet facet-c" points="15,28 4,74 50,62 52,45"/><polygon class="d20-facet facet-d" points="105,28 116,74 70,62 68,45"/><polygon class="d20-facet facet-e" points="52,45 68,45 70,62 60,95 50,62"/><polygon class="d20-facet facet-f" points="4,74 34,112 60,95 50,62"/><polygon class="d20-facet facet-g" points="116,74 86,112 60,95 70,62"/><path class="d20-edge" d="M60 4 105 28 116 74 86 112 34 112 4 74 15 28Z M60 4 52 45 50 62 4 74 M60 4 68 45 70 62 116 74 M52 45 68 45 70 62 60 95 50 62Z"/><text class="d20-number" x="60" y="68" text-anchor="middle" dominant-baseline="middle">${shown}</text></svg>`;wrap.append(die);const caption=document.createElement('small');caption.textContent='d'+sides;wrap.append(caption);return wrap;}
 function show({title,detail='',optional=false,resolve,auto=false,autoAdvance=false,combat=false}){
  if(active)return Promise.resolve(null);active=true;$('dice-auto-setting').hidden=!combat;
  return new Promise(done=>{let phase='ready',outcome=null,timer=null;
   $('dice-title').textContent=title;$('dice-detail').textContent=detail;$('dice-result').textContent='';$('dice-tray').replaceChildren();
   $('dice-tray').append(d20('?',20,0,true));
   const go=$('dice-roll'),exit=$('dice-exit');go.hidden=false;go.disabled=false;go.textContent='Tirar dados';exit.hidden=!optional;exit.textContent='Salir sin tirar';
   function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(timer);dialog.classList.remove('rolling');phase='closed';dialog.close();active=false;done(value);}
   function scheduleAdvance(){if(phase!=='result')return;clearTimeout(timer);go.hidden=false;if(combat?window.CenizasPreferences.auto:autoAdvance)timer=setTimeout(()=>finish(outcome),combat?5000:3000);else go.focus();}
   window.addEventListener('battle-auto-change',scheduleAdvance);
   function reveal(){if(phase!=='rolling')return;clearTimeout(timer);phase='result';dialog.classList.remove('rolling');$('dice-tray').replaceChildren();
    for(const [index,d] of (outcome.dice||[]).entries()){const wrap=d20(d.value,d.sides,index);if(d.label)wrap.querySelector('small').textContent=d.label;$('dice-tray').append(wrap);}
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
