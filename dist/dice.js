/* Resolve once on confirmation; animation presents the recorded dice, never rerolls. */
/* D20 topology follows the icosahedron layout used by byWulf/threejs-dice (MIT). */
window.CenizasDice=(()=>{
 const $=id=>document.getElementById(id),dialog=$('dice-dialog');let active=false;
 const PHI=(1+Math.sqrt(5))/2,ICO_VERTICES=[[-1,PHI,0],[1,PHI,0],[-1,-PHI,0],[1,-PHI,0],[0,-1,PHI],[0,1,PHI],[0,-1,-PHI],[0,1,-PHI],[PHI,0,-1],[PHI,0,1],[-PHI,0,-1],[-PHI,0,1]],ICO_FACES=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
 function icoSvg(shown){const yaw=.52,pitch=-.34,cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch),project=v=>{let x=v[0]*cy+v[2]*sy,z=-v[0]*sy+v[2]*cy,y=v[1]*cx-z*sx;z=v[1]*sx+z*cx;return {x:60+x*22,y:60-y*22,z};},points=ICO_VERTICES.map(project),faces=ICO_FACES.map(face=>{const p=face.map(i=>points[i]);return {p,z:p.reduce((sum,v)=>sum+v.z,0)/3};}).sort((a,b)=>a.z-b.z),min=Math.min(...faces.map(f=>f.z)),max=Math.max(...faces.map(f=>f.z)),palette=['#9d6a2d','#bd8740','#d7a95c','#ebca82','#f6dfa9'],polys=faces.map(f=>{const shade=Math.round((f.z-min)/(max-min)*(palette.length-1)),pointsText=f.p.map(v=>`${v.x.toFixed(1)},${v.y.toFixed(1)}`).join(' ');return `<polygon class="d20-facet" style="fill:${palette[shade]}" points="${pointsText}"/>`;}).join(''),front=faces[faces.length-1].p,cx2=front.reduce((sum,v)=>sum+v.x,0)/3,cy2=front.reduce((sum,v)=>sum+v.y,0)/3,target=Number(shown),remaining=Array.from({length:20},(_,i)=>i+1).filter(n=>n!==target),labels=shown==='?'?'':faces.map((f,i)=>{const c=f.p.reduce((o,v)=>({x:o.x+v.x,y:o.y+v.y}),{x:0,y:0}),n=i===faces.length-1?target:remaining[i-(i>faces.length-1?1:0)];return `<text class="${i===faces.length-1?'d20-number':'d20-face-number'}" x="${(c.x/3).toFixed(1)}" y="${(c.y/3).toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${n}</text>`;}).join('');return `<svg class="d20-svg" viewBox="0 0 120 120" aria-hidden="true">${polys}${labels}${shown==='?'?`<text class="d20-number" x="${cx2.toFixed(1)}" y="${cy2.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">?</text>`:''}</svg>`;}
 function pipPoints(value){return({1:[[0,0]],2:[[-.48,-.48],[.48,.48]],3:[[-.48,-.48],[0,0],[.48,.48]],4:[[-.48,-.48],[.48,-.48],[-.48,.48],[.48,.48]],5:[[-.48,-.48],[.48,-.48],[0,0],[-.48,.48],[.48,.48]],6:[[-.48,-.52],[.48,-.52],[-.48,0],[.48,0],[-.48,.52],[.48,.52]]})[Math.max(1,Math.min(6,Number(value)||1))];}
 function facePips(value,face){const [ox,oy,slant]=face==='left'?[36,70,1]:[84,70,-1];return pipPoints(value).map(([u,v])=>`<circle class="d6-pip" cx="${(ox+u*23).toFixed(1)}" cy="${(oy+slant*u*13+v*22).toFixed(1)}" r="4.2"/>`).join('');}
 function d6Svg(shown){const value=Math.max(1,Math.min(6,Number(shown)||1)),unknown=shown==='?';return `<svg class="d6-svg" viewBox="0 0 120 120" aria-hidden="true"><polygon class="d6-face d6-top" points="60,7 108,33 60,59 12,33"/><polygon class="d6-face d6-left" points="12,33 60,59 60,113 12,86"/><polygon class="d6-face d6-right" points="108,33 60,59 60,113 108,86"/><path class="d6-edge" d="M60 7 108 33 108 86 60 113 12 86 12 33Z M60 59V113"/>${unknown?'<text class="d6-number" x="84" y="73" text-anchor="middle" dominant-baseline="middle">?</text>':facePips(value,'left')+facePips(value,'right')}<text class="d6-face-label" x="60" y="30" text-anchor="middle">d6</text></svg>`;}
 function d8Svg(shown){const unknown=shown==='?',value=unknown?'?':String(shown);return `<svg class="d8-svg" viewBox="0 0 120 120" aria-hidden="true"><polygon class="d8-face d8-top-left" points="60,6 8,42 60,66"/><polygon class="d8-face d8-top-right" points="60,6 112,42 60,66"/><polygon class="d8-face d8-bottom-left" points="8,42 60,66 60,114"/><polygon class="d8-face d8-bottom-right" points="112,42 60,66 60,114"/><path class="d8-edge" d="M60 6 112 42 60 114 8 42Z M8 42H112 M60 66V114"/><text class="d8-number" x="60" y="57" text-anchor="middle" dominant-baseline="middle">${value}</text></svg>`;}
 function fallbackSvg(shown,sides=6){return sides===8?d8Svg(shown):d6Svg(shown);}
 function d20(value='?',sides=20,index=0,preview=false){const wrap=document.createElement('div');wrap.className='die-wrap';const die=document.createElement('div');die.className='die-3d'+(preview?' preview':'');die.dataset.sides=sides;die.dataset.value=value;die.style.setProperty('--roll-delay',`${index*110}ms`);die.style.setProperty('--settle-rotation',`${((Number(value)||index+1)*17)%28-14}deg`);const shown=preview?'?':String(value);die.innerHTML=sides===20?icoSvg(shown):fallbackSvg(shown,sides);wrap.append(die);const caption=document.createElement('small');caption.textContent='d'+sides;wrap.append(caption);return wrap;}
 function show({title,detail='',optional=false,resolve,auto=false,autoAdvance=false,combat=false,previewDice=[],attack=false}){
  if(active)return Promise.resolve(null);active=true;$('dice-auto-setting').hidden=!combat;
  return new Promise(done=>{let phase='ready',outcome=null,timer=null;
   $('dice-title').textContent=title;$('dice-detail').textContent=detail;$('dice-result').textContent='';
   const previews=Array.isArray(previewDice)&&previewDice.length?previewDice:[{sides:20}];
   $('dice-tray').replaceChildren(...previews.map((d,index)=>{const wrap=d20('?',Number(d?.sides)||20,index,true);if(d?.label)wrap.querySelector('small').textContent=d.label;return wrap;}));
   const go=$('dice-roll'),exit=$('dice-exit');go.hidden=false;go.disabled=false;go.textContent='Tirar dados';exit.hidden=!optional;exit.textContent='Salir sin tirar';
   function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(timer);dialog.classList.remove('rolling','attack-roll','attack-hit','attack-miss');phase='closed';dialog.close();active=false;done(value);}
   function scheduleAdvance(){if(phase!=='result')return;clearTimeout(timer);go.hidden=false;if(combat?window.CenizasPreferences.auto:autoAdvance)timer=setTimeout(()=>finish(outcome),combat?5000:3000);else go.focus();}
   window.addEventListener('battle-auto-change',scheduleAdvance);
   function reveal(){if(phase!=='rolling')return;clearTimeout(timer);phase='result';dialog.classList.remove('rolling');$('dice-tray').replaceChildren();
    for(const [index,d] of (outcome.dice||[]).entries()){const wrap=d20(d.value,d.sides,index);if(d.label)wrap.querySelector('small').textContent=d.label;$('dice-tray').append(wrap);}
    if(!outcome.dice?.length)$('dice-tray').textContent='✓';$('dice-result').textContent=outcome.summary||'';dialog.classList.toggle('attack-miss',/fallo|no supera/i.test(outcome.summary||''));dialog.classList.toggle('attack-hit',!dialog.classList.contains('attack-miss')&&!!outcome.dice?.length);go.disabled=false;go.textContent='Continuar';scheduleAdvance();
   }
   function begin(){if(phase!=='ready')return;phase='rolling';exit.hidden=true;go.disabled=true;go.textContent='Tirando…';
    try{outcome=resolve();}catch(e){phase='result';$('dice-result').textContent='No se pudo resolver la tirada. Cierra y vuelve a intentarlo.';go.disabled=false;go.textContent='Cerrar';return;}
    dialog.classList.add('rolling');timer=setTimeout(reveal,matchMedia('(prefers-reduced-motion: reduce)').matches?80:(autoAdvance?450:1100));
   }
   go.onclick=()=>phase==='ready'?begin():phase==='result'?finish(outcome):null;exit.onclick=()=>{if(phase==='ready'&&optional)finish(null);};
   dialog.oncancel=e=>{e.preventDefault();if(phase==='ready'&&optional)finish(null);};
   dialog.classList.toggle('attack-roll',!!attack);dialog.showModal();
   // Dice stay in the waiting animation until the player explicitly launches them.
   go.focus();
  });
 }
 return {show};
})();
