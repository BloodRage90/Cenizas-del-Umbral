const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),R=require('../dist/combat.js'),B=require('../dist/umbral-battle.js'),Nav=require('../dist/navigation.js');
const source=fs.readFileSync('dist/chapter.js','utf8'),rooms=vm.runInNewContext('('+source.split('const rooms=')[1].split('\n};')[0]+'\n})');
for(const key of ['montana','antesala','umbral']){
 const r=rooms[key],queue=[{x:r.start[0],y:r.start[1]}],seen=new Set([r.start.join(',')]);assert(Nav.walkable(r,...r.start),key+' start');
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){const p=queue[i],q={x:p.x+dx,y:p.y+dy},k=q.x+','+q.y;if(!seen.has(k)&&Nav.clear(r,p,q)){seen.add(k);queue.push(q);}}
 for(const [id,,x,y]of r.spots){assert(Nav.walkable(r,x,y),key+'/'+id+' on floor');assert(queue.some(p=>Math.hypot(p.x-x,p.y-y)<60&&Nav.clear(r,p,{x,y})),key+'/'+id+' reachable');}
 const save={...R.fresh(),place:key,level:5};assert(R.valid(save));const sceneAsset=r.img.replace(/\.png$/i,'.webp');assert(fs.existsSync('dist/'+sceneAsset));assert(fs.existsSync('dist/music/'+key+'.mp3'));
}
assert(!Nav.walkable(rooms.antesala,450,495));assert(!Nav.walkable(rooms.umbral,770,550));assert(!Nav.walkable(rooms.montana,1000,700));
const make=(cls='Guerrero')=>new B(R.profile({...R.defaults,class:cls},5),{flags:{elara:true},potions:3},()=>10);
const turn=(b,id,x,y)=>{b.s.index=b.s.order.indexOf(id);b.begin();if(x!==undefined)Object.assign(b.actor,{x,y});};
for(const cls of ['Guerrero','Pícaro','Mago']){
 const b=make(cls);assert.equal(b.hero.level,5);turn(b,'hero',3,1);b.select('enemy');assert.equal(b.act('attack'),false);assert.equal(b.s.action,true);
 turn(b,'enemy');const hp=b.hero.hp;b.enemyTurn();assert.equal(b.hero.hp,hp,'no opening damage');assert(b.s.warning);
 turn(b,'hero',0,2);assert(b.act('mechanism'));assert.equal(b.unit('armorL').hp,0);turn(b,'elara',6,2);assert(b.act('mechanism'));assert.equal(b.unit('armorR').hp,0);assert.equal(b.s.warning,null,'cutting power cancels ordinary pulse');
 turn(b,'hero',3,3);assert(b.act('names'));turn(b,'elara',3,2);assert(b.act('names'));assert.equal(b.s.names,2);
 turn(b,'hero',5,3);assert(b.act('rescue'));assert(b.s.serethRescued);assert.equal(b.s.pulseQueue.length,2);
 turn(b,'enemy');b.enemyTurn();assert(b.s.warning);assert.equal(b.s.pulseQueue.length,1,'only one pulse queued for next turn');
 const save={...R.fresh(),place:'umbral',level:5,combat:b.s};assert(R.valid(save));const resumed=new B(R.profile({...R.defaults,class:cls},5),save);assert.deepEqual(resumed.s,b.s);
 turn(b,'hero',3,1);assert(b.act('fracture'));turn(b,'elara',2,0);assert(b.act('fracture'));assert.equal(b.s.result,'victory');assert.equal(b.s.warning,null);assert.equal(b.s.pulseQueue.length,0);
}
// Elara reaches every mandatory mechanism with real movement and no teleportation.
{
 const b=make();b.unit('armorL').hp=b.unit('armorR').hp=0;let guard=0;
 for(let i=0;i<14&&!b.s.result;i++){turn(b,'elara');for(let j=0;j<8;j++){const p=b.autoPlan();if(p.move)assert(b.move(...p.move));else{if(p.action==='guard')guard++;assert(b.act(p.action));break;}}}
 assert.equal(b.s.result,'victory');assert.equal(guard,0);
}
// Existing v33 saves leave chapel through the new option, once, keeping rewards.
(async()=>{
 let options=[],travelled=null;const state={...R.fresh(),place:'capilla',level:4,flags:{chapelWon:true,chapelLoot:true,elara:true},gold:31,potions:2};
 const context={state,battle:null,encounterBusy:false,say:(_a,_b,c)=>{options=c},item:()=>{},note:()=>{},hud:()=>{},save:()=>{},journal:()=>{},inventory:()=>{},runStage:async()=>{},travel:p=>{travelled=p},restCinema:async()=>{},scene:{},window:{},R};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('function chapelAfter(){'),source.indexOf('function mirador(){')),context);
 context.chapelAfter();const option=options.find(o=>o[0]==='Partir con Ordan y Elara');assert(option);await option[1]();assert.equal(travelled,'montana');assert.equal(state.flags.mountainStarted,true);assert.equal(state.gold,31);assert.equal(state.potions,2);
 console.log('PASS: chapter III routes, assets, furniture/cliffs, all class victories, warnings, rescue queue, save/resume, Elara navigation and v33 chapel continuation.');
})().catch(e=>{console.error(e);process.exitCode=1});
