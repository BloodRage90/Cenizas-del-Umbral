const assert = require('node:assert/strict');
const data = require('../dist/character-data.js');
const app = require('node:fs').readFileSync('dist/app.js', 'utf8');

assert.equal(data.playableCharacters.length, 6, 'hay seis protagonistas fijos');
assert.deepEqual(data.playableCharacters.map(x => x.id), ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista']);
assert.deepEqual(data.playableCharacters.map(x => x.name), ['Cael', 'Eiren', 'Soren', 'Kaira', 'Vesper', 'Nimra']);
assert.deepEqual(data.playableCharacters.slice(0, 3).map(x => x.gender), ['Hombre', 'Hombre', 'Hombre']);
assert.deepEqual(data.playableCharacters.slice(3).map(x => x.gender), ['Mujer', 'Mujer', 'Mujer']);
assert.equal(new Set(data.playableCharacters.map(x => x.name)).size, 6, 'los nombres no se repiten');
assert.ok(app.includes('playableCharacters') && app.includes('fixedPlayableCharacters'), 'el creador usa el catálogo fijo');
for (const character of data.playableCharacters) {
  assert.ok(data.raceData[character.race], `${character.id} declara una raza válida`);
  assert.ok(data.genderData.some(([gender]) => gender === character.gender), `${character.id} declara género válido`);
}
console.log('PASS: los seis protagonistas rápidos tienen nombre, raza y presentación fijas.');
