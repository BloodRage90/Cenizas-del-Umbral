const assert=require('node:assert/strict');
const I=require('../dist/investigation.js');
const s={flags:{}};
for(const id of ['oath','captives','copies'])I.read(s,id);
assert.equal(I.ready(s),true,'las tres fuentes obligatorias abren el acto II');
assert.equal(s.flags.maraDeath,undefined,'la pista de Mara no se fuerza');
const withMara={flags:{archiveOath:true,archiveCaptives:true,archiveCopies:true}};
I.read(withMara,'maraDeath');assert.equal(I.ready(withMara),true,'leer Mara sigue siendo opcional');
console.log('PASS: the archive puzzle ignores optional Mara context.');
