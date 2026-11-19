const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const bytes = relative => fs.statSync(path.join(root, 'dist', relative)).size;
const base = [
  'phaser.min.js', 'chapter.js', 'battle-visuals.js', 'battle-scene.js', 'combat.js',
  'umbral-battle.js', 'chest.js', 'equipment.js', 'investigation.js', 'interaction-cues.js',
  'npc-visuals.js', 'bell-cinema.js', 'character-data.js', 'assets.js', 'battle-preferences.js',
  'locomotion.js', 'navigation.js', 'dice.js', 'music.js', 'joystick.js', 'chapter.css',
  'combat-polish.css', 'hero-vigilia.webp', 'elara-walk.webp',
  'guard.webp', 'npc-atlas.webp', 'npc-citizens.webp', 'npc-clergy.webp', 'trail-sign.webp',
  'combat-echo.webp', 'custodian.webp', 'chest.webp',
].reduce((sum, file) => sum + bytes(file), 0);
const scenes = fs.readdirSync(path.join(root, 'dist', 'scenes'))
  .filter(file => file.endsWith('.webp'))
  .map(file => fs.statSync(path.join(root, 'dist', 'scenes', file)).size)
  .sort((a, b) => b - a);
const worstCase = base + scenes[0] + scenes[1];
assert.ok(worstCase < 15 * 1024 * 1024, `la carga estimada supera 15 MiB: ${(worstCase / 1048576).toFixed(2)} MiB`);
console.log(`PASS: presupuesto de carga de capítulo ${(worstCase / 1048576).toFixed(2)} MiB (<15 MiB).`);
