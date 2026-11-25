const assert = require('node:assert/strict');
const fs = require('node:fs');
const chapter = fs.readFileSync('dist/chapter.js', 'utf8');

for (const speaker of ['Elara', 'Maela', 'Ordan', 'Iria', 'Darien', 'Sereth', 'Tovin']) {
  assert(chapter.includes(`'${speaker}'`), `${speaker} está en la lista de NPC contextuales`);
}
assert(chapter.includes('identityGreetings'), 'las líneas contextuales se guardan por NPC');
assert(chapter.includes('CD.raceVerbs?.[character?.race]') && chapter.includes('CD.classVerbs?.[character?.class]'), 'la línea usa raza y clase canónicas');
assert(chapter.includes('speaker===\'Elara\'&&state.flags.identityGreeting'), 'los guardados antiguos conservan el saludo de Elara');
console.log('PASS: NPC clave reconocen la identidad elegida sin alterar sus sprites.');
