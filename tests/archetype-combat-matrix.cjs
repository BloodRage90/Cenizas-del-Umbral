const assert = require('node:assert/strict');
const Rules = require('../dist/combat.js');

const builds = [
  ['Guardia', 'Guerrero', [16, 14, 14, 12, 10, 8]],
  ['Berserker', 'Guerrero', [16, 14, 14, 12, 10, 8]],
  ['Sombra', 'Pícaro', [12, 16, 14, 14, 10, 8]],
  ['Explorador', 'Pícaro', [12, 16, 14, 14, 10, 8]],
  ['Arcanista', 'Mago', [8, 14, 14, 16, 12, 10]],
  ['Tejedor', 'Mago', [8, 14, 14, 16, 12, 10]],
];

for (const [subclass, className, base] of builds) {
  const profile = Rules.profile({ ...Rules.defaults, name: subclass, class: className, subclass, base, feats: [] });
  const battle = new Rules.Battle('echo', profile, { party: [] }, (sides) => sides);
  battle.s.noBoard = true;
  battle.s.order = ['hero', 'enemy'];
  battle.s.index = 0;
  battle.s.action = true;

  for (let turn = 0; turn < 12 && !battle.s.result; turn += 1) {
    if (battle.actor.team === 'party') {
      assert(battle.act('attack'), `${subclass} can attack on its turn`);
      if (!battle.s.result) battle.end();
    } else {
      battle.enemyTurn();
    }
  }
  assert.equal(battle.s.result, 'victory', `${subclass} completes the first encounter`);
  assert(battle.s.round <= 6, `${subclass} resolves within six rounds`);
}

console.log('PASS: los seis arquetipos completan un combate completo en la matriz determinista.');
