const assert=require('node:assert/strict'),fs=require('node:fs'),R=require('../dist/combat.js'),D=require('../dist/character-data.js');

const fixed=D.playableCharacters||[];
assert.equal(fixed.length,6,'the six fixed protagonists remain available');
for(const character of fixed){
  const profile=R.profile({...R.defaults,...character,base:D.classes[character.class].pres,feats:[]});
  const battle=new R.Battle('echo',profile,{},n=>Math.min(n,10));
  battle.s.noBoard=true;
  battle.s.index=battle.s.order.indexOf('hero');
  battle.begin();
  assert(battle.act('attack'),`${character.name} can attack in the first turn`);
  assert.equal(battle.s.result,null,`${character.name} no longer wins the first hit instantly`);
  battle.rng=n=>n;
  for(let i=0;i<8&&!battle.s.result;i++){battle.s.action=true;assert(battle.act('attack'));}
  assert.equal(battle.s.result,'victory',`${character.name} can finish the encounter`);
}

const ash=new R.Battle('ash',R.profile(),{},n=>n);ash.s.noBoard=true;ash.s.index=ash.s.order.indexOf('hero');ash.begin();
assert(ash.act('mechanism'));ash.s.action=true;assert(ash.act('mechanism'));assert.equal(ash.s.exposed,true);assert(ash.enemy.hp>0,'supports expose the Guardian without resolving the fight');
const chapter=fs.readFileSync('dist/chapter.js','utf8'),css=fs.readFileSync('dist/chapter.css','utf8'),visuals=fs.readFileSync('dist/hero-visuals.js','utf8'),dice=fs.readFileSync('dist/dice.js','utf8');
assert.match(chapter,/setAttribute\('role','toolbar'\)/);assert.match(chapter,/Resolver rápido/);assert.match(css,/overflow-y:auto/);assert.match(css,/min-height:0/);assert.match(css,/min-height:48px/);assert.match(visuals,/drawCleanEquipment/);assert.match(dice,/combat\?900:3000/);
console.log('PASS: six protagonists share a readable multi-turn combat loop, and the touch/visual safeguards are wired.');
