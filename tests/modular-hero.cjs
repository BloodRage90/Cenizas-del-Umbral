const assert = require('node:assert/strict');
const fs = require('node:fs');
const Hero = require('../dist/hero-visuals.js');

assert.equal(
  Hero.compose({ class: 'Guerrero', race: 'Humano', gender: 'Mujer', subclass: 'Guardia' }),
  null,
  'la composición modular permanece apagada por defecto',
);
const pending = Hero.compose(
  { class: 'Mago', race: 'Elfo', gender: 'Hombre', subclass: 'Tejedor' },
  { enabled: true },
);
assert.equal(pending.pending, true, 'sin capas entregadas se devuelve un marcador explícito');
assert(
  fs.readFileSync('ART_ASSET_MATRIX.md', 'utf8').includes('CENIZAS_MODULAR_HERO'),
  'la decisión de arte queda documentada',
);

const previousDocument = global.document;
global.document = {
  createElement() {
    return {
      width: 0,
      height: 0,
      dataset: {},
      getContext() {
        return { imageSmoothingEnabled: false, save() {}, restore() {}, drawImage() {} };
      },
    };
  },
};
const source = { width: 128, height: 128 };
const profile = Hero.profile({
  class: 'Guerrero',
  race: 'Enano',
  gender: 'No binario',
  subclass: 'Guardia',
});
const first = Hero.compose(profile, {
  enabled: true,
  size: 128,
  layers: [{ id: 'body', source, columns: 1, rows: 1 }],
});
const second = Hero.compose(profile, {
  enabled: true,
  size: 128,
  layers: [{ id: 'body', source, columns: 1, rows: 1 }],
});
assert.equal(first, second, 'la misma variante reutiliza la textura compuesta');
assert.equal(Hero.compose.stats().entries, 1);
assert(Hero.compose.stats().estimatedBytes <= Hero.compose.stats().budget);
global.document = previousDocument;
console.log('PASS: modular hero composition is gated, cached and budgeted without final art.');
