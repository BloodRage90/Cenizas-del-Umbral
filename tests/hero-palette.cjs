const assert = require('node:assert/strict');
const fs = require('node:fs');

const ids = ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista'];
for (const id of ids) {
  const file = `art/palettes/${id}.json`;
  assert(fs.existsSync(file), `falta la paleta diagnóstica de ${id}`);
  const entry = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(entry.id, id);
  assert.deepEqual(entry.sourceGrid, [4, 1]);
  assert.equal(entry.sourceFrame, 'idle');
  assert.equal(entry.paletteLimit, 24);
  assert(entry.palette.length > 0 && entry.palette.length <= 24, `${id}: paleta fuera de rango`);
  assert(entry.palette.every(item => /^#[0-9a-f]{6}$/i.test(item.color)), `${id}: color inválido`);
  assert(/^#[0-9a-f]{6}$/i.test(entry.hairColor.color), `${id}: pelo sin color válido`);
  assert.match(entry.sourceSha256, /^[0-9a-f]{64}$/);
  assert.equal(entry.status, 'diagnostic-only');
}

console.log('PASS: las seis paletas diagnósticas provienen del cuadro IDLE canónico y no superan 24 colores.');
