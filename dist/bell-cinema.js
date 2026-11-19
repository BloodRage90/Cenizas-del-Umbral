/* A replayable reconstruction, isolated from campaign/combat state. */
(function(root){
'use strict';
const beats=[
 {title:'Las huellas del carro',text:'Ordan reconoce el sello: la Vigilia bajaba esta campana desde el Umbral. Las marcas de las ruedas permiten reconstruir el accidente.',duration:6500},
 {title:'La carga se suelta',text:'Al tomar la curva, el eje cedió. El carro se inclinó y la cuerda ya no sostuvo el peso del bronce.',duration:4800},
 {title:'El golpe',text:'La campana cayó del carro, rodó hasta el borde del sendero y golpeó la piedra. El bronce se abrió.',duration:6200},
 {title:'Lo que quedó dentro',text:'El carro fue retirado. La campana quedó abandonada, pero un fragmento conservó el vínculo con el Coro: por eso aún podía repetir voces.',duration:6500},
 {title:'De vuelta en el sendero',text:'Elara observa la grieta. «No nos estaba llamando una persona. Era lo que quedó atrapado en ese metal».',duration:3200}
];
const clamp=n=>Math.max(0,Math.min(1,n)),mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
function frame(index,elapsed){
 const t=clamp(elapsed/beats[index].duration),q=smooth(t),base={glow:0,present:false,zoom:1,camX:790,camY:450};
 if(index===0)return {...base,cart:0,cx:mix(1050,695,q),cy:mix(368,487,q),bounce:Math.sin(q*72)*1.8*Math.sin(t*Math.PI),tilt:Math.sin(q*45)*.018*Math.sin(t*Math.PI),wheel:q*15,bell:false,camX:mix(990,755,q),camY:mix(355,453,q),zoom:mix(.85,1.4,q),dust:Math.sin(t*Math.PI)*.45};
 if(index===1){const release=clamp((t-.48)/.52),r=smooth(release);return {...base,cart:t<.48?0:1,cartBlend:clamp((t-.44)/.15),cx:695,cy:487,tilt:t<.48?-.13*Math.sin(t/.48*Math.PI/2):mix(-.13,-.06,r),wheel:15+Math.min(t,.48)*2,bell:t>=.44,bellAlpha:clamp((t-.44)/.15),bx:mix(710,730,r),by:mix(449,480,r)-Math.sin(r*Math.PI)*18,rotation:mix(-.12,.22,r),detached:t>.48,detach:release,camX:mix(755,730,q),camY:mix(453,455,q),zoom:mix(1.4,1.9,q),dust:Math.sin(t*Math.PI)*.4};}
 if(index===2){const k=t<.36?t/.36*.48:t<.62?.48+(t-.36)/.26*.29:t<.82?.77+(t-.62)/.2*.23:1;
 const arc=t<.36?Math.sin(t/.36*Math.PI)*48:t<.62?Math.sin((t-.36)/.26*Math.PI)*21:t<.82?Math.sin((t-.62)/.2*Math.PI)*8:0;
 const hit=t>=.82,settle=clamp((t-.82)/.18);
 return {...base,cart:1,cx:695,cy:487,tilt:-.06,detached:true,detach:1,bell:true,broken:hit,bx:mix(730,805,k),by:mix(480,525,k)-arc,groundY:mix(480,525,k),rotation:hit?Math.sin(settle*14)*.09*(1-settle):.22+Math.sin(k*Math.PI*3)*.5,shake:hit?Math.sin(settle*80)*Math.exp(-settle*7)*7:0,impact:hit?settle:null,dust:hit?1-settle:0,camX:mix(730,790,smooth(k)),camY:mix(455,483,smooth(k)),zoom:mix(1.9,2.15,q)};}
 if(index===3)return {...base,cart:1,cx:695,cy:487,tilt:-.06,detached:true,detach:1,cartAlpha:1-clamp(t*3),bell:true,broken:true,bx:805,by:525,rotation:0,glow:Math.sin(t*Math.PI)**2,camX:mix(790,802,q),camY:mix(483,495,q),zoom:mix(2.15,2.35,q),dust:(1-t)*.2};
 return {...base,present:true,camX:mix(802,790,q),camY:mix(495,475,q),zoom:mix(2.35,1.05,q),returnBlend:smooth(clamp(t*2))};
}
function soundEvents(index,from,to){return [[],[[2304,'wood']],[[2232,'bounce'],[3844,'bounce'],[5084,'impact']],[[1000,'echo']],[]][index].filter(([at])=>at>from&&at<=to).map(([,kind])=>kind);}
let busy=false;
async function show(){
 if(busy)return false;busy=true;
 const dialog=document.createElement('dialog');dialog.className='bell-cinema';dialog.setAttribute('aria-labelledby','bell-cinema-title');
 dialog.innerHTML='<div class="bell-cinema-view"><canvas aria-label="Reconstrucción animada del accidente de la campana"></canvas><small>LA CAMPANA DEL PASO · RECONSTRUCCIÓN DE ORDAN</small></div><div class="bell-cinema-caption"><small class="bell-cinema-step"></small><h2 id="bell-cinema-title"></h2><p aria-live="polite"></p><div><button data-pause>Pausar</button><button data-sound aria-pressed="false">Sonido: no</button><button data-next disabled>Preparando escena…</button><button data-leave>Volver al juego</button></div></div>';
 document.body.append(dialog);dialog.showModal();
 const canvas=dialog.querySelector('canvas'),ctx=canvas.getContext('2d'),title=dialog.querySelector('h2'),caption=dialog.querySelector('p'),next=dialog.querySelector('[data-next]'),pause=dialog.querySelector('[data-pause]'),leave=dialog.querySelector('[data-leave]'),sound=dialog.querySelector('[data-sound]');
 let index=0,elapsed=0,last=null,raf=0,paused=false,finished=false,done,audio=null,soundOn=false;
 try{soundOn=localStorage.getItem('cenizas-cinema-sound')==='true';}catch{/* optional storage/API unavailable; safe fallback */}
 function updateSound(){sound.textContent=soundOn?'Sonido: sí':'Sonido: no';sound.setAttribute('aria-pressed',String(soundOn));}updateSound();
 function tone(kind){if(!soundOn||document.hidden||!focused)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});const at=audio.currentTime,gain=audio.createGain();gain.gain.value=.075;gain.connect(audio.destination);
 const notes=kind==='wood'?[95,173,241]:kind==='bounce'?[180,431,733]:kind==='impact'?[116,271,539,837,1250]:[164,247,493],length=kind==='echo'?2.5:kind==='impact'?2:kind==='bounce'?.65:.28;
 notes.forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type=kind==='wood'?'triangle':'sine';o.frequency.setValueAtTime(hz,at);o.frequency.exponentialRampToValueAtTime(hz*.94,at+length);g.gain.setValueAtTime(.001,at);g.gain.linearRampToValueAtTime(1/(i+1),at+.008);g.gain.exponentialRampToValueAtTime(.001,at+length);o.connect(g);g.connect(gain);o.start(at);o.stop(at+length+.03);});setTimeout(()=>gain.disconnect(),(length+.2)*1000);
 }catch{soundOn=false;updateSound();}}
 function audioPause(){audio?.suspend().catch(()=>{});}function audioResume(){if(soundOn&&!paused&&!document.hidden&&focused)audio?.resume().catch(()=>{});}
 sound.onclick=()=>{soundOn=!soundOn;updateSound();try{localStorage.setItem('cenizas-cinema-sound',String(soundOn));}catch{/* optional storage/API unavailable; safe fallback */}if(soundOn&&!paused)tone('echo');else audioPause();};
 const result=new Promise(r=>done=r),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function finish(value){if(finished)return;finished=true;cancelAnimationFrame(raf);audio?.close().catch(()=>{});document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);window.removeEventListener('focus',focus);dialog.close();dialog.remove();busy=false;done(value);}
 let focused=document.hasFocus();const blur=()=>{focused=false;last=null;audioPause()},focus=()=>{focused=true;last=null;audioResume()},visibility=()=>{last=null;if(document.hidden)audioPause();else audioResume()};
 document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);window.addEventListener('focus',focus);
 dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false)});leave.onclick=()=>finish(false);
 const load=src=>new Promise((resolve,reject)=>{const im=new Image(),timer=setTimeout(()=>reject(new Error('timeout')),20000);im.onload=()=>{clearTimeout(timer);resolve(im)};im.onerror=()=>{clearTimeout(timer);reject(new Error('asset'))};im.src=src;});
 try{
  const loaded=await Promise.race([Promise.all([load('scenes/montana-before-bell.webp'),load('bell-cinema-atlas.png'),load('scenes/montana.webp')]),result.then(()=>null)]);if(finished||!loaded)return result;const [ground,atlas,present]=loaded;
  const sw=atlas.width/2,sh=atlas.height/2;
  function wheel(x,y,size,angle,alpha=1,inner=false){ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.scale(.69,1);ctx.rotate(angle);ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.clip();const crop=inner?[541,265,132,179]:[495,229,191,247];ctx.drawImage(atlas,...crop,-size/2,-size/2,size,size);ctx.restore();}
  function cart(f){const k=245/sw;ctx.save();ctx.globalAlpha=f.cartAlpha??1;ctx.translate(f.cx,f.cy+(f.bounce||0));ctx.rotate(f.tilt||0);ctx.scale(k,k);ctx.translate(-sw/2,-sh*.82);
   const draw=(cell,alpha)=>{ctx.save();ctx.globalAlpha*=alpha;if(cell===1){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(sw,0);ctx.lineTo(sw,245);ctx.lineTo(565,300);ctx.lineTo(530,sh);ctx.lineTo(0,sh);ctx.closePath();ctx.clip();}ctx.drawImage(atlas,cell*sw,0,sw,sh,0,0,sw,sh);ctx.restore();};
   if(f.cartBlend!==undefined){draw(0,1-f.cartBlend);draw(1,f.cartBlend);}else draw(f.cart,1);
   if(f.cart===0&&!(f.cartBlend>0))wheel(610,355,178,f.wheel||0,1,true);ctx.restore();
   if(f.detached&&(f.cartAlpha??1)>0){const d=smooth(f.detach);wheel(mix(721,745,d),mix(473,550,d)-Math.sin(d*Math.PI)*20,49,d*7,f.cartAlpha??1);}
  }
  function bell(f,alpha=1){const width=170,height=width*sh/sw;ctx.save();ctx.globalAlpha=alpha*(f.bellAlpha??1);ctx.translate(f.bx,f.by);ctx.rotate(f.rotation||0);ctx.drawImage(atlas,(f.broken?1:0)*sw,sh,sw,sh,-width/2,-height*.82,width,height);ctx.restore();}
  const particles=Array.from({length:38},(_,i)=>({angle:i*2.399,speed:12+(i*17%49),size:1+(i%5),lift:12+(i*13%25)}));
  function dust(x,y,amount,time){if(amount<=0)return;ctx.save();for(const [i,p]of particles.entries()){const age=((time/1300+i*.137)%1),alpha=(1-age)*amount*.25;ctx.fillStyle=`rgba(207,178,133,${alpha})`;ctx.beginPath();ctx.ellipse(x+Math.cos(p.angle)*age*p.speed,y+Math.sin(p.angle)*age*p.speed*.35-age*p.lift,p.size*(1+age*2),p.size*(.6+age),0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  function debris(f){if(f.impact===null||f.impact===undefined)return;const t=f.impact;ctx.save();ctx.globalAlpha=1-clamp(t*1.2);for(let i=0;i<7;i++){const a=i*2.4,speed=20+i*8,x=805+Math.cos(a)*speed*t,y=525+Math.sin(a)*speed*t*.3-Math.sin(t*Math.PI)*(18+i*4);ctx.save();ctx.translate(x,y);ctx.rotate(t*(i+2));ctx.drawImage(atlas,916,823,49,46,-4,-4,8,8);ctx.restore();}ctx.restore();}
  function draw(){const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2),w=Math.max(1,Math.round(box.width*dpr)),h=Math.max(1,Math.round(box.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const f=frame(index,reduced?beats[index].duration:elapsed),scale=Math.max(w/1100,h/650)*(reduced?1.35:f.zoom);
   ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(scale,0,0,scale,w/2-f.camX*scale+(reduced?0:f.shake||0),h/2-f.camY*scale);ctx.drawImage(ground,0,0,1536,1024);
   if(f.cart!==undefined){ctx.save();ctx.fillStyle='rgba(5,11,15,'+(.2*(f.cartAlpha??1))+')';ctx.beginPath();ctx.ellipse(f.cx,f.cy+10,83,20,-.15,0,Math.PI*2);ctx.fill();ctx.restore();cart(f);}
   if(f.bell){{ctx.save();ctx.fillStyle='rgba(5,11,15,.23)';ctx.beginPath();ctx.ellipse(f.bx,(f.groundY||f.by)+9,45,12,0,0,Math.PI*2);ctx.fill();ctx.restore();}bell(f);}
   if(!reduced){dust(f.bx||f.cx,f.groundY||f.cy,f.dust||0,elapsed);debris(f);}
   if(f.glow){ctx.save();ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(802,498,2,802,498,85);g.addColorStop(0,'rgba(132,200,255,'+f.glow*.65+')');g.addColorStop(1,'rgba(132,200,255,0)');ctx.fillStyle=g;ctx.fillRect(710,405,185,185);ctx.restore();}
   if(f.present){bell({bx:805,by:525,broken:true},1-f.returnBlend);ctx.save();ctx.globalAlpha=f.returnBlend;ctx.drawImage(present,0,0,1536,1024);ctx.restore();}
   ctx.setTransform(1,0,0,1,0,0);const v=ctx.createRadialGradient(w*.5,h*.48,Math.min(w,h)*.25,w*.5,h*.48,Math.max(w,h)*.72);v.addColorStop(0,'rgba(8,13,24,0)');v.addColorStop(1,'rgba(8,13,24,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(7,12,20,.65)';ctx.fillRect(0,0,w,h*.045);ctx.fillRect(0,h*.955,w,h*.045);
  }
  function announce(){title.textContent=beats[index].title;caption.textContent=beats[index].text;dialog.querySelector('.bell-cinema-step').textContent=`${index+1} / ${beats.length}`;next.disabled=true;next.textContent='La escena continúa…';pause.disabled=false;pause.textContent='Pausar';paused=false;last=null;}
  next.onclick=()=>{if(elapsed<beats[index].duration)return;if(index===beats.length-1){finish(true);return;}index++;elapsed=0;announce();draw();};
  pause.onclick=()=>{paused=!paused;pause.textContent=paused?'Reanudar':'Pausar';last=null;if(paused)audioPause();else audioResume();};
  function tick(now){if(finished)return;if(last!==null&&!paused&&focused&&!document.hidden){const before=elapsed;elapsed=Math.min(beats[index].duration,elapsed+Math.min(100,now-last));for(const event of soundEvents(index,before,elapsed))tone(event);}last=now;draw();if(elapsed>=beats[index].duration){next.disabled=false;next.textContent=index===beats.length-1?'Volver al presente':'Continuar';pause.disabled=true;}raf=requestAnimationFrame(tick);}
  announce();raf=requestAnimationFrame(tick);
 }catch{if(!finished){title.textContent='No se pudo cargar la escena';caption.textContent='Vuelve al juego e inténtalo otra vez. Tu avance se conserva.';pause.hidden=true;next.hidden=true;}}
 return result;
}
const api={beats,frame,show};if(typeof module!=='undefined'&&module.exports)module.exports={beats,frame,soundEvents};else root.CenizasBellCinema=api;
})(typeof window!=='undefined'?window:globalThis);
