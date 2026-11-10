/* Resolve once on confirmation; animation presents the recorded dice, never rerolls. */
window.CenizasDice=(()=>{
 const $=id=>document.getElementById(id),dialog=$('dice-dialog');let active=false;
 const PHI=(1+Math.sqrt(5))/2,ICO_VERTICES=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]],ICO_FACES=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 function icoSvg(shown){const yaw=.52,pitch=-.34,cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch),project=v=>{let x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy,y=v[1]*cx-z*sx;z=v[1]*sx+z*cx;return {x:60+x*22,y:60-y*22,z};},points=ICO_VERTICES.map(project),faces=ICO_FACES.map(face=>{const p=face.map(i=>points[i]);return {p,z:p.reduce((sum,v)=>sum+v.z,0)/3};}).sort((a,b)=>a.z-b.z),min=Math.min(...faces.map(f=>f.z)),max=Math.max(...faces.map(f=>f.z)),palette=['#9d6a2d','#bd8740','#d7a95c','#ebca82','#f6dfa9'],polys=faces.map(f=>{const shade=Math.round((f.z-min)/(max-min)*(palette.length-1)),pointsText=f.p.map(v=>`${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');return `<polygon class="d20-facet" style="fill:${palette[shade]}" points="${pointsText}"/>`;}).join(''),front=faces[faces.length-1].p,cx2=front.reduce((sum,v)=>sum+v.x,0)/3,cy2=front.reduce((sum,v)=>sum+v.y,0)/3;return `<svg class="d20-svg" viewBox="0 0 120 120" aria-hidden="true">${polys}<text class="d20-number" x="${cx2.toFixed(1)}" y="${cy2.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${shown}</text></svg>`;}
 function fallbackSvg(shown){return `<svg class="d20-svg" viewBox="0 0 120 120" aria-hidden="true"><polygon class="d20-facet facet-a" points="60,4 15,28 52,45"/><polygon class="d20-facet facet-b" points="60,4 105,28 68,45"/><polygon class="d20-facet facet-c" points="15,28 4,74 50,62 52,45"/><polygon class="d20-facet facet-d" points="105,28 116,74 70,62 68,45"/><polygon class="d20-facet facet-e" points="52,45 68,45 70,62 60,95 50,62"/><polygon class="d20-facet facet-f" points="4,74 34,112 60,95 50,62"/><polygon class="d20-facet facet-g" points="116,74 86,112 60,95 70,62"/><path class="d20-edge" d="M60 4 105 28 116 74 86 112 34 112 4 74 15 28Z M60 4 52 45 50 62 4 74 M60 4 68 45 70 62 116 74 M52 45 68 45 70 62 60 95 50 62Z"/><text class="d20-number" x="60" y="68" text-anchor="middle" dominant-baseline="middle">${shown}</text></svg>`;}
 function d20(value='?',sides=20,index=0,preview=false){const wrap=document.createElement('div');wrap.className='die-wrap';const die=document.createElement('div');die.className='die-3d'+(preview?' preview':'');die.dataset.sides=sides;die.dataset.value=value;die.style.setProperty('--roll-delay',`${index*110}ms`);const shown=preview?'?':String(value);die.innerHTML=sides===20?icoSvg(shown):fallbackSvg(shown);wrap.append(die);const caption=document.createElement('small');caption.textContent='d'+sides;wrap.append(caption);return wrap;}
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
