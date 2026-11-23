const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const HV = require('../dist/hero-visuals.js');

const combat = fs.readFileSync(path.join(__dirname, '../dist/battle-visuals.js'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '../dist/app.js'), 'utf8');
const chapter = fs.readFileSync(path.join(__dirname, '../dist/chapter.js'), 'utf8');

const subclasses = [
  ['Guerrero', 'Guardia'], ['Guerrero', 'Berserker'],
  ['Pícaro', 'Sombra'], ['Pícaro', 'Explorador'],
  ['Mago', 'Arcanista'], ['Mago', 'Tejedor']
];
const keys = new Set();
for (const race of Object.keys(HV.raceData)) for (const gender of Object.keys(HV.genderData)) {
  for (const [className, subclass] of subclasses) {
    const profile = HV.profile({ race, gender, class: className, subclass });
    const rendered = HV.render(profile);
    assert.equal(rendered.variantKey, profile.variantKey);
    assert.ok(HV.heroAnchors[profile.file], `anclas para ${profile.file}`);
    assert.deepEqual(profile.silhouette, HV.raceData[race].silhouette);
    keys.add(profile.variantKey);
  }
}
assert.equal(keys.size, 144);
assert(/CenizasHeroVisuals/.test(app) && /HV\.render/.test(app), 'el creador usa el render compartido');
assert(/CenizasHeroVisuals/.test(chapter) && /paintVariantCanvas/.test(chapter), 'la escena usa el perfil compartido');
assert(/HV\?\.render/.test(combat), 'el combate usa el perfil compartido');
console.log('PASS: la matriz de 144 perfiles comparte variantKey, silueta y anclas entre creador, escena y combate.');
