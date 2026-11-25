const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync('dist/chapter.js', 'utf8');
const css = fs.readFileSync('dist/chapter.css', 'utf8');

assert(chapter.includes("const livingTargets=s.units.filter(u=>u.team!=='party'&&u.hp>0)"), 'el selector reúne todos los enemigos vivos');
assert(chapter.includes("select.id='battle-target'"), 'todos los encuentros exponen selector de objetivo');
assert(chapter.includes("targetStatus.id='battle-target-status'"), 'el objetivo muestra sus PG actuales');
assert(chapter.includes("s.targetId=select.value"), 'cambiar el selector actualiza el objetivo persistido');
assert(css.includes('.battle-target-picker') && css.includes('#battle-target-status'), 'selector de objetivo tiene estilo táctil y legible');
console.log('PASS: cada combate ofrece objetivo explícito y PG visibles.');
