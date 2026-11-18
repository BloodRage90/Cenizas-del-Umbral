const assert=require('node:assert/strict');
const R=require('../dist/combat.js');

const mage=R.profile({...R.defaults,class:'Mago',race:'Humano',base:[8,14,14,16,12,10],feats:[]},1);
assert.equal(mage.bonus,3,'El Mago usa el modificador de Inteligencia');

const migrated=R.migrate({...R.fresh(),place:'umbral',level:9,hp:'dañado',gold:Infinity,flags:{intro:true}});
assert.equal(migrated.state.place,'umbral');
assert.equal(migrated.state.level,5);
assert.equal(migrated.state.hp,null);
assert.equal(migrated.state.flags.intro,true);
assert(migrated.changed);

const b=new R.Battle('whisper',R.profile(R.defaults,1),{flags:{}},()=>10);
b.s.index=b.s.order.indexOf('hero');b.begin();
assert.equal(b.act('attack'),false,'un ataque fuera de alcance no consume la acción');
assert.equal(b.s.action,true);
b.hero.x=3;b.hero.y=2;b.s.action=true;
assert.equal(b.act('attack'),true,'un ataque adyacente sí se resuelve');

const moving=new R.Battle('whisper',R.profile(R.defaults,1),{flags:{}},()=>10);
moving.s.index=moving.s.order.indexOf('enemy');moving.s.opening=false;
moving.enemy.x=6;moving.enemy.y=0;
const before=R.distance(moving.enemy,moving.hero);
moving.enemyTurn();
assert(R.distance(moving.enemy,moving.hero)<before,'el enemigo usa move para entrar en alcance');

console.log('PASS: migración, alcance, movimiento enemigo y bonificador del Mago.');
