const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync(require.resolve('../dist/chapter.js'), 'utf8');
const bridge = fs.readFileSync(require.resolve('../dist/game.js'), 'utf8');

assert.match(chapter, /Motion\?\.stepDistance\?Motion\.stepDistance\(112/);
assert.doesNotMatch(chapter, /dt\*1\.35/);
assert.doesNotMatch(chapter, /heroFeatures[^;]*setVisible\(true\)/, 'no se reactivan triángulos sueltos en la plaza');
assert.match(chapter, /Traits are baked into the same variant texture/);
assert.match(chapter, /meta\.columns\*meta\.rows<=4\?0:Math\.min\(this\.hero\.walkFrame/);
assert.match(bridge, /bridgeDrawHeroDesign\(target,c\);target\.heroFeatures\?\.clear\(\)\.setVisible\(false\)/);
assert.match(bridge, /meta\.columns\*meta\.rows<=4\?0:Math\.min\(this\.hero\.walkFrame/);
assert.match(bridge, /CenizasMusic\?\.set\('plaza',false\)/, 'el puente usa la nueva música de Valdara');
assert.doesNotMatch(bridge, /bridgeUpdate\.call\(this,t,Math\.min\(dt\*1\.48/);

console.log('PASS: el movimiento usa un delta acotado y las decoraciones flotantes quedan ocultas.');
