const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// H-03: a party member with her own design must never be drawn with the
// protagonist's class sheet or with default race/gender/subclass values.
const dist = path.resolve(__dirname, '../dist');
const combat = fs.readFileSync(path.join(dist, 'combat.js'), 'utf8');
const visuals = fs.readFileSync(path.join(dist, 'battle-visuals.js'), 'utf8');

assert(/id:'elara',name:'Elara',look:\{sheet:'elara-walk'/.test(combat), 'Elara declares her own look');
assert(/const ownLook=!!unit\?\.look\|\|id==='elara'/.test(visuals), 'old saved combats without look still resolve Elara');
assert(/a\.dataset\.kind=ownLook\?'ally'/.test(visuals), 'units with their own look are drawn as ally');
assert(/if\(unit\?\.team==='party'&&!ownLook\)/.test(visuals), 'ally units never receive hero class/race defaults');
assert(/if\(a\.dataset\.kind==='ally'\)return sprites\.ally;/.test(visuals), 'ally spec is separate from heroSpec');

// Her combat poses are a 2x2 sheet like the hero sheets, painted without race/gender overlays.
assert(/ally:\{file:'elara-combat\.webp',grid:\[2,2\],scale:1,noTraits:true\}/.test(visuals), 'ally uses her own 2x2 combat sheet');
assert(/if\(spec\.grid\)[\s\S]*HV\?\.render\?\.\(spec/.test(visuals), 'all grid actors use the shared render API');
assert(!/paintHeroTraits/.test(visuals), 'legacy floating hero overlay renderer is removed');
assert(/function render\(character = \{\}, options = \{\}\)/.test(fs.readFileSync(path.join(dist, 'hero-visuals.js'), 'utf8')), 'shared render API exists');
const sheet = path.join(dist, 'elara-combat.webp');
assert(fs.existsSync(sheet), 'combat sheet exists');
const header = fs.readFileSync(sheet).subarray(0, 32);
assert.equal(header.subarray(0, 4).toString(), 'RIFF');
assert.equal(header.subarray(8, 12).toString(), 'WEBP');

console.log('PASS: Elara keeps her own combat look and never falls back to the protagonist sheet.');
