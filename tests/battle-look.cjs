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

// The six approved combat protagonists are real four-pose strips, not the
// generic class sheets. Keep this contract close to the renderer so a future
// cleanup cannot silently collapse them back into one sprite.
const combatHeroes = ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista'];
for (const id of combatHeroes) {
  const file = path.join(dist, 'combat-heroes', `${id}.png`);
  assert(fs.existsSync(file), `combat sprite strip exists for ${id}`);
  const png = fs.readFileSync(file);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `combat sprite strip is PNG for ${id}`);
}
assert(/subclassFiles:\{[\s\S]*Guardia:'combat-heroes\/guardia\.png'[\s\S]*Arcanista:'combat-heroes\/arcanista\.png'/.test(visuals), 'battle renderer maps every fixed protagonist to its own strip');
assert(/grid:\[4,1\],scale:1,noTraits:true/.test(visuals), 'combat strips use four poses without debug overlays');

console.log('PASS: Elara keeps her own combat look and never falls back to the protagonist sheet.');
