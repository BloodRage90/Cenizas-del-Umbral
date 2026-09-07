/* One timing attempt per action. Timing uses active foreground time. */
window.CenizasBattleScene=(()=>{
const $=id=>document.getElementById(id);let busy=false;
function show({title,room,kind,party='hero',defense=false,optional=false,resolve}){
 if(busy)return Promise.resolve(null);busy=true;
 return new Promise(done=>{
 const dialog=$('duel'),stage=$('duel-stage'),go=$('duel-go'),exit=$('duel-exit'),tap=$('duel-tap'),mode=$('duel-mode');
 let phase='ready',elapsed=0,last=0,raf=0,result=null,advanceTimer=null;
 $('duel-title').textContent=title;stage.style.backgroundImage=`linear-gradient(#07191270,#071912b0),url(scenes/${room}.png)`;
 stage.className=defense?'defensive':'';const actor=$('duel-party');actor.replaceChildren();
 const art=document.createElement(party==='hero'?'div':'img');if(party==='hero')art.className='hero-sprite';else{art.src='guard.png';art.alt='Elara';}actor.append(art);
 $('duel-enemy').src=kind==='custodian'?'custodian.png':'echo.png';
 $('duel-feedback').textContent=defense?'Esquivar: ventana amplia, mitad del daño. Parar: ventana estrecha, evita el daño. Si fallas, se aplican las tiradas normales.':'Pulsa al cruzar la franja dorada: +2 al ataque; el proyectil mágico obtiene +1 de daño. Fallar no penaliza la tirada.';
 mode.hidden=!defense;mode.value='dodge';go.hidden=false;go.textContent=defense?'Prepararme':'Tirar dados y atacar';exit.hidden=!optional;tap.hidden=true;$('timing').hidden=true;
 function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(advanceTimer);cancelAnimationFrame(raf);document.removeEventListener('keydown',key);dialog.close();busy=false;done(value);}
 function scheduleAdvance(){if(phase!=='result')return;clearTimeout(advanceTimer);go.hidden=false;go.textContent='Continuar';if(window.CenizasPreferences.auto)advanceTimer=setTimeout(()=>finish(result),3000);else go.focus();}
 window.addEventListener('battle-auto-change',scheduleAdvance);
 function grade(){const width=defense?(mode.value==='parry'?.055:.15):.11;return Math.abs(elapsed/1800-.7)<=width;}
 function strike(){if(phase!=='timing')return;phase='result';cancelAnimationFrame(raf);tap.hidden=true;const success=grade();stage.classList.remove('windup');stage.classList.add(defense?(success?'evade':'enemy-strike'):'party-strike');
 result=resolve({precision:!defense&&success,defense: defense&&success?mode.value:null});
 $('duel-feedback').textContent=(success?(defense?(mode.value==='parry'?'¡Parada perfecta!':'¡Esquiva!'):'¡Ataque preciso!'):'Se resuelve con las tiradas normales.')+'\n'+(result?.summary||'');$('timing').hidden=true;scheduleAdvance();
 }
 function frame(now){if(phase!=='timing')return;if(last&&!document.hidden&&document.hasFocus())elapsed+=Math.min(now-last,80);last=now;$('timing-marker').style.left=Math.min(100,elapsed/18)+'%';if(elapsed>=1800)strike();else raf=requestAnimationFrame(frame);}
 go.onclick=()=>{if(phase==='result'){finish(result);return;}if(phase!=='ready')return;phase='timing';go.hidden=true;exit.hidden=true;mode.disabled=true;$('timing').hidden=false;tap.hidden=false;tap.textContent=defense?(mode.value==='parry'?'Parar · Espacio':'Esquivar · Espacio'):'Golpear · Espacio';const width=defense?(mode.value==='parry'?5.5:15):11;$('timing-zone').style.left=(70-width)+'%';$('timing-zone').style.width=width*2+'%';stage.classList.add('windup');tap.focus();raf=requestAnimationFrame(frame);};
 tap.onclick=strike;exit.onclick=()=>{if(phase==='ready'&&optional)finish(null);};dialog.oncancel=e=>{e.preventDefault();if(phase==='ready'&&optional)finish(null);};
 function key(e){if(e.code==='Space'&&phase==='timing'){e.preventDefault();if(!e.repeat)strike();}}
 document.addEventListener('keydown',key);mode.disabled=false;dialog.showModal();go.focus();
 });
}
return {show};
})();
