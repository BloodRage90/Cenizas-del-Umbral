const assert=require('node:assert/strict'),R=require('../dist/combat.js');
const b=new R.Battle('whisper',R.profile(),{flags:{}},n=>n);
const ids=Object.keys(R.variants);assert.equal(ids.length,20);
for(const id of ids){assert(b.setVariant(id));assert.notEqual(b.enemy.name,'Eco del murmullo');assert.equal(b.enemy.sprite,id);assert(R.variants[id].max!==undefined);}
console.log('PASS: twenty enemy variants are selectable and keep identity in the battle renderer.');
