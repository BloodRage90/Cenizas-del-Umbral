const assert = require('node:assert/strict');
const fs = require('node:fs');

const game = fs.readFileSync('dist/game.js', 'utf8');
assert.match(game, /dialogueTone='direct'/, 'the bridge dialogue has a persisted tone');
assert.match(game, /No estoy seguro\. Prefiero no hablar de la carta\./, 'the guarded answer is real');
assert.match(game, /Compartir la carta y seguir adelante/, 'the guarded route can rejoin the gate route');
assert.match(game, /dialogueTone==='guarded'/, 'the alternate answer changes the next line');

console.log('PASS: la charla inicial ofrece respuestas reales y conserva la consecuencia elegida.');
