/* One timing attempt per action. Timing uses active foreground time. */
window.CenizasBattleScene=(()=>{
const $=id=>document.getElementById(id);let busy=false;
function show({title,room,kind,party='hero',defense=false,optional=false,automatic=false,action='attack',resolve}){
 if(busy)return Promise.resolve(null);busy=true;
 return new Promise(done=>{
 const dialog=$('duel'),stage=$('duel-stage'),go=$('duel-go'),exit=$('duel-exit'),tap=$('duel-tap'),mode=$('duel-mode');
 let phase='ready',elapsed=0,last=0,raf=0,result=null,advanceTimer=null;
 $('duel-title').textContent=title;stage.style.backgroundImage=`linear-gradient(#07191270,#071912b0),url(scenes/${room==='plaza'?'plaza-forest':room}.png)`;
 stage.className=defense?'defensive':'';const actor=$('duel-party');actor.replaceChildren();
 actor.append(window.CenizasBattleVisuals.art(party,kind));const enemy=$('duel-enemy');enemy.replaceChildren(window.CenizasBattleVisuals.art('enemy',kind));
 $('duel-feedback').textContent=defense?'Esquivar: ventana amplia, mitad del daño. Parar: ventana estrecha, evita el daño. Si fallas, se aplican las tiradas normales.':'Pulsa al cruzar la franja dorada: +2 al ataque; el proyectil mágico obtiene +1 de daño. Fallar no penaliza la tirada.';
 mode.hidden=!defense;mode.value='dodge';go.hidden=false;go.textContent=defense?'Prepararme':'Tirar dados y atacar';exit.hidden=!optional;tap.hidden=true;$('timing').hidden=true;
 function finish(value){window.removeEventListener('battle-auto-change',scheduleAdvance);clearTimeout(advanceTimer);cancelAnimationFrame(raf);document.removeEventListener('keydown',key);dialog.close();busy=false;done(value);}
 function scheduleAdvance(){if(phase!=='result')return;clearTimeout(advanceTimer);go.hidden=false;go.textContent='Continuar';if(window.CenizasPreferences.auto)advanceTimer=setTimeout(()=>finish(result),5000);else go.focus();}
 window.addEventListener('battle-auto-change',scheduleAdvance);
 function grade(){const width=defense?(mode.value==='parry'?.055:.15):.11;return Math.abs(elapsed/1800-.7)<=width;}
 async function strike(){if(phase!=='timing')return;phase='animating';cancelAnimationFrame(raf);tap.hidden=true;const success=!automatic&&grade();stage.classList.remove('windup');$('timing').hidden=true;$('duel-feedback').textContent=defense?'Llega el golpe…':action==='missile'?'La magia atraviesa el campo…':'El ataque alcanza su objetivo…';
 try{result=await window.CenizasBattleVisuals.sequence(stage,actor,enemy,{defense,success,magic:action==='missile',impact:()=>resolve({precision:!defense&&success,defense:defense&&success?mode.value:null})});}
 catch(error){$('duel-feedback').textContent='No se pudo completar la animación.';phase='result';go.hidden=false;go.textContent='Volver';go.onclick=()=>finish(result);return;}
 phase='result';$('duel-feedback').textContent=(success?(defense?(mode.value==='parry'?'¡Parada perfecta!':'¡Esquiva!'):'¡Ataque preciso!'):'Acción resuelta.')+'\n'+(result?.summary||'');scheduleAdvance();
 }
 function frame(now){if(phase!=='timing')return;if(last&&!document.hidden&&document.hasFocus())elapsed+=Math.min(now-last,80);last=now;$('timing-marker').style.left=Math.min(100,elapsed/18)+'%';if(elapsed>=(automatic?2800:1800))strike();else raf=requestAnimationFrame(frame);}
 go.onclick=()=>{if(phase==='result'){finish(result);return;}if(phase!=='ready')return;phase='timing';go.hidden=true;exit.hidden=true;mode.disabled=true;$('timing').hidden=false;tap.hidden=false;tap.textContent=defense?(mode.value==='parry'?'Parar · Espacio':'Esquivar · Espacio'):'Golpear · Espacio';const width=defense?(mode.value==='parry'?5.5:15):11;$('timing-zone').style.left=(70-width)+'%';$('timing-zone').style.width=width*2+'%';stage.classList.add('windup');window.CenizasBattleVisuals.pose((defense?enemy:actor).firstChild,'windup');tap.focus();raf=requestAnimationFrame(frame);};
 tap.onclick=strike;exit.onclick=()=>{if(phase==='ready'&&optional)finish(null);};dialog.oncancel=e=>{e.preventDefault();if(phase==='ready'&&optional)finish(null);};
 function key(e){if(!automatic&&e.code==='Space'&&phase==='timing'){e.preventDefault();if(!e.repeat)strike();}}
 document.addEventListener('keydown',key);mode.disabled=false;dialog.showModal();if(automatic){phase='timing';go.hidden=true;exit.hidden=true;tap.hidden=true;$('timing').hidden=true;$('duel-feedback').textContent='Elara prepara su ataque…';stage.classList.add('windup');window.CenizasBattleVisuals.pose(actor.firstChild,'windup');raf=requestAnimationFrame(frame);}else go.focus();
 });
}
return {show};
})();
