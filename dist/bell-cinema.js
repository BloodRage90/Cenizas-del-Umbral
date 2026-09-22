/* A replayable reconstruction, isolated from campaign/combat state. */
(function(root){
'use strict';
const beats=[
 {title:'Las huellas del carro',text:'Ordan reconoce el sello: la Vigilia bajaba esta campana desde el Umbral. Las marcas de las ruedas permiten reconstruir el accidente.',duration:5200},
 {title:'La carga se suelta',text:'Al tomar la curva, el eje cedió. El carro se inclinó y la cuerda ya no sostuvo el peso del bronce.',duration:4200},
 {title:'El golpe',text:'La campana cayó del carro, rodó hasta el borde del sendero y golpeó la piedra. El bronce se abrió.',duration:4600},
 {title:'Lo que quedó dentro',text:'El carro fue retirado. La campana quedó abandonada, pero un fragmento conservó el vínculo con el Coro: por eso aún podía repetir voces.',duration:5200},
 {title:'De vuelta en el sendero',text:'Elara observa la grieta. «No nos estaba llamando una persona. Era lo que quedó atrapado en ese metal».',duration:2400}
];
const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
function frame(index,elapsed){const t=clamp(elapsed/beats[index].duration),q=smooth(t);
 if(index===0)return {cart:0,cx:mix(1050,695,q),cy:mix(368,487,q),bell:false,glow:0,present:false};
 if(index===1)return {cart:t<.4?0:1,cx:695,cy:487,tilt:Math.sin(t*Math.PI)*.13,bell:t>=.4,bx:mix(700,730,clamp((t-.4)/.6)),by:mix(457,480,clamp((t-.4)/.6)),rotation:0,glow:0,present:false};
 if(index===2){const impact=t>=.8;return {cart:1,cx:695,cy:487,bell:true,broken:impact,bx:mix(730,805,Math.min(1,t/.8)),by:mix(480,525,Math.min(1,t/.8))-Math.sin(Math.min(1,t/.8)*Math.PI)*22,rotation:impact?0:Math.sin(t*Math.PI*3)*.2,shake:impact?Math.sin(t*130)*Math.max(0,1-(t-.8)/.15)*4:0,glow:0,present:false};}
 if(index===3)return {cart:1,cx:695,cy:487,cartAlpha:1-clamp(t*3),bell:true,broken:true,bx:805,by:525,rotation:0,glow:Math.sin(t*Math.PI)**2,present:false};
 return {present:true,glow:0};
}
let busy=false;
async function show(){
 if(busy)return false;busy=true;
 const dialog=document.createElement('dialog');dialog.className='bell-cinema';dialog.setAttribute('aria-labelledby','bell-cinema-title');
 dialog.innerHTML='<div class="bell-cinema-view"><canvas aria-label="Reconstrucción animada del accidente de la campana"></canvas><small>LA CAMPANA DEL PASO · RECONSTRUCCIÓN DE ORDAN</small></div><div class="bell-cinema-caption"><small class="bell-cinema-step"></small><h2 id="bell-cinema-title"></h2><p aria-live="polite"></p><div><button data-pause>Pausar</button><button data-next disabled>Preparando escena…</button><button data-leave>Volver al juego</button></div></div>';
 document.body.append(dialog);dialog.showModal();
 const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),title=dialog.querySelector('h2'),caption=dialog.querySelector('p'),next=dialog.querySelector('[data-next]'),pause=dialog.querySelector('[data-pause]'),leave=dialog.querySelector('[data-leave]');
 let index=0,elapsed=0,last=null,raf=0,paused=false,finished=false,done;
 const result=new Promise(r=>done=r),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function finish(value){if(finished)return;finished=true;cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);dialog.close();dialog.remove();busy=false;done(value);}
 let focused=document.hasFocus();const blur=()=>{focused=false;last=null},focus=()=>{focused=true;last=null},visibility=()=>{last=null};
 document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);window.addEventListener('focus',focus);
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false)});leave.onclick=()=>finish(false);
 const load=src=>new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>reject(new Error('timeout')),20000);im.onload=()=>{clearTimeout(timer);resolve(im)};im.onerror=()=>{clearTimeout(timer);reject(new Error('asset'))};im.src=src;});
 try{
  const loaded=await Promise.race([Promise.all([load('scenes/montana-before-bell.png'),load('bell-cinema-atlas.png'),load('scenes/montana.png')]),result.then(()=>null)]);if(finished||!loaded)return result;const [ground,atlas,present]=loaded;
  const drawSprite=(cell,x,y,width,angle=0,alpha=1)=>{const sw=atlas.width/2,sh=atlas.height/2,height=width*sh/sw;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(atlas,(cell%2)*sw,Math.floor(cell/2)*sh,sw,sh,-width/2,-height*.82,width,height);ctx.restore();};
  function draw(){const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const f=frame(index,reduced?beats[index].duration:elapsed),scale=Math.max(w/1100,h/650),cx=index===0?mix(990,790,smooth(clamp(elapsed/beats[0].duration))):790,cy=475;
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(scale,0,0,scale,w/2-cx*scale+(reduced?0:f.shake||0),h/2-cy*scale);ctx.drawImage(f.present?present:ground,0,0,1536,1024);
   if(f.cart!==undefined)drawSprite(f.cart,f.cx,f.cy,205,f.tilt||0,f.cartAlpha??1);
   if(f.bell)drawSprite(f.broken?3:2,f.bx,f.by,146,f.rotation||0);
   if(f.glow){ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(802,498,2,802,498,65);g.addColorStop(0,'rgba(132,200,255,'+f.glow*.6+')');g.addColorStop(1,'rgba(132,200,255,0)');ctx.fillStyle=g;ctx.fillRect(735,430,140,140);ctx.restore();}
  }
  function announce(){title.textContent=beats[index].title;caption.textContent=beats[index].text;dialog.querySelector('.bell-cinema-step').textContent=`${index+1} / ${beats.length}`;next.disabled=true;next.textContent='La escena continúa…';pause.disabled=false;pause.textContent='Pausar';paused=false;last=null;}
  next.onclick=()=>{if(elapsed<beats[index].duration)return;if(index===beats.length-1){finish(true);return;}index++;elapsed=0;announce();draw();};
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Reanudar':'Pausar';last=null;};
  function tick(now){if(finished)return;if(last!==null&&!paused&&focused&&!document.hidden)elapsed=Math.min(beats[index].duration,elapsed+Math.min(100,now-last));last=now;draw();if(elapsed>=beats[index].duration){next.disabled=false;next.textContent=index===beats.length-1?'Volver al presente':'Continuar';pause.disabled=true;}raf=requestAnimationFrame(tick);}
  announce();raf=requestAnimationFrame(tick);
 }catch{if(!finished){title.textContent='No se pudo cargar la escena';caption.textContent='Vuelve al juego e inténtalo otra vez. Tu avance se conserva.';pause.hidden=true;next.hidden=true;}}
 return result;
}
const api={beats,frame,show};if(typeof module!=='undefined'&&module.exports)module.exports={beats,frame};else root.CenizasBellCinema=api;
})(typeof window!=='undefined'?window:globalThis);
