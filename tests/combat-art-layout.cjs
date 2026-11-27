const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('dist/combat-polish.css', 'utf8');

// The battle renderer uses a 1024x768 canvas inside a square actor box.  It
// must stay inside that box: the previous 200%/150% rule enlarged and cropped
// every approved strip, making the card and the arena disagree visually.
assert.match(css, /\.combat-art canvas\{[^}]*inset:0/);
assert.match(css, /\.combat-art canvas\{[^}]*width:100%/);
assert.match(css, /\.combat-art canvas\{[^}]*height:100%/);
assert.match(css, /\.combat-art canvas\{[^}]*object-fit:contain/);
assert.doesNotMatch(css, /\.combat-art canvas\{[^}]*width:200%/);
assert.doesNotMatch(css, /\.combat-art canvas\{[^}]*height:150%/);

console.log('PASS: los sprites de combate quedan contenidos en su marco y no se recortan.');
