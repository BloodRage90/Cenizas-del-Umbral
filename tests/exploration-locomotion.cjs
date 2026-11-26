const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync(require.resolve('../dist/chapter.js'), 'utf8');
const bridge = fs.readFileSync(require.resolve('../dist/game.js'), 'utf8');

assert.match(chapter, /Motion\?\.stepDistance\?Motion\.stepDistance\(112/);
assert.doesNotMatch(chapter, /dt\*1\.35/);
assert.doesNotMatch(chapter, /heroFeatures[^;]*setVisible\(true\)/, 'no se reactivan triángulos sueltos en la plaza');
assert.match(chapter, /Traits are baked into the same variant texture/);
assert.match(chapter, /ensureHeroWalkVariant\(v\)/);
assert.match(chapter, /walkColumns=meta\.columns;this\.hero\.walkRows=meta\.rows;this\.hero\.walkStride=20/);
assert.match(bridge, /load\.image\('hero-vigilia','hero-vigilia\.webp'\)/);
assert.match(bridge, /ensureHeroWalkVariant\(v\)/);
assert.match(bridge, /heroKey=this\.ensureHeroWalkVariant\(initial\)/);
assert.match(bridge, /this\.hero\.walkStride=20/);
const visuals = fs.readFileSync(require.resolve('../dist/hero-visuals.js'), 'utf8');
assert.match(visuals, /paintWalkCanvas/);
assert.match(visuals, /function drawWalkEquipment/);
assert.match(visuals, /spec\.mark === 'shield'/);
assert.match(visuals, /spec\.mark === 'rage'/);
assert.match(visuals, /spec\.mark === 'crescent'/);
assert.match(visuals, /spec\.mark === 'compass'/);
assert.match(visuals, /spec\.mark === 'rune'/);
assert.match(visuals, /spec\.mark === 'ember'/);
assert.match(visuals, /drawWalkEquipment\(ctx, dx, dy, frameWidth, frameHeight, spec, row\)/);
assert.match(bridge, /bridgeDrawHeroDesign\(target,c\);target\.heroFeatures\?\.clear\(\)\.setVisible\(false\)/);
assert.match(bridge, /bridgeDrawHeroDesign/);
assert.match(bridge, /CenizasMusic\?\.set\('plaza',false\)/, 'el puente usa la nueva música de Valdara');
assert.doesNotMatch(bridge, /bridgeUpdate\.call\(this,t,Math\.min\(dt\*1\.48/);

console.log('PASS: el movimiento usa un delta acotado y las decoraciones flotantes quedan ocultas.');
