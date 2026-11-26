const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),R=require('../dist/combat.js'),N=require('../dist/navigation.js');
const code=fs.readFileSync('dist/chapter.js','utf8');
const rooms=vm.runInNewContext('('+code.split('const rooms=')[1].split('\n};')[0]+'\n})');
const encounters=vm.runInNewContext('('+code.split('const forestEncounters=')[1].split('\n];')[0]+'\n])');
for(const key of ['lindero','bosque']){
 const r=rooms[key],q=[{x:r.start[0],y:r.start[1]}],seen=new Set([r.start.join(',')]);
 for(let i=0;i<q.length;i++)for(const [dx,dy]of [[5,0],[-5,0],[0,5],[0,-5]]){const p={x:q[i].x+dx,y:q[i].y+dy},k=p.x+','+p.y;if(!seen.has(k)&&N.clear(r,q[i],p)){seen.add(k);q.push(p)}}
 for(const [id,,x,y]of r.spots)assert(q.some(p=>Math.hypot(p.x-x,p.y-y)<15&&N.clear(r,p,{x,y})),`${key}/${id} reachable`);
 for(const e of encounters.filter(e=>e.place===key))assert(q.some(p=>Math.hypot(p.x-e.x,p.y-e.y)<e.radius),e.id+' trigger reachable');
}
// The pilgrim no longer acts as a collision wall. Check the actual bend beyond him to the shrine.
for(const [x,y]of [[1210,737],[1280,700],[1390,650],[1490,580],[1490,540],[1450,475],[1400,435]])assert(N.walkable(rooms.bosque,x,y),`Monastery path ${x},${y}`);
const state=R.fresh();state.place='lindero';state.level=2;state.flags.elara=true;assert(R.valid(state));
for(const encounter of encounters){
 const b=new R.Battle('whisper',R.profile(R.defaults,2),state,()=>10);b.s.encounter=encounter;
 assert.equal(b.enemy.max,16);assert.equal(b.enemy.attack,4);assert.equal(b.enemy.damage,5);assert(b.s.units.some(u=>u.id==='elara'));
 b.s.index=b.s.order.indexOf('hero');b.hero.x=1;b.hero.y=3;assert.equal(b.act('mechanism'),false);
 b.hero.x=5;b.hero.y=2;assert(b.act('mechanism'));assert.equal(b.s.result,null);b.s.noBoard=true;for(let i=0;i<12&&!b.s.result;i++){b.s.action=true;b.act('attack');}assert.equal(b.s.result,'victory');
 const restored=new R.Battle('whisper',R.profile(),{combat:b.s});assert.equal(restored.s.encounter.flag,encounter.flag);
}
// Use the real trigger selector to verify completed foci never fire again.
const ctx={state:{place:'lindero',flags:{}},forestEncounters:encounters,count:0};ctx.revealEncounter=e=>{ctx.count++;ctx.state.flags[e.flag]=true};
vm.createContext(ctx);vm.runInContext(code.slice(code.indexOf('function checkForestEncounter('),code.indexOf('function revealEncounter(')),ctx);
for(const e of encounters.filter(e=>e.place==='lindero')){assert(ctx.checkForestEncounter({hero:e}));assert(!ctx.checkForestEncounter({hero:e}));}
assert.equal(ctx.count,2);assert(!ctx.state.flags.forest);
console.log('PASS: forest routes, monastery bend, reachable ambushes, one-time triggers, E02 stats, focus alternative and saved combat.');
