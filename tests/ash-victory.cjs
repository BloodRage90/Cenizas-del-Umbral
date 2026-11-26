const assert=require('node:assert/strict'),R=require('../dist/combat.js');
const turn=(b,id)=>{b.s.index=b.s.order.indexOf(id);b.begin();};
let b=new R.Battle('ash',R.profile(),{flags:{}},n=>n);b.enemy.hp=0;b.check();assert.equal(b.s.result,null);assert.equal(b.enemy.hp,1);
b=new R.Battle('ash',R.profile(),{flags:{}},n=>n);b.s.wheels=[0,1];b.s.exposed=true;b.enemy.hp=0;b.check();assert.equal(b.s.result,'victory');
b=new R.Battle('ash',R.profile(),{flags:{}},n=>n);turn(b,'hero');b.hero.x=0;b.hero.y=2;assert(b.act('mechanism'));turn(b,'hero');b.hero.x=6;b.hero.y=2;assert(b.act('mechanism'));assert.equal(b.s.result,null);assert(b.s.exposed);b.s.noBoard=true;turn(b,'hero');for(let i=0;i<8&&!b.s.result;i++){b.s.action=true;assert(b.act('attack'));}assert.equal(b.s.result,'victory');
console.log('PASS: Ash needs the two supports and exposure before attacks can finish the encounter.');
