const assert = require('node:assert/strict');
const fs = require('node:fs');
const HV = require('../dist/hero-visuals.js');
const visualsSource = fs.readFileSync('dist/hero-visuals.js', 'utf8');

const races = Object.keys(HV.raceData);
const genders = Object.keys(HV.genderData);
const subclasses = [
  ['Guerrero', 'Guardia'], ['Guerrero', 'Berserker'],
  ['Pícaro', 'Sombra'], ['Pícaro', 'Explorador'],
  ['Mago', 'Arcanista'], ['Mago', 'Tejedor']
];
let combinations = 0;
const variantKeys = new Set();
const subclassEquipment = new Set();

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
    assert.ok(profile.subclassEquipment, `${subclass} declara equipo físico de silueta`);
    subclassEquipment.add(profile.subclassEquipment);
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
assert.equal(subclassEquipment.size, 6, 'los seis arquetipos tienen equipo visual distinto');
assert.notEqual(HV.profile({ class: 'Guerrero', race: 'Humano', gender: 'Hombre', subclass: 'Guardia' }).filter,
  HV.profile({ class: 'Guerrero', race: 'Humano', gender: 'Hombre', subclass: 'Berserker' }).filter,
  'Guardia y Berserker no comparten el mismo tratamiento visual');
assert.notEqual(HV.profile({ class: 'Pícaro', race: 'Humano', gender: 'Hombre', subclass: 'Sombra' }).filter,
  HV.profile({ class: 'Pícaro', race: 'Humano', gender: 'Hombre', subclass: 'Explorador' }).filter,
  'Sombra y Explorador no comparten el mismo tratamiento visual');
for (const cue of ['escudo-capa', 'hacha-furia', 'capucha-dagas', 'arco-rastreo', 'baston-runa', 'manto-ceniza'])
  assert(visualsSource.includes(cue), `el equipo ${cue} mantiene un ancla visual`);
assert(visualsSource.includes('Bow and quiver') && visualsSource.includes('twin daggers'), 'explorador y sombra tienen siluetas físicas distintas');
assert(!visualsSource.includes('bodyX - width * .21'), 'las variantes no dibujan el panel rectangular antiguo');
assert(HV.profile({ class: 'Mago', race: 'Humano', gender: 'Hombre', subclass: 'Arcanista' }).subclassEquipment.includes('baston'));
assert(HV.profile({ class: 'Mago', race: 'Orco', gender: 'Mujer', subclass: 'Tejedor' }).subclassEquipment.includes('ceniza'));
console.log('PASS: perfil visual cubre las 144 combinaciones de raza, clase, subclase y género.');
