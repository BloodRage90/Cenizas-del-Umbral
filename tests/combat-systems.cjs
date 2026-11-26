const assert = require('node:assert/strict');
const Systems = require('../dist/combat-systems.js');
const R = require('../dist/combat.js');

assert.equal(Systems.MAX_PI, 5, 'PI tiene un máximo de cinco');
assert.equal(Systems.resolveBlock(null, 0).ignored, true, 'bloqueo inexistente no rompe el turno');
const perfect = Systems.beginBlock('hero', { startedAt: 1000, duration: 1200 });
assert.equal(Systems.resolveBlock(perfect, 600).success, true, 'la ventana central permite bloquear');
assert.equal(perfect.reduction, 0.5);
assert.equal(Systems.resolveBlock(perfect, 600).ignored, true, 'resolve no se ejecuta dos veces');
const missed = Systems.beginBlock('hero', { startedAt: 1000, duration: 1200 });
assert.equal(Systems.resolveBlock(missed, 100).success, false, 'fuera de ventana falla');

const party = [
  { class: 'Pícaro', hp: 10 },
  { class: 'Guerrero', hp: 10 },
  { class: 'Mago', hp: 10 },
];
assert(Systems.canUseTech('filoUmbrio', party, 2));
assert(Systems.canUseTech('llamaArcana', party, 3));
assert(Systems.canUseTech('elaraCombo', [{ id: 'elara', class: 'Guerrero', hp: 10 }, { class: 'Guerrero', hp: 10 }], 2));
assert(!Systems.canUseTech('llamaArcana', party.slice(0, 2), 3));
assert.deepEqual([...Systems.partyClasses([{ class: 'Pícaro', classes: ['Pícaro', 'Mago'], hp: 10 }])].sort(), ['Mago', 'Pícaro']);
assert.equal(Systems.racialSecret('Orco', 'plaza').verb, 'Intimidar');
assert.equal(Systems.classVerbs.Guerrero.combat, 'Provocar');
assert(R.profile({ ...R.defaults, class: 'Mago', feats: [] }).max >= 10, 'el Mago de nivel 1 supera el umbral de supervivencia inicial');

for (const heroClass of ['Guerrero', 'Pícaro', 'Mago']) {
  const hero = R.profile({ ...R.defaults, class: heroClass, base: R.defaults.base, feats: [] });
  const available = Object.keys(Systems.TECHS).filter(id => Systems.canUseTech(id, [hero, R.elara], 5));
  assert(available.length >= 3, `${heroClass} conserva técnicas combinadas con Elara: ${available.join(', ')}`);
}

const partySave = { ...R.fresh(), flags: { elara: true, ordanMet: true, iriaJoined: true, darienMet: true }, party: ['elara', 'ordan', 'iria'], techsLearned: Object.keys(Systems.TECHS), pi: 5 };
assert.deepEqual(R.selectedParty(partySave), ['elara', 'ordan'], 'el grupo limita los aliados activos a dos');
const partyBattle = new R.Battle('whisper', R.profile({ ...R.defaults, class: 'Mago' }), partySave, n => n);
assert.deepEqual(partyBattle.s.units.filter(u => u.team === 'party').map(u => u.id), ['hero', 'elara', 'ordan'], 'el combate materializa al héroe y los dos aliados seleccionados');
assert(partyBattle.availableTechs().some(t => t.id === 'provocar'), 'el Guerrero aliado habilita su verbo propio');
const unlearned = new R.Battle('whisper', R.profile({ ...R.defaults, class: 'Guerrero' }), { ...R.fresh(), flags: { elara: true }, pi: 5 }, n => n);
assert(!unlearned.availableTechs().some(t => t.id === 'filoUmbrio'), 'las técnicas combinadas no aparecen antes de aprenderse');

const makePartyBattle = () => {
  const hero = R.profile({ ...R.defaults, class: 'Pícaro', subclass: 'Sombra', base: [12, 16, 14, 14, 10, 8], feats: [] });
  const b = new R.Battle('whisper', hero, { ...R.fresh(), flags: { elara: false }, techsLearned: Object.keys(Systems.TECHS), pi: 5 }, n => n);
  const enemy = b.enemy;
  b.s.noBoard = true;
  b.s.units.push(
    { id: 'warrior', name: 'Ordan', class: 'Guerrero', team: 'party', hp: 20, max: 20, damage: 8, bonus: 2, ac: 15, flat: 12, attack: 5, threat: 20, x: 1, y: 2 },
    { id: 'mage', name: 'Iria', class: 'Mago', team: 'party', hp: 16, max: 16, damage: 6, bonus: 2, ac: 13, flat: 10, attack: 3, threat: 20, x: 1, y: 4 },
  );
  b.s.order = ['hero', 'warrior', 'mage', 'enemy'];
  b.s.index = 0;
  b.s.action = true;
  enemy.hp = enemy.max;
  return b;
};

{
  const b = makePartyBattle(), before = b.enemy.hp;
  assert.equal(b.useTech('filoUmbrio'), true, 'Filo Umbrío se ejecuta con las clases requeridas');
  assert.equal(b.s.pi, 3, 'Filo Umbrío consume PI');
  assert.equal(b.enemy.hp, before, 'Filo Umbrío reserva el daño para el próximo golpe del Guerrero');
  assert.equal(b.enemy.ac, 11, 'Filo Umbrío abre una grieta temporal');
  b.s.index=b.s.order.indexOf('warrior');b.begin();assert(b.act('attack'));assert(b.enemy.hp<before,'el siguiente golpe del Guerrero consume Filo Umbrío');b.s.result=null;b.enemy.hp=20;
  b.s.index=b.s.order.indexOf('enemy');b.begin();b.end();assert.equal(b.enemy.ac,13,'la CA vuelve al terminar el ciclo');
  assert(b.s.techsUsed.includes('filoUmbrio'));
}
{
  const b = makePartyBattle(), before = b.enemy.hp;
  assert.equal(b.useTech('llamaArcana'), true, 'Llama Arcana se ejecuta con las clases requeridas');
  assert.equal(b.s.pi, 2, 'Llama Arcana consume PI');
  assert.equal(b.enemy.hp, before, 'Llama Arcana no daña hasta el golpe imbuido');
  b.s.index=b.s.order.indexOf('warrior');b.begin();assert(b.act('attack'));assert(b.enemy.hp<before,'el golpe del Guerrero recibe fuego adicional');
  assert(b.s.techsUsed.includes('llamaArcana'));
}
{
  const b = makePartyBattle(), before = b.enemy.hp;
  assert.equal(b.useTech('sombraDoble'), true, 'Sombra Doble se ejecuta con las clases requeridas');
  assert.equal(b.s.pi, 3, 'Sombra Doble consume PI');
  assert(b.enemy.hp < before, 'Sombra Doble resuelve el golpe furtivo inmediato');
  assert.equal(b.s.shadowFeint, true, 'Sombra Doble garantiza furtivo para el siguiente turno');
  assert(b.s.techsUsed.includes('sombraDoble'));
}

const provoke = new R.Battle('whisper', R.profile({ ...R.defaults, class: 'Guerrero' }), { ...R.fresh(), flags: { elara: false }, pi: 1 }, n => n);
const acBeforeProvoke = provoke.enemy.ac;
assert.equal(provoke.useTech('provocar'), true, 'el Guerrero tiene un verbo propio con coste PI');
assert.equal(provoke.s.pi, 0, 'Provocar consume un punto de impulso');
assert.equal(provoke.enemy.ac, acBeforeProvoke - 2, 'Provocar rompe la CA del objetivo');

const locks = new R.Battle('ash', R.profile(R.defaults), { ...R.fresh(), flags: { elara: false } }, n => n);
assert.deepEqual(locks.s.locks.map(lock => lock.label), ['Soporte I', 'Soporte II', 'Palanca']);
locks.s.noBoard = true; locks.s.index = 0; locks.begin();
assert(locks.act('mechanism')); assert.equal(locks.s.locks.find(lock => lock.id === 'support-1').open, false);

const capped = makePartyBattle();
capped.s.pi = 5;
assert.equal(capped.gainPI(99), 0, 'PI no supera el máximo');
capped.prepareBlock('hero', { startedAt: 1000, duration: 1200 });
assert.equal(capped.resolveBlock(600).success, true);
assert.equal(capped.s.blockStreak, 1);
const reduced = capped.incoming(capped.hero, 10);
assert.equal(reduced, 5, 'bloqueo perfecto reduce el daño a la mitad');

const migrated = R.migrate({ ...R.fresh(), level: 9, hp: 'invalid', pi: 99 });
assert.equal(migrated.state.level, 5, 'nivel inválido se corrige por campo');
assert.equal(migrated.state.hp, null, 'PG inválidos vuelven a la vida máxima al cargar');
assert.equal(migrated.state.pi, 5, 'PI inválido se limita sin perder el resto del guardado');
assert(migrated.changed);

const variantNames = Object.keys(R.variants);
assert.equal(variantNames.length, 20, 'hay veinte variantes de enemigo registradas');
const variantBattle = new R.Battle('whisper', R.profile(R.defaults), { ...R.fresh(), flags: { elara: false } }, n => n);
for (const variant of variantNames) {
  assert.equal(variantBattle.setVariant(variant), true, `${variant} se puede aplicar al motor`);
  assert(variantBattle.enemy.max >= 9 && variantBattle.enemy.ac >= 12, `${variant} tiene estadísticas propias`);
}
assert(new Set(variantNames.map(id => R.variants[id].behavior)).size >= 10, 'las variantes expresan comportamientos visuales distintos');

console.log('PASS: bloqueo activo, PI, técnicas combinadas, verbos de clase/raza y migración por campo.');
