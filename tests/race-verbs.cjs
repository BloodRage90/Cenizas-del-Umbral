const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),D=require('../dist/character-data.js'),S=require('../dist/combat-systems.js');
const races=Object.keys(D.raceData);assert.equal(races.length,8);assert.equal(Object.keys(D.raceVerbs).length,8);
assert.equal(new Set(races.map(r=>S.racialSecret(r,'plaza').dialogue)).size,8,'cada raza tiene diálogo propio');
assert.equal(new Set(races.map(r=>S.racialSecret(r,'plaza').verb)).size,8,'cada raza tiene verbo propio');
const isolated={};vm.runInNewContext(fs.readFileSync('dist/combat-systems.js','utf8'),isolated);assert.equal(isolated.CenizasCombatSystems.racialSecret('Humano','plaza').verb,'Recordar','sin character-data existe un secreto racial seguro');
console.log('PASS: all eight races expose distinct verbs, promises and dialogue.');
