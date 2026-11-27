const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync('dist/chapter.js', 'utf8');
const locomotion = fs.readFileSync('dist/locomotion.js', 'utf8');

assert.match(chapter, /__heroWalkSynthetic=true/);
assert.match(chapter, /drawImage\(image,0,0,frameWidth,frameHeight/);
assert.match(locomotion, /if\(sprite\.walkSynthetic\)/);
assert.match(locomotion, /setFlipX\(!!sprite\.facingLeft\)/);
assert.match(locomotion, /setRotation\(walking\?/);

console.log('PASS: las tiras de combate conservan la silueta en exploración sin filtrar poses de ataque.');
