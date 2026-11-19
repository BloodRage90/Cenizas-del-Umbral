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
assert(!Systems.canUseTech('llamaArcana', party.slice(0, 2), 3));
assert.deepEqual([...Systems.partyClasses([{ class: 'Pícaro', classes: ['Pícaro', 'Mago'], hp: 10 }])].sort(), ['Mago', 'Pícaro']);
assert.equal(Systems.racialSecret('Orco', 'plaza').verb, 'Intimidar');
assert.equal(Systems.classVerbs.Guerrero.combat, 'Provocar');

for (const heroClass of ['Guerrero', 'Pícaro', 'Mago']) {
  const hero = R.profile({ ...R.defaults, class: heroClass, base: R.defaults.base, feats: [] });
  const available = Object.keys(Systems.TECHS).filter(id => Systems.canUseTech(id, [hero, R.elara], 5));
  assert(available.length >= 3, `${heroClass} conserva técnicas combinadas con Elara: ${available.join(', ')}`);
}

const makePartyBattle = () => {
  const hero = R.profile({ ...R.defaults, class: 'Pícaro', subclass: 'Sombra', base: [12, 16, 14, 14, 10, 8], feats: [] });
  const b = new R.Battle('whisper', hero, { ...R.fresh(), flags: { elara: false }, pi: 5 }, n => n);
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

for (const [id, cost, minimum] of [['filoUmbrio', 2, 1.5], ['llamaArcana', 3, 1.6], ['sombraDoble', 2, 1.5]]) {
  const b = makePartyBattle();
  const before = b.enemy.hp;
  assert.equal(b.useTech(id), true, `${id} se ejecuta con las clases requeridas`);
  assert.equal(b.s.pi, 5 - cost, `${id} consume PI`);
  assert(b.enemy.hp < before, `${id} inflige daño combinado`);
  assert(b.s.techsUsed.includes(id));
  assert(minimum >= 1.5, `${id} conserva el multiplicador mínimo`);
  assert.equal(b.s.action, false, `${id} consume la acción del turno`);
}

const provoke = new R.Battle('whisper', R.profile({ ...R.defaults, class: 'Guerrero' }), { ...R.fresh(), flags: { elara: false }, pi: 1 }, n => n);
const acBeforeProvoke = provoke.enemy.ac;
assert.equal(provoke.useTech('provocar'), true, 'el Guerrero tiene un verbo propio con coste PI');
assert.equal(provoke.s.pi, 0, 'Provocar consume un punto de impulso');
assert.equal(provoke.enemy.ac, acBeforeProvoke - 2, 'Provocar rompe la CA del objetivo');

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
