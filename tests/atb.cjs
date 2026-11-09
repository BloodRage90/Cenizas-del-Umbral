const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Battle,valid}=require('../dist/atb.js');
const ready=()=>{const b=new Battle();for(const u of b.s.units.filter(u=>u.team==='party'))u.charge=100;return b;};
test('clock pauses explicitly, in Wait selection, and after victory; Active continues',()=>{
 const b=new Battle();b.tick(1000,{paused:true});assert.equal(b.s.time,0);b.tick(1000,{menu:true});assert.equal(b.s.time,0);
 b.s.mode='active';b.tick(1000,{menu:true});assert(Math.abs(b.unit('hero').charge-24)<1e-9);assert.equal(b.s.time,1000);
 for(const n of [NaN,Infinity,-1,0])b.tick(n);assert.equal(b.s.time,1000);
 b.unit('echo').hp=0;b.check();b.tick(1000);assert.equal(b.s.time,1000);
});
test('combo validates all participants before spending either turn or MP',()=>{
 const b=ready();b.unit('hero').x=3;b.unit('elara').x=3;
 b.unit('elara').charge=99;const before=JSON.stringify(b.s);assert.equal(b.act('hero','combo'),false);assert.equal(JSON.stringify(b.s),before);
 b.unit('elara').charge=100;b.unit('elara').mp=1;assert.equal(b.act('hero','combo'),false);assert.equal(b.unit('hero').charge,100);
 b.unit('elara').mp=6;b.unit('elara').x=0;assert.equal(b.act('hero','combo'),false);
 b.unit('elara').x=3;assert.equal(b.act('elara','combo'),true);assert.equal(b.unit('echo').hp,30);
 for(const id of ['hero','elara']){assert.equal(b.unit(id).mp,4);assert.equal(b.unit(id).charge,0);}
 assert.equal(b.act('hero','combo'),false);assert.equal(b.unit('echo').hp,30);
});
test('movement respects occupancy, adjacency paths and remaining budget',()=>{
 const b=ready();assert.equal(b.move('hero',4,2),false);assert.equal(b.move('hero',-1,3),false);assert.equal(b.move('hero',1,2),false);
 assert.equal(b.move('hero',3,3),true);assert.equal(b.unit('hero').moves,0);assert.equal(b.move('hero',3,2),false);
 assert.equal(b.act('hero','attack'),false);assert.equal(b.unit('hero').charge,100);
 assert.equal(b.act('hero','tech'),true);assert.equal(b.unit('hero').moves,2);assert.equal(b.move('hero',3,2),false);
});
test('telegraph gets a full response window, freezes in Wait, damages only its row',()=>{
 const b=new Battle();b.tick(6300);assert(b.s.warning);assert(b.s.warning.remaining>=2500);
 const row=b.s.warning.row,remaining=b.s.warning.remaining;b.tick(1000,{menu:true});assert.equal(b.s.warning.remaining,remaining);
 const safe=b.s.units.find(u=>u.team==='party'&&u.y!==row),target=b.s.units.find(u=>u.team==='party'&&u.y===row);const safeHP=safe.hp,targetHP=target.hp;
 b.tick(remaining);assert.equal(b.s.warning,null);assert.equal(safe.hp,safeHP);assert.equal(target.hp,targetHP-5);assert.equal(b.unit('echo').charge,0);
});
test('guard mitigates, potion cannot be used at full health, dead partner blocks combo',()=>{
 const b=ready();assert.equal(b.act('hero','potion'),false);assert.equal(b.s.potions,2);
 b.act('hero','guard');b.s.warning={row:3,remaining:50};b.tick(50);assert.equal(b.unit('hero').hp,28);
 b.unit('hero').charge=100;b.act('hero','potion');assert.equal(b.unit('hero').hp,30);assert.equal(b.s.potions,1);assert.equal(b.unit('hero').guard,false);
 b.unit('elara').hp=0;b.unit('hero').charge=100;assert.equal(b.act('hero','combo'),false);
 b.unit('hero').hp=0;b.check();assert.equal(b.s.result,'defeat');assert.equal(b.s.warning,null);
});
test('save reload preserves spent resources, warning and clocks; rejects invalid payloads',()=>{
 const b=ready();b.move('hero',3,3);b.act('hero','tech');b.s.warning={row:3,remaining:1700};
 const json=JSON.parse(JSON.stringify(b.s));assert(valid(json));const restored=new Battle(json);assert.deepEqual(restored.s,b.s);
 restored.tick(500);assert.equal(restored.s.warning.remaining,1200);assert.equal(b.s.warning.remaining,1700);
 for(const mutate of [s=>s.v=2,s=>s.units[0].hp=NaN,s=>s.units[1].x=999,s=>s.units[0].mp=99,s=>s.units[2].speed=999,s=>s.units[0].id='intruder',s=>s.warning.remaining=-1,s=>s.result='victory',s=>s.log=[{}]]){const s=JSON.parse(JSON.stringify(json));mutate(s);assert.equal(valid(s),false);assert.throws(()=>new Battle(s));}
});
test('both styles can win with only basic attacks after mana runs out',()=>{
 for(const mode of ['wait','active']){const b=ready();b.s.mode=mode;b.unit('hero').x=4;b.unit('hero').y=3;b.unit('elara').x=3;b.unit('elara').y=2;for(let t=0;t<1200&&!b.s.result;t++){for(const id of ['hero','elara'])if(b.ready(id))b.act(id,'attack');b.tick(100);}assert.equal(b.s.result,'victory');assert(valid(b.s));}
});
test('UI uses separate storage and does not write campaign keys',()=>{
 const fs=require('node:fs');const ui=fs.readFileSync(require.resolve('../dist/training.js'),'utf8');assert(ui.includes('cenizas-atb-training-v1'));assert(!ui.includes('cenizas-campaign-v2'));assert(!ui.includes('localStorage.clear'));assert(ui.includes("window.addEventListener('blur'"));
});
