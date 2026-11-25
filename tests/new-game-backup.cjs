const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('dist/game.js', 'utf8');
assert(source.includes('function backupBeforeNewGame()'), 'new game should preserve a backup before clearing active saves');
assert(source.includes("localStorage.setItem('cenizas-new-game-backup'"), 'backup uses a dedicated storage key');
assert(source.includes("const keys=[SAVE,'cenizas-character-v1','cenizas-campaign-v2']"), 'backup includes both save namespaces and the character');
assert(source.includes('backupBeforeNewGame();try{localStorage.removeItem(SAVE)'), 'new game backs up before reset');
console.log('PASS: Juego nuevo respalda el progreso anterior antes de iniciar otra partida.');
