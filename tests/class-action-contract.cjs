const assert = require('node:assert/strict');
const Data = require('../dist/character-data.js');
const Rules = require('../dist/combat.js');

const baseByClass = {
  Guerrero: [16, 14, 14, 12, 10, 8],
  Pícaro: [12, 16, 14, 14, 10, 8],
  Mago: [8, 14, 14, 16, 12, 10],
};

const expected = [
  ['Guardia', 'provocar', 'Provocar', 'provocar'],
  ['Berserker', 'furia', 'Furia de ceniza', 'furia'],
  ['Sombra', 'finta', 'Finta de sombra', 'finta'],
  ['Explorador', 'marcar', 'Marcar objetivo', 'marcar'],
  ['Arcanista', 'canalizar', 'Llama Arcana', 'canalizar'],
  ['Tejedor', 'missile', 'Proyectil de ceniza', 'missile'],
];

for (const [subclass, action, label, engineAction] of expected) {
  const rule = Data.subclassRules[subclass];
  assert.equal(rule.action, action, `${subclass} publishes its engine action`);
  assert.equal(rule.combatName, label, `${subclass} publishes the combat label`);
  const profile = Rules.profile({
    ...Rules.defaults,
    class: rule.class,
    subclass,
    base: baseByClass[rule.class],
    feats: ['Dureza', 'Iniciativa mejorada'],
  });
  assert.equal(profile.action, action, `${subclass} reaches combat with its action`);
  assert.equal(profile.actionLabel, label, `${subclass} reaches combat with its label`);

  const battle = new Rules.Battle('echo', profile, { party: ['elara'], pi: 3 }, (sides) => Math.min(4, sides));
  battle.s.noBoard = true;
  battle.s.index = battle.s.order.indexOf('hero');
  battle.s.action = true;
  battle.s.pi = 3;
  const result = engineAction === 'provocar'
    ? battle.useTech('provocar')
    : battle.act(engineAction);
  assert.equal(result, true, `${subclass} action resolves in the first turn`);
  assert.equal(battle.s.action, false, `${subclass} action spends the turn once`);
}

console.log('PASS: los seis arquetipos publican el mismo verbo en creador y combate, y sus acciones resuelven en el primer turno.');
