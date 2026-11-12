'use strict';
(()=>{
const $=id=>document.getElementById(id),menu=$('main-menu'),intro=$('intro-cinema'),video=$('intro-video'),film=document.querySelector('.intro-film'),status=$('menu-status');
if(!menu)return;
const introSlot=menu.querySelector('.menu-video-slot');if(introSlot)introSlot.innerHTML='<span>PRÓLOGO DISPONIBLE</span><b>La carta sellada · El llamado</b><small>Juego nuevo abre el viaje de Elara, Ordan, Iria y Darien.</small>';
const introCopy=document.querySelector('.intro-copy p');if(introCopy)introCopy.textContent='Una carta sin remitente conserva una ceniza que nunca se enfría. Elara, Ordan, Iria y Darien siguen rastros distintos hacia la misma campana.';
function hasSave(){try{const bridge=window.CenizasBridge;if(bridge?.hasSave)return bridge.hasSave();const c=JSON.parse(localStorage.getItem('cenizas-character-v1')||'null'),p=JSON.parse(localStorage.getItem('cenizas-valdara-v1')||'null');return Boolean(c?.name?.trim()&&c.race&&c.class&&c.subclass&&c.gender&&p&&Number.isInteger(p.stage));}catch{return false}}
function refresh(){const button=$('continue-game'),saved=hasSave();button.disabled=!saved;button.setAttribute('aria-disabled',String(!saved));if(!saved)status.textContent='No hay una partida guardada todavía.';else status.textContent='Partida encontrada en este dispositivo.';}
function closeMenu(){menu.dataset.active='false';menu.setAttribute('aria-hidden','true');}
function showIntro(done){let finished=false;const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);video.onended=null;video.onerror=null;intro.hidden=true;film.classList.remove('video-ready');window.CenizasMusic?.set('exploration');done();};const timer=setTimeout(finish,22000);intro.hidden=false;video.currentTime=0;video.onloadeddata=()=>film.classList.add('video-ready');video.onerror=()=>film.classList.remove('video-ready');video.onended=finish;video.play().catch(()=>{});window.CenizasMusic?.enable?.();window.CenizasMusic?.set('intro');$('skip-intro').onclick=finish;}
function newGame(){closeMenu();showIntro(()=>window.CenizasBridge?.startNew?.());}
function continueGame(){closeMenu();window.CenizasBridge?.continueGame?.();}
$('new-game').onclick=newGame;$('continue-game').onclick=continueGame;$('exit-game').onclick=()=>{status.textContent='Puedes cerrar esta pestaña cuando quieras. Tu progreso guardado permanecerá en este dispositivo.';try{window.close();}catch{}};
refresh();window.CenizasMenu={refresh,showIntro};window.addEventListener('storage',refresh);window.addEventListener('pageshow',refresh);
})();
