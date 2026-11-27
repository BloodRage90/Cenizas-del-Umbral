const assert = require('node:assert/strict');
const fs = require('node:fs');

const manifest = JSON.parse(fs.readFileSync('dist/hero-atlas.json', 'utf8'));
assert.equal(manifest.version, 1);
assert.equal(manifest.status, 'PLACEHOLDER_ART_PENDING_APPROVAL');

const ids = ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista'];
assert.deepEqual(Object.keys(manifest.heroes).sort(), ids.slice().sort());
for (const id of ids) {
  const entry = manifest.heroes[id];
  assert.deepEqual(entry.grid, [4, 1]);
  assert.deepEqual(entry.poses, ['idle', 'windup', 'strike', 'hurt']);
  assert.equal(entry.status, 'placeholder-approved-sheet');
  const file = `dist/${entry.file}`;
  assert(fs.existsSync(file), `falta el asset de ${id}`);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert(entry.width >= 4 && entry.height >= 1);
}

const visuals = require('../dist/hero-visuals.js');
for (const id of ids) {
  const fixed = visuals.profile({ playableId: id });
  assert.equal(fixed.fixedId, id);
  assert.equal(fixed.combatFile, `combat-heroes/${id}.png`);
}

console.log('PASS: el manifiesto de arte declara las seis hojas y su estado PLACEHOLDER.');
