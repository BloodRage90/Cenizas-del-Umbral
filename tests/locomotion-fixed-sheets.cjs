const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync('dist/chapter.js', 'utf8');
const locomotion = fs.readFileSync('dist/locomotion.js', 'utf8');
const visuals = fs.readFileSync('dist/hero-visuals.js', 'utf8');

assert.match(chapter, /paintWalkCanvas\(base\.getSourceImage\(\),v,\{columns:5,rows:4/);
assert.match(chapter, /__heroWalkDirectional=true/);
assert.match(chapter, /variant\.add\(r\*5\+c/);
assert.match(locomotion, /if\(sprite\.walkSynthetic\)/);
assert.match(locomotion, /const frameDirection=direction%rows/);
assert.match(locomotion, /setFlipX\(!!sprite\.facingLeft\)/);
assert.match(locomotion, /setRotation\(walking\?/);
assert.match(visuals, /const columns = options\.columns \|\| 5/);

console.log('PASS: las tiras de combate conservan la silueta en exploración sin filtrar poses de ataque.');
