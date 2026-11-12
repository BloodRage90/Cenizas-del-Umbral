const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');

const els=new Map();
function element(id){return els.get(id)||{id,hidden:false,dataset:{},style:{},classList:{add(){},remove(){}},setAttribute(){},querySelector(){return null}};}
for(const id of ['main-menu','intro-cinema','intro-video','skip-intro','start-intro-video','new-game','continue-game','exit-game','menu-status'])els.set(id,element(id));
const menu=els.get('main-menu');menu.dataset.active='true';menu.querySelector=selector=>selector==='.menu-video-slot'?element('menu-video-slot'):null;
els.set('menu-video-slot',element('menu-video-slot'));els.set('intro-copy',element('intro-copy'));
const intro=els.get('intro-cinema');intro.hidden=true;intro.setAttribute=(_name,value)=>{intro.ariaHidden=value};
const video=els.get('intro-video');video.currentTime=0;video.load=()=>{video.loaded=true};video.pause=()=>{video.paused=true};video.play=()=>{video.played=true;return Promise.resolve()};
const film=element('intro-film');film.classList={add(){},remove(){}};
const copy=els.get('intro-copy');
let starts=0;
const context={
  document:{getElementById:id=>element(id),querySelector:selector=>selector==='.intro-film'?film:selector==='.intro-copy'?copy:null},
  window:{CenizasBridge:{hasSave:()=>false,startNew:()=>{starts++},continueGame(){}},CenizasMusic:{enable(){},set(){}},addEventListener(){}},
  localStorage:{getItem(){return null}},
  setTimeout:()=>1,clearTimeout(){},
};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/menu.js','utf8'),context);
els.get('new-game').onclick();
assert.equal(menu.dataset.active,'false','Juego nuevo cierra el menú');
assert.equal(intro.hidden,false,'Juego nuevo muestra la premisa antes del creador');
assert.equal(intro.dataset.stage,'premise','la primera pantalla es la premisa escrita');
assert.match(copy.innerHTML,/Cuando las campanas callan/);
assert.equal(starts,0,'el creador no se abre antes de terminar el prólogo');
els.get('start-intro-video').onclick();
assert.equal(intro.dataset.stage,'video','el vídeo comienza solo después de leer la premisa');
assert.equal(video.played,true,'el vídeo narrado se inicia explícitamente');
assert.match(copy.innerHTML,/PRÓLOGO NARRADO/);
assert.equal(starts,0,'el creador sigue cerrado mientras corre el vídeo');
els.get('skip-intro').onclick();
assert.equal(intro.hidden,true,'Continuar cierra el prólogo');
assert.equal(starts,1,'Continuar abre el creador de personaje una sola vez');
console.log('PASS: Juego nuevo muestra el prólogo y solo después inicia la creación del personaje.');
