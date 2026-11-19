/* Side-view attack director with an optional, accessible timing window. */
window.CenizasBattleScene=(()=>{
 const $=id=>document.getElementById(id),Visuals=window.CenizasBattleVisuals;let busy=false;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 function timingGate(stage,mode='off',windowMs=1350){
  if(!stage||mode==='off'||typeof stage.append!=='function')return Promise.resolve({timed:false});
  return new Promise(resolve=>{
   const panel=document.createElement('div');panel.className='timing-hit';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Ventana de golpe cronometrado');panel.innerHTML='<strong>¡GOLPEA EN EL PULSO!</strong><span class="timing-hit-track"><i></i></span><button type="button">Golpe preciso</button><button type="button" data-no-timing>Resolver sin timing</button><small>Espacio/Enter también funciona · puedes desactivarlo en Preferencias</small>';
   const precise=panel.querySelector('button:not([data-no-timing])'),skip=panel.querySelector('[data-no-timing]'),fill=panel.querySelector('i');let done=false,start=performance.now(),raf;
   const finish=timed=>{if(done)return;done=true;cancelAnimationFrame(raf);panel.remove();resolve({timed});};
   precise?.addEventListener('click',()=>finish(true));skip?.addEventListener('click',()=>finish(false));panel.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();finish(true);}});stage.append(panel);precise?.focus({preventScroll:true});
   const frame=now=>{if(done)return;const progress=Math.min(1,(now-start)/windowMs);if(fill)fill.style.width=(progress*100)+'%';if(progress>=1)finish(false);else raf=requestAnimationFrame(frame);};raf=requestAnimationFrame(frame);
  });
 }
 async function show({attacker='hero',target='enemy',action='attack',timing='off',timingWindow,resolve}){
  if(busy)return null;busy=true;
  const stage=$('battle-stage');
  const find=id=>stage?.querySelector(`[data-unit="${id}"]`);
  const from=find(attacker)||stage?.querySelector('.party-unit,.enemy-unit');
  const to=find(target)||stage?.querySelector('.enemy-unit,.party-unit');
  try{
   const configuredWindow=timingWindow||({short:900,standard:1350,wide:1800}[document.body?.dataset?.timingWindow]||1350);
   const timingResult=await timingGate(stage,timing,configuredWindow);
   stage?.classList.add('attack-cue');
   return await Visuals.sequence(stage,from,to,{magic:action==='missile'||action==='tech',impact:()=>resolve?.(timingResult)||{}});
  }finally{stage?.classList.remove('attack-cue');busy=false;}
 }
 return {show,timingGate,get busy(){return busy}};
})();
