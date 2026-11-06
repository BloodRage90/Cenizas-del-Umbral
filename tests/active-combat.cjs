const assert=require('node:assert/strict'),R=require('../dist/combat.js');
function battle(){return new R.Battle('whisper',R.profile(),{},()=>10)}
let b=battle();const hero=b.hero;
assert.equal(b.mitigate(hero,7),7);b.reaction='dodge';assert.equal(b.mitigate(hero,7),3);b.reaction='parry';assert.equal(b.mitigate(hero,7),0);assert.equal(b.mitigate(b.enemy,7),7);
b=battle();b.s.index=b.s.order.indexOf('hero');b.hero.x=3;b.hero.y=2;b.enemy.ac=100;b.enemy.flat=100;b.act('attack',{precision:true});assert.ok(b.events.some(x=>x.includes('d20 10 +7 = 17')));assert.equal(b.s.action,false);assert.equal(b.act('attack',{precision:true}),false);
b=battle();b.s.index=b.s.order.indexOf('enemy');b.s.opening=false;b.enemy.x=2;b.enemy.y=3;const hp=b.hero.hp;b.enemyTurn({defense:'parry'});assert.equal(b.hero.hp,hp);assert.equal(b.reaction,null);
console.log('PASS: precision uses action, defense mitigation and reaction reset.');
