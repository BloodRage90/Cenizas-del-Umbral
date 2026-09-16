const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),R=require('../dist/combat.js'),Nav=require('../dist/navigation.js');
(async()=>{
const source=fs.readFileSync('dist/chapter.js','utf8'),rooms=vm.runInNewContext('('+source.split('const rooms=')[1].split('\n};')[0]+'\n})');
let options,rested=0,notes=0;const state={...R.fresh(),place:'bosque',level:2,flags:{forest:true,elara:true,monasteryTrail:true}};
const ctx={state,character:R.defaults,heroProfile:R.profile(R.defaults,2),battle:null,encounterBusy:false,R,window:{CenizasEquipment:require('../dist/equipment.js')},note(){notes++;},hud(){},say(_title,_text,choices){options=choices;},restCinema:async()=>{rested++;},travel(place){state.place=place;}};
vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function mirador(){'),source.indexOf('const REST_KEY=')),ctx);
ctx.mirador();assert(options.some(x=>x[0]==='Continuar al monasterio'),'old mirador save has continuation immediately');
await options.find(x=>x[0]==='Descansar con Elara')[1]();assert.equal(rested,1);assert(options.some(x=>x[0]==='Continuar al monasterio'),'rest returns to continuation');
options.find(x=>x[0]==='Continuar al monasterio')[1]();assert.equal(state.place,'monasterio');assert.equal(state.level,3);assert(R.valid(JSON.parse(JSON.stringify(state))),'new location and level survive reload');
state.place='bosque';const count=notes;ctx.enterMonastery();assert.equal(notes,count,'no duplicate milestone on revisit');
for(const place of ['monasterio','archivo','enfermeria']){const r=rooms[place],start={x:r.start[0],y:r.start[1]};assert(Nav.walkable(r,start.x,start.y));const queue=[start],seen=new Set([start.x+','+start.y]);for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){const q={x:p.x+dx,y:p.y+dy},k=q.x+','+q.y;if(!seen.has(k)&&Nav.clear(r,p,q)){seen.add(k);queue.push(q);}}}for(const [id,,x,y]of r.spots)assert(queue.some(p=>Math.hypot(p.x-x,p.y-y)<20&&Nav.clear(r,p,{x,y})),place+': '+id+' reachable');}
for(const cls of ['Guerrero','Pícaro','Mago']){const c={...R.defaults,class:cls};assert(R.profile(c,3).max>R.profile(c,2).max);assert.equal(R.profile(c,3).level,3);}
console.log('PASS: existing mirador save, optional rest -> continue, arrival, one-time milestone, save reload and new room access.');
})();
