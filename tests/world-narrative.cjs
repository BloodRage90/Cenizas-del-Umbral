const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Data = require('../dist/character-data.js');
const Systems = require('../dist/combat-systems.js');
const overlay = require('../scripts/crypts-overlay.cjs');

const chapter = fs.readFileSync(path.join(__dirname, '..', 'dist', 'chapter.js'), 'utf8');
const places = [
  'plaza',
  'taller',
  'criptas',
  'bosque',
  'lindero',
  'embarcadero',
  'molino',
  'monasterio',
  'archivo',
  'enfermeria',
  'capilla',
  'montana',
  'antesala',
  'umbral',
];
const races = Object.keys(Data.raceData);

assert.equal(places.length, 14);
for (const race of races) {
  for (const place of places) {
    const variant = Data.raceVerbs[race][place];
    assert(
      variant?.verb && variant.promise && variant.dialogue,
      `${race}/${place} tiene una variante racial completa`,
    );
    const resolved = Systems.racialSecret(race, place);
    assert.equal(
      resolved.promise,
      variant.promise,
      `${race}/${place} usa la variante centralizada`,
    );
  }
}
assert.equal(
  new Set(places.map((place) => Systems.racialSecret('Elfo', place).promise)).size,
  places.length,
  'una raza cambia su texto por zona',
);
assert.notEqual(
  Systems.racialSecret('Humano', 'plaza', 'Guerrero').dialogue,
  Systems.racialSecret('Humano', 'plaza', 'Mago').dialogue,
  'los ganchos de clase son aditivos',
);
assert(
  chapter.includes('blockedPolys') && chapter.includes('criptas:{name:'),
  'las criptas declaran pasarelas y zonas bloqueadas',
);
assert(
  chapter.includes('exitArtStatus'),
  'las salidas tienen contrato de arte visible o pendiente',
);
assert.equal(overlay.walkable.length, 4);
assert.equal(overlay.blocked.length, 2);
for (const polygon of [...overlay.walkable, ...overlay.blocked])
  for (const [x, y] of polygon) {
    assert(
      x >= 0 && x <= overlay.WIDTH && y >= 0 && y <= overlay.HEIGHT,
      'los puntos de la superposición están dentro de la escena',
    );
  }
assert(
  overlay.overlaySvg().includes('criptas.webp'),
  'la herramienta de superposición apunta al arte WebP real',
);
console.log('PASS: 112 racial-zone variants, class hooks and crypt collision overlay are covered.');
