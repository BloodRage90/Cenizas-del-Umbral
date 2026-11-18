const assert = require('node:assert/strict');
const HV = require('../dist/hero-visuals.js');

const races = Object.keys(HV.raceData);
const genders = Object.keys(HV.genderData);
const subclasses = [
  ['Guerrero', 'Guardia'], ['Guerrero', 'Berserker'],
  ['Pícaro', 'Sombra'], ['Pícaro', 'Explorador'],
  ['Mago', 'Arcanista'], ['Mago', 'Tejedor']
];
let combinations = 0;
const variantKeys = new Set();

for (const race of races) for (const gender of genders) for (const [className, subclass] of subclasses) {
    const profile = HV.profile({ class: className, race, gender, subclass });
    assert.equal(profile.class, className);
    assert.equal(profile.race, race);
    assert.equal(profile.gender, gender);
    assert.ok(profile.file.endsWith('.webp'));
    assert.ok(profile.baseTextureKey.startsWith('hero-'));
    assert.ok(profile.textureKey.startsWith('hero-'));
    assert.equal(profile.textureKey, profile.variantKey);
    variantKeys.add(profile.variantKey);
    assert.ok(profile.scale > 0);
    combinations++;
}

assert.equal(combinations, 144);
assert.equal(variantKeys.size, 144, 'cada combinación jugable debe generar un sprite único');
assert.notEqual(HV.profile({ class: 'Guerrero', race: 'Humano', gender: 'Hombre', subclass: 'Guardia' }).file,
  HV.profile({ class: 'Mago', race: 'Elfo', gender: 'Mujer', subclass: 'Tejedor' }).file);
assert.notEqual(HV.profile({ class: 'Guerrero', race: 'Orco', gender: 'Hombre', subclass: 'Guardia' }).scale,
  HV.profile({ class: 'Guerrero', race: 'Mediano', gender: 'Hombre', subclass: 'Guardia' }).scale);
assert.notEqual(HV.profile({ class: 'Pícaro', race: 'Humano', gender: 'Mujer', subclass: 'Sombra' }).genderFeature,
  HV.profile({ class: 'Pícaro', race: 'Humano', gender: 'No binario', subclass: 'Sombra' }).genderFeature);
console.log('PASS: perfil visual cubre las 144 combinaciones de raza, clase, subclase y género.');
