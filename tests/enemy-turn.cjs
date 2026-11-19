const assert=require('node:assert/strict');
const R=require('../dist/combat.js');
const forceEnemy=b=>{b.s.index=b.s.order.indexOf('enemy');b.begin();};

// Opening turns announce their threat but never apply a second, accidental hit.
{
  const b=new R.Battle('whisper',R.profile(),{flags:{}},n=>n);
  b.s.noBoard=true;b.s.index=b.s.order.indexOf('enemy');b.s.opening=true;
  const hp=b.hero.hp;b.enemyTurn();assert.equal(b.hero.hp,hp,'el primer turno del Eco no inflige daño');
}
// Ash alternates a normal strike and a pulse; each enemy turn has one effect.
{
  const b=new R.Battle('ash',R.profile(),{flags:{}},n=>n);b.s.noBoard=true;b.hero.max=100;b.hero.hp=100;b.s.warning={type:'strike'};
  const effect=x=>x.includes('recibe')||/:.*pulso \d+ PG/.test(x);
  forceEnemy(b);let before=b.events.length;b.enemyTurn();assert.equal(b.events.slice(before).filter(effect).length,1);
  forceEnemy(b);before=b.events.length;b.enemyTurn();assert.equal(b.events.slice(before).filter(effect).length,1);
}
// The Custodio warning sequence is strike → pulse → strike, never two strikes.
{
  const b=new R.Battle('custodian',R.profile(),{flags:{}},n=>n);b.s.noBoard=true;b.hero.max=100;b.hero.hp=100;b.s.opening=false;b.s.warning=null;
  forceEnemy(b);b.enemyTurn();assert.equal(b.s.warning.type,'strike');
  const effect=x=>x.includes('recibe')||/:.*descarga \d+ PG/.test(x);
  forceEnemy(b);let before=b.events.length;b.enemyTurn();assert.equal(b.s.warning.type,'pulse');assert.equal(b.events.slice(before).filter(effect).length,1);
  forceEnemy(b);before=b.events.length;b.enemyTurn();assert.equal(b.s.warning.type,'strike');assert.equal(b.events.slice(before).filter(effect).length,1);
}
console.log('PASS: opening turns and enemy warnings resolve exactly once.');
