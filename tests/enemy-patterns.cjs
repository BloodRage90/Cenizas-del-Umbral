const assert = require('node:assert/strict');
const Combat = require('../dist/combat.js');

const hero = Combat.profile({ name: 'Patrón', class: 'Guerrero', race: 'Humano', subclass: 'Guardia', base: [16, 14, 14, 12, 10, 8] });
const battle = new Combat.Battle('echo', hero, {}, () => 1);
battle.s.order = ['enemy', 'hero'];
battle.s.index = 0;
battle.s.opening = false;
battle.s.warning = null;
battle.enemy.pattern = ['strike', 'guard', 'heavy'];
battle.enemyTurn();
assert.equal(battle.s.warning.type, 'pattern', 'el enemigo anuncia el siguiente movimiento');
assert.equal(battle.s.warning.action, 'strike', 'el RNG inyectado elige el patrón determinista');
battle.s.index = 0;
battle.enemyTurn();
assert.equal(battle.s.warning, null, 'el aviso se consume en el turno siguiente');
assert.equal(battle.s.history.some(line => line.includes('ataque')), true);

const patterns = new Set(Object.values(Combat.variants).flatMap(entry => entry.pattern || []));
assert(patterns.has('strike') && patterns.has('guard') && patterns.has('heavy'), 'hay tres patrones comunes');
console.log('PASS: los patrones enemigos se anuncian un turno antes y aceptan RNG inyectado.');
