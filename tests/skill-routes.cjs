const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Data=require('../dist/character-data.js');
const source=fs.readFileSync('dist/chapter.js','utf8');

const routeLabels=[
  'Abrir el cierre · Abrir cerraduras',
  'Leer el conducto · Saber (arcano)',
  'Pasar sin ser visto · Esconderse',
  'Leer la pendiente · Trepar',
  'Comparar relatos · Reunir información',
  'Leer la respuesta · Averiguar intenciones',
  'Leer el sello · Descifrar escritura',
  'Escalar el paso · Trepar',
  'Desactivar el atril · Inutilizar mecanismo',
  'Imponer la voz · Intimidar',
  'Resistir el eco · Concentración'
];
for(const label of routeLabels)assert(source.includes(`skillRoute('${label}'`),`ruta de habilidad presente: ${label}`);
assert((source.match(/skillRoute\(/g)||[]).length>=10,'hay al menos diez rutas de habilidad opcionales');

const start=source.indexOf('function skill(index,ability)');
const end=source.indexOf('async function skillCheck',start);
const context={character:{race:'Gnomo',base:[10,10,10,10,10,10],ranks:{}},R:{defaults:{base:[10,10,10,10,10,10]}},CD:Data,skillNames:Data.skillNames};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
assert.equal(vm.runInContext('skill(14,3)',context),2,'Gnomo conserva +2 en Inutilizar mecanismo');
context.character={race:'Orco',base:[10,10,10,10,10,10],ranks:{}};
assert.equal(vm.runInContext('skill(2,4)',context),-1,'Orco aplica −2 Sabiduría en Averiguar intenciones');

console.log('PASS: diez rutas de habilidad opcionales usan las reglas raciales centralizadas.');
