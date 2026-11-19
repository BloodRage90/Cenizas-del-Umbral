const assert=require('node:assert/strict'),fs=require('node:fs');
const chapter=fs.readFileSync('dist/chapter.js','utf8');
assert(chapter.includes("monasterio:['racialSecret','Piedra de los ocho relatos',600,420]"));
assert(chapter.includes("['raceInscription','Inscripción del Umbral',690,350]"));
assert(!chapter.includes("monasterio:['racialSecret','Piedra de los ocho relatos',690,350]"));
console.log('PASS: monastery racial secret no longer overlaps the inscription.');
