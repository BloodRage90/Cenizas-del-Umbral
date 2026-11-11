#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'dist', 'app.js');
const cssPath = path.join(root, 'dist', 'style.css');
const app = fs.readFileSync(appPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const races = ['Humano', 'Elfo', 'Enano', 'Orco', 'Mediano', 'Gnomo', 'Semielfo', 'Semiorco'];
const genders = ['Mujer', 'Hombre', 'No binario'];
const classes = ['Guerrero', 'Pícaro', 'Mago'];
const subclasses = {
  Guerrero: ['Guardia', 'Berserker'],
  Pícaro: ['Sombra', 'Explorador'],
  Mago: ['Arcanista', 'Tejedor'],
};

const errors = [];
const notes = [];
const fail = message => errors.push(message);
const note = message => notes.push(message);

function literal(name) {
  const match = app.match(new RegExp(`^const ${name}=(.*);$`, 'm'));
  if (!match) {
    fail(`No se encontró const ${name} en dist/app.js.`);
    return null;
  }
  try {
    return vm.runInNewContext(`(${match[1]})`, Object.create(null), { timeout: 1000 });
  } catch (error) {
    fail(`No se pudo leer ${name}: ${error.message}`);
    return null;
  }
}

function token(value) {
  return String(value).toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function fileFor(relative) {
  if (typeof relative !== 'string' || relative.startsWith('/') || relative.includes('..')) return null;
  const file = path.resolve(root, 'dist', relative);
  return file.startsWith(path.resolve(root, 'dist') + path.sep) ? file : null;
}

function hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const classData = literal('classes');
const raceData = literal('raceData');
const subclassData = literal('subclassData');
const genderData = literal('genderData');
const portraitAssets = literal('portraitAssets');

function buildRuntimeAudit() {
  const cut = app.lastIndexOf("document.querySelectorAll('[data-tab]').forEach");
  if (cut < 0) {
    fail('No se pudo aislar el runtime de creación de personajes.');
    return null;
  }
  const context = {
    localStorage: { getItem: () => null, setItem: () => {} },
    crypto: crypto.webcrypto,
  };
  vm.createContext(context);
  try {
    vm.runInContext(`${app.slice(0, cut)}
globalThis.__identityAudit={
  classes,raceData,subclassData,genderData,portraitAssets,
  setState(next){s=next;normalizeCharacter();normalize()},
  visualProfile,portraitSource,identitySprite,stats
};`, context, { timeout: 3000 });
    return context.__identityAudit;
  } catch (error) {
    fail(`El runtime de creación de personajes no pudo iniciar: ${error.message}`);
    return null;
  }
}

if (classData) {
  for (const name of classes) if (!Object.prototype.hasOwnProperty.call(classData, name)) fail(`Falta la clase ${name}.`);
  for (const name of Object.keys(classData)) if (!classes.includes(name)) note(`Clase no contemplada por la matriz: ${name}.`);
  for (const name of classes) {
    if (!classData[name]?.weapon || !classData[name]?.gear) fail(`La clase ${name} no tiene arma o equipo inicial.`);
    if (!Array.isArray(classData[name]?.pres) || classData[name].pres.length !== 6) fail(`La clase ${name} no tiene seis atributos recomendados.`);
  }
}

if (raceData) {
  for (const name of races) if (!Object.prototype.hasOwnProperty.call(raceData, name)) fail(`Falta la raza ${name}.`);
  for (const name of Object.keys(raceData)) if (!races.includes(name)) note(`Raza no contemplada por la matriz: ${name}.`);
  for (const name of races) {
    if (!Array.isArray(raceData[name]?.mods) || raceData[name].mods.length !== 6) fail(`La raza ${name} no tiene seis modificadores.`);
    if (!Number.isFinite(raceData[name]?.speed) || raceData[name].speed <= 0) fail(`La raza ${name} no tiene velocidad jugable.`);
  }
}

if (subclassData) {
  for (const [className, expected] of Object.entries(subclasses)) {
    const actual = (subclassData[className] || []).map(entry => entry[0]);
    for (const name of expected) if (!actual.includes(name)) fail(`Falta la subclase ${className} · ${name}.`);
    for (const name of actual) if (!expected.includes(name)) note(`Subclase no contemplada por la matriz: ${className} · ${name}.`);
  }
}

if (genderData) {
  const actual = genderData.map(entry => entry[0]);
  for (const name of genders) if (!actual.includes(name)) fail(`Falta el género ${name}.`);
}

const matrix = [];
for (const race of races) for (const className of classes) for (const subclass of subclasses[className]) for (const gender of genders) {
  matrix.push({ race, className, subclass, gender });
  const asset = portraitAssets?.[race]?.[gender];
  const file = fileFor(asset);
  if (!file) fail(`Ruta de retrato inválida: ${race} · ${gender} → ${asset || '(vacía)'}.`);
  else if (!fs.existsSync(file)) fail(`Falta el retrato ${race} · ${gender}: dist/${asset}.`);
}

if (matrix.length !== 144) fail(`La matriz tiene ${matrix.length} combinaciones; se esperaban 144.`);

if (portraitAssets) {
  const mapped = new Map();
  for (const [race, byGender] of Object.entries(portraitAssets)) for (const [gender, asset] of Object.entries(byGender)) {
    const key = `${race} · ${gender}`;
    if (mapped.has(asset)) fail(`El mismo retrato se reutiliza en ${mapped.get(asset)} y ${key}: ${asset}.`);
    else mapped.set(asset, key);
  }
  const hashes = new Map();
  for (const [asset, key] of mapped.entries()) {
    const file = fileFor(asset);
    if (!file || !fs.existsSync(file)) continue;
    const digest = hash(file);
    if (hashes.has(digest)) fail(`Archivos de retrato idénticos: ${hashes.get(digest)} y ${key}.`);
    else hashes.set(digest, key);
  }
}

const spriteFunction = app.match(/function identitySprite\(\)\{([^{}]*)\}/);
if (!spriteFunction) fail('No se encontró identitySprite(); la vista podría perder el diseño de clase.');
else {
  const identitySprite = vm.runInNewContext(`(s=>{${spriteFunction[1]}})`);
  const seenByClass = new Map();
  for (const className of classes) for (const subclass of subclasses[className]) {
    const asset = identitySprite({ class: className, subclass });
    const file = fileFor(asset);
    if (!file || !fs.existsSync(file)) fail(`Falta el sprite ${className} · ${subclass}: dist/${asset}.`);
    if (!seenByClass.has(className)) seenByClass.set(className, []);
    seenByClass.get(className).push({ subclass, asset });
  }
  for (const [className, entries] of seenByClass) {
    const groups = new Map();
    for (const entry of entries) groups.set(entry.asset, [...(groups.get(entry.asset) || []), entry.subclass]);
    for (const [asset, names] of groups) if (names.length > 1) note(`Sprite base compartido en ${className} · ${names.join(' / ')}: ${asset}; la diferencia debe venir de la capa visual.`);
  }
  const mage = seenByClass.get('Mago') || [];
  if (mage.length === 2 && mage[0].asset === mage[1].asset) fail('Arcanista y Tejedor usan el mismo sprite; las subclases de Mago deben diferenciarse.');
}

if (!app.includes('Object.keys(raceData).map')) fail('El selector de raza no recorre raceData completo.');
for (const required of ['data-race', 'data-gender', 'v.raceClass', 'v.genderClass', 'identitySprite()']) {
  if (!app.includes(required)) fail(`La identidad visual no conserva ${required}.`);
}
for (const race of races.slice(1)) if (!css.includes(`.preview-character-stage.pixel-combat.${token(race)}`)) fail(`Falta la capa visual de raza ${race} en dist/style.css.`);
const genderTokens = Object.fromEntries((genderData || []).map(entry => [entry[0], entry[1]]));
for (const gender of genders) if (!css.includes(`.preview-character-stage.${genderTokens[gender] || token(gender)}`)) fail(`Falta la capa visual de género ${gender} en dist/style.css.`);
for (const names of Object.values(subclasses)) for (const name of names) {
  if (!app.includes(`'${name}'`)) fail(`No aparece la subclase ${name} en dist/app.js.`);
}
for (const visual of ['guardian', 'berserker', 'shadow', 'scout', 'arcane', 'ash-weaver']) if (!css.includes(`.${visual}`)) fail(`Falta el tratamiento visual de subclase .${visual}.`);

const runtime = buildRuntimeAudit();
if (runtime) {
  for (const { race, className, subclass, gender } of matrix) {
    try {
      runtime.setState({
        name: 'QA', race, class: className, subclass, gender,
        alignment: 'Neutral bueno', base: [...runtime.classes[className].pres],
        levelBonuses: {}, progressionLevel: 1, ranks: {}, feats: [],
      });
      const profile = runtime.visualProfile();
      const expectedSubclass = runtime.subclassData[className].find(entry => entry[0] === subclass);
      const expectedGender = runtime.genderData.find(entry => entry[0] === gender);
      const expectedPortrait = runtime.portraitAssets[race][gender];
      if (profile.subclass !== subclass || profile.visual !== expectedSubclass?.[3]) fail(`Perfil inconsistente: ${race} · ${className} · ${subclass} · ${gender}.`);
      if (profile.gender !== gender || profile.genderClass !== expectedGender?.[1]) fail(`Género inconsistente: ${race} · ${className} · ${subclass} · ${gender}.`);
      if (profile.raceClass !== token(race)) fail(`Raza inconsistente: ${race} · ${className} · ${subclass} · ${gender}.`);
      if (runtime.portraitSource() !== expectedPortrait) fail(`El retrato no resuelve correctamente: ${race} · ${gender}.`);
      const stats = runtime.stats();
      for (const key of ['hp', 'ac', 'attack', 'init']) if (!Number.isFinite(stats[key])) fail(`Estadística inválida (${key}): ${race} · ${className} · ${subclass} · ${gender}.`);
    } catch (error) {
      fail(`Personaje no ejecutable (${race} · ${className} · ${subclass} · ${gender}): ${error.message}`);
    }
  }
}

console.log('IDENTITY REVIEW · Cenizas del Umbral');
console.log(`Matriz revisada: ${matrix.length} combinaciones (${races.length} razas × ${classes.length} clases × 2 subclases × ${genders.length} géneros).`);
console.log(`Retratos revisados: ${portraitAssets ? Object.values(portraitAssets).reduce((sum, group) => sum + Object.keys(group).length, 0) : 0}.`);
console.log(`Personajes jugables ejecutados: ${runtime ? matrix.length : 0}.`);
if (notes.length) for (const message of notes) console.log(`NOTE: ${message}`);
if (errors.length) {
  console.error(`BLOQUEOS: ${errors.length}`);
  for (const message of errors) console.error(`- ${message}`);
  process.exitCode = 1;
} else {
  console.log('PASS: todas las combinaciones tienen datos, retrato y tratamiento visual.');
}
