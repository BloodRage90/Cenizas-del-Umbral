/* Lightweight, deterministic RSI audit for the no-build distribution. */
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=[];
for(const dir of ['dist','scripts','tests']){
  const absolute=path.join(root,dir);
  for(const file of fs.readdirSync(absolute))if(/\.(?:js|cjs)$/.test(file)&&file!=='rsi-audit.cjs')files.push(path.join(absolute,file));
}
const source=files.map(file=>fs.readFileSync(file,'utf8')).join('\n');
const issues=[];
if(/catch\s*\{\s*\}/.test(source))issues.push('catch vacío');
if(/\b(?:TODO|FIXME)\b/.test(source))issues.push('TODO/FIXME sin resolver');
const app=fs.readFileSync(path.join(root,'dist/app.js'),'utf8');
for(const name of ['renderPortrait','identity','sheet','updateHero','changed','bind']){
  const count=(app.match(new RegExp(`function ${name}\\(`,'g'))||[]).length;
  if(count!==1)issues.push(`app.js duplica ${name} (${count})`);
}
const chapter=fs.readFileSync(path.join(root,'dist/chapter.js'),'utf8');
if((chapter.match(/function bindBattleBoard/g)||[]).length)issues.push('bindBattleBoard heredada');
for(const flag of ['maraDeath','bellPlaza','bellForest','bellUmbral','lastName','questionAnswer']){
  const count=(source.match(new RegExp(`state\\.flags\\.${flag}\\b`,'g'))||[]).length;
  if(count<2)issues.push(`flag narrativa sin lectura/escritura suficiente: ${flag}`);
}
if(issues.length){console.error('RSI audit failed:',issues.join('; '));process.exit(1);}
console.log(`PASS: RSI static audit (${files.length} source files, no dead patterns found).`);
