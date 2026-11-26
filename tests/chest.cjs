const assert=require('node:assert/strict'),R=require('../dist/combat.js'),C=require('../dist/chest.js');
for(const die of [1,10,11,20]){
 let s=R.fresh();s.level=2;s.flags.elara=true;s.place='lindero';
 assert.equal(C.status(s),'sealed');assert(!C.collect(s));C.luck(s,die);
 s=JSON.parse(JSON.stringify(s));assert.equal(C.luck(s,21-die),die);
 if(die<11){assert.equal(C.status(s),'guarded');assert(!C.collect(s));const checkpoint=JSON.parse(JSON.stringify(s));const b=new R.Battle('sentinel',R.profile(R.defaults,2),s,n=>Math.min(10,n));assert.equal(b.enemy.max,30);assert.equal(b.enemy.ac,15);assert(b.s.units.some(u=>u.id==='elara'));b.s.index=b.s.order.indexOf('hero');assert(!b.act('mechanism'));assert(!b.act('conduit'));b.s.index=b.s.order.indexOf('enemy');const hp=b.hero.hp;b.enemyTurn();assert.equal(b.hero.hp,hp);assert(b.s.warning);b.hero.hp=0;b.check();assert.equal(b.s.result,'defeat');s=checkpoint;assert.equal(C.status(s),'guarded');s.flags.chestDefeated=true;}
 assert.equal(C.status(s),'ready');const gold=s.gold,potions=s.potions;assert(C.collect(s));s=JSON.parse(JSON.stringify(s));assert(!C.collect(s));assert.equal(s.gold,gold+25);assert.equal(s.potions,potions+2);assert.equal(s.items.filter(x=>x==='Medallón de la Vigilia').length,1);
}
for(const cls of ['Guerrero','Pícaro','Mago']){const s=R.fresh();s.flags.elara=true;const b=new R.Battle('sentinel',R.profile({...R.defaults,class:cls},2),s,n=>n===20?15:Math.ceil(n/2));b.s.index=b.s.order.indexOf('hero');b.hero.x=3;b.hero.y=2;for(let i=0;i<30&&!b.s.result;i++){b.s.action=true;assert(b.act('attack'));}assert.equal(b.s.result,'victory',cls+' can defeat guardian with normal equipment');}
console.log('PASS: luck boundaries, persisted failures, guardian warning, no mechanism bypass, three classes can damage guardian, unique chest loot.');
