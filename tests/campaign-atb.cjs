const assert = require('node:assert/strict');
const Rules = require('../dist/combat.js');

function activeBattle() {
  const save = { ...Rules.fresh(), atbMode: 'active', flags: { elara: false } };
  const battle = new Rules.Battle('echo', Rules.profile({ ...Rules.defaults, name: 'Cael' }), save, () => 10);
  battle.s.order = ['hero', 'enemy'];
  battle.s.index = 0;
  battle.s.noBoard = true;
  // The constructor already starts active mode; make the fixture's injected
  // order explicit so the first ready actor is deterministic.
  battle.s.atb.currentId = 'hero';
  battle.s.atb.units.hero.value = 100;
  battle.s.atb.units.enemy.value = 0;
  battle.s.action = true;
  return battle;
}

const battle = activeBattle();
assert.equal(battle.s.atb.v, 1);
assert.equal(battle.s.atb.currentId, 'hero');
assert(battle.ready('hero'));
assert.equal(battle.commit('enemy', 'attack'), false, 'unready actors cannot commit');
assert.equal(battle.commit('hero', 'attack'), true);
assert.equal(battle.s.action, false);
battle.end();
assert.equal(battle.s.atb.currentId, null);
battle.setAtbStatus('hero', 'stun');

// A normal clock fills the enemy after the player commits.  The order is
// deterministic because the test injects a deterministic die and tie-breaker.
let tick = { changed: false };
for (let i = 0; i < 16 && !tick.changed; i += 1) tick = battle.tick(250);
assert.equal(tick.changed, true);
assert.equal(battle.s.atb.currentId, 'enemy');
assert.equal(battle.actor.id, 'enemy');
battle.enemyTurn();
assert.equal(battle.s.atb.currentId, null);

const before = battle.s.atb.units.hero.value;
battle.setAtbMode('active');
battle.setAtbStatus('hero', 'haste');
battle.s.atb.currentId = null;
battle.tick(1000);
assert(battle.s.atb.units.hero.value > before || battle.s.atb.units.hero.value === 100, 'haste fills the bar');
battle.setAtbStatus('hero', 'stun');
battle.s.atb.units.hero.value = 0;
battle.tick(500);
assert.equal(battle.s.atb.units.hero.value, 0, 'stun pauses the bar');

const resumed = new Rules.Battle('echo', Rules.profile(), { combat: JSON.parse(JSON.stringify(battle.s)) });
assert.equal(resumed.s.atb.v, 1);
assert.equal(resumed.s.atb.units.hero.status[0], 'stun');

console.log('PASS: ATB de campaña es determinista, admite Espera/Activo, estados y restauración.');
