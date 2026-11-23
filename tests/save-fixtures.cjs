const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Rules = require('../dist/combat.js');

const root = path.join(__dirname, 'fixtures', 'saves');
const files = fs.readdirSync(root).sort();
assert.equal(files.length, 8, 'la auditoría conserva los ocho casos adversos');
for (const file of files) {
  const rawText = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.endsWith('.txt')) {
    assert.throws(() => JSON.parse(rawText), `${file} debe simular JSON corrupto`);
    const recovered = Rules.migrate(null);
    assert(Rules.valid(recovered.state), `${file} recupera el estado base`);
    continue;
  }
  const raw = JSON.parse(rawText);
  const migrated = Rules.migrate(raw);
  assert(Rules.valid(migrated.state), `${file} produce un guardado v2 válido`);
  assert.equal(migrated.state.v, 2);
  if (file.includes('invalid-fields')) {
    assert.equal(migrated.state.level, 5);
    assert.equal(migrated.state.hp, null);
    assert.equal(migrated.state.gold, 0);
  }
  if (file.includes('broken-combat')) assert.equal(migrated.state.combat, null);
  if (file.includes('invalid-place')) assert.equal(migrated.state.place, 'plaza');
}
console.log(
  'PASS: eight adversarial save fixtures migrate to valid v2 state without silent reset.',
);
