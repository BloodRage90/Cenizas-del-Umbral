const assert = require('node:assert/strict');
const R = require('../dist/combat.js');

const baseByClass = {
  Guerrero: [16, 14, 14, 12, 10, 8],
  Pícaro: [12, 16, 14, 14, 10, 8],
  Mago: [8, 14, 14, 16, 12, 10],
};
const make = (className, subclass, extra = {}) => R.profile({ ...R.defaults, ...extra, class: className, subclass, base: baseByClass[className], feats: [] }, 1);

assert.deepEqual(R.races.Orco.mods, [4, 0, 0, -2, -2, -2], 'Orco usa los penalizadores 3.5 esperados');
assert.deepEqual(R.races.Semiorco.mods, [2, 0, 0, 0, 0, -2], 'Semiorco usa solo −2 Carisma');
for (const name of ['Mediano', 'Gnomo']) {
  const profile = make('Guerrero', 'Guardia', { race: name });
  const medium = make('Guerrero', 'Guardia', { race: 'Humano' });
  assert.equal(profile.ac, medium.ac + (name === 'Mediano' ? 2 : 1), `${name} suma +1 CA por tamaño`);
  assert.equal(profile.attack, medium.attack, `${name} conserva el bono de ataque de tamaño tras su −2 FUE`);
  assert.equal(profile.damage, 6, `${name} reduce el dado de daño de 1d8 a 1d6`);
}

const guard = make('Guerrero', 'Guardia');
const berserker = make('Guerrero', 'Berserker');
assert.equal(guard.ac, make('Guerrero', undefined).ac + 2);
assert.equal(berserker.ac, make('Guerrero', undefined).ac - 2);
assert.equal(berserker.bonus, make('Guerrero', undefined).bonus + 2);

const shadow = make('Pícaro', 'Sombra');
const rogue = make('Pícaro', undefined);
assert.equal(shadow.sneakDie, 2);
assert.equal(shadow.action, 'finta');
assert.equal(shadow.init, rogue.init + 2);
const scout = make('Pícaro', 'Explorador');
assert.equal(scout.action, 'marcar');
assert.equal(scout.missileRange, rogue.missileRange + 2);

const arcanist = make('Mago', 'Arcanista');
const mage = make('Mago', undefined);
assert.equal(arcanist.spells, mage.spells + 1);
assert.equal(arcanist.spellDC, 1);
const weaver = make('Mago', 'Tejedor');
assert.equal(weaver.missileRange, mage.missileRange + 2);
assert.equal(weaver.bonus, mage.bonus + 1);

const b = new R.Battle('whisper', shadow, { ...R.fresh(), flags: { elara: false } }, n => (n === 20 ? 20 : Math.ceil(n / 2)));
b.s.noBoard = true;
b.s.index = b.s.order.indexOf('hero');
b.s.action = true;
assert.equal(b.act('finta'), true, 'Sombra puede ejecutar su acción propia');
assert.equal(b.s.shadowFeint, true);
b.s.action = true;
assert.equal(b.act('attack'), true, 'La finta no bloquea el ataque posterior');
assert.equal(b.s.shadowFeint, false, 'La finta se consume al golpear');

console.log('PASS: razas, tamaños y seis subclases tienen reglas y acciones ejecutables.');
