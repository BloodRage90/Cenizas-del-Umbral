/* Resolve once on confirmation; animation presents the recorded dice, never rerolls. */
window.CenizasDice=(()=>{
 const $=id=>document.getElementById(id),dialog=$('dice-dialog');let active=false;
 function cube(value='?',sides=20,index=0,preview=false){const wrap=document.createElement('div');wrap.className='die-wrap';const die=document.createElement('div');die.className='die-3d'+(preview?' preview':'');die.dataset.sides=sides;die.dataset.value=value;die.style.setProperty('--roll-delay',`${index*110}ms`);const faces=['front','back','right','left','top','bottom'];faces.forEach((face,n)=>{const side=document.createElement('span');side.className=`die-face ${face}`;side.textContent=preview?'?':n===0?value:((Number(value)+n-1)%6)+1;die.append(side);});wrap.append(die);if(!preview){const caption=document.createElement('small');caption.textContent='d'+sides;wrap.append(caption);}return wrap;}
 function show({title,detail='',optional=false,resolve,auto=false,autoAdvance=false,combat=false}){
  if(active)return Promise.resolve(null);active=true;$('dice-auto-setting').hidden=!combat;
  return new Promise(done=>{let phase='ready',outcome=null,timer=null;
   $('dice-title').textContent=title;$('dice-detail').textContent=detail;$('dice-result').textContent='';$('dice-tray').replaceChildren();
   $('dice-tray').append(cube('?',20,0,true));
   const go=$('dice-roll'),exit=$('dice-exit');go.hidden=false;go.disabled=false;go.textContent='Tirar dados';exit.hidden=!optional;exit.textContent='Salir sin tirar';
   function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(timer);dialog.classList.remove('rolling');phase='closed';dialog.close();active=false;done(value);}
   function scheduleAdvance(){if(phase!=='result')return;clearTimeout(timer);go.hidden=false;if(combat?window.CenizasPreferences.auto:autoAdvance)timer=setTimeout(()=>finish(outcome),combat?5000:3000);else go.focus();}
   window.addEventListener('battle-auto-change',scheduleAdvance);
   function reveal(){if(phase!=='rolling')return;clearTimeout(timer);phase='result';dialog.classList.remove('rolling');$('dice-tray').replaceChildren();
    for(const [index,d] of (outcome.dice||[]).entries()){const wrap=cube(d.value,d.sides,index);if(d.label)wrap.querySelector('small').textContent=d.label;$('dice-tray').append(wrap);}
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
