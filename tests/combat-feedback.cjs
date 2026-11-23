const assert = require('node:assert/strict');
const fs = require('node:fs');

const visuals = fs.readFileSync('dist/battle-visuals.js', 'utf8');
const css = fs.readFileSync('dist/chapter.css', 'utf8');
const scene = fs.readFileSync('dist/battle-scene.js', 'utf8');
assert(/windup=short\?1:140/.test(visuals), 'anticipación de 140 ms');
assert(/travelDuration=short\?1:120/.test(visuals), 'avance de 120 ms');
assert(/freeze=short\?1:60/.test(visuals), 'congelado de impacto');
assert(/duration:80/.test(visuals), 'destello y reacción rápida');
assert(/duration:100/.test(visuals), 'sacudida de cámara acotada');
assert(/max-height:30dvh/.test(css) && /attack-roll::backdrop/.test(css), 'dados compactos sobre la arena');
assert(/if\(busy\)return null/.test(scene) && /finally\{stage/.test(scene), 'busy y limpieza de la secuencia son seguros');
console.log('PASS: el feedback de combate mantiene anticipación, impacto, recuperación y dados compactos.');
