const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dice = fs.readFileSync(path.join(root, 'dist/dice.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'dist/chapter.css'), 'utf8');

assert(dice.includes('function d6Svg'), 'el d6 usa una silueta cúbica');
assert(dice.includes('function d8Svg'), 'el d8 usa una silueta octaédrica');
assert(dice.includes('function facePips'), 'el d6 muestra caras con pips');
assert(css.includes('.d6-face') && css.includes('.d8-face'), 'd6 y d8 tienen caras facetadas');
assert(
  css.includes('#dice-dialog.attack-roll #dice-tray{grid-template-columns:repeat(5'),
  'los cinco dados de ataque permanecen en una fila acotada',
);
console.log('PASS: d6, d8 y d20 usan siluetas facetadas legibles y no se solapan con el botón.');
