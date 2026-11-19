const assert=require('node:assert/strict'),fs=require('node:fs');
for(const file of ['dist/chapter.js','dist/investigation.js','dist/character-data.js']){
  const text=fs.readFileSync(file,'utf8');
  assert(!/Mara[^\n]{0,100}hermana|hermana[^\n]{0,100}Mara/i.test(text),`${file} no llama hermana a Mara`);
}
assert(fs.readFileSync('dist/chapter.js','utf8').includes('hija de Sereth'));
console.log('PASS: Mara remains the daughter of Sereth across narrative data.');
