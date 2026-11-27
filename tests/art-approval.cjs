const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('art/approval.html', 'utf8');
assert.match(html, /<!doctype html>/i);
assert.match(html, /<html lang="es">/i);
assert.match(html, /PLACEHOLDER_PENDING_APPROVAL/);
assert.match(html, /4 direcciones × 6 pasos/);
assert.match(html, /IDLE.*PREPARAR.*GOLPE.*HERIDO.*CRÍTICO.*CAÍDO/s);
assert.doesNotMatch(html, /base herido/i);
for (const id of ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista']) {
  assert.match(html, new RegExp(`\\['${id}'`));
  assert.match(html, new RegExp(`combat-heroes/\\$\\{id\\}\\.png`));
}

console.log('PASS: la hoja de aprobación mantiene seis paneles, la matriz 4×6 y estados pendientes explícitos.');
