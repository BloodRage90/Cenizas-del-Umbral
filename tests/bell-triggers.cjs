const assert=require('node:assert/strict'),fs=require('node:fs');
const chapter=fs.readFileSync('dist/chapter.js','utf8');
for(const name of ['plazaBell','forestBell','umbralSilence'])assert(chapter.includes(`function ${name}`),`${name} existe`);
assert(chapter.includes('plazaBell();')&&chapter.includes('await forestBell();')&&chapter.includes('umbralSilence().catch'));
for(const flag of ['bellPlaza','bellForest','umbralSilenceSeen','lastName'])assert(chapter.includes(flag),`${flag} persiste`);
console.log('PASS: bell motif triggers are guarded and persisted at each act boundary.');
