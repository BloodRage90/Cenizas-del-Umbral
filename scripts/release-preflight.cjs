#!/usr/bin/env node
'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=path.resolve(__dirname,'..');
function assertPrologueAssets(){
  const html=fs.readFileSync(path.join(root,'dist','index.html'),'utf8');
  for(const marker of ['id="intro-cinema"','id="intro-video"','src="intro.mp4"','id="skip-intro"'])if(!html.includes(marker))throw new Error(`Falta el ancla del prólogo: ${marker}`);
  const menu=fs.readFileSync(path.join(root,'dist','menu.js'),'utf8');
  for(const marker of ['PRÓLOGO CINEMÁTICO · VALDARA','intro.dataset.stage=\'video\'','video.onended=finish'])if(!menu.includes(marker))throw new Error(`Falta la transición narrativa del prólogo: ${marker}`);
  const pixelScenes=['intro-pixel-plaza.webp','intro-pixel-montana.webp','intro-pixel-capilla.webp','intro-pixel-umbral.webp'];
  for(const scene of pixelScenes)if(!fs.existsSync(path.join(root,'dist','scenes',scene)))throw new Error(`Falta el plano pixel-art: ${scene}`);
  if(!fs.existsSync(path.join(root,'scripts','compose-intro-pixel.cjs')))throw new Error('Falta el compositor reproducible del prólogo pixel-art.');
  const video=path.join(root,'dist','intro.mp4');
  if(!fs.existsSync(video)||fs.statSync(video).size<100000)throw new Error('dist/intro.mp4 no existe o es demasiado pequeño para la introducción publicada.');
  console.log(`PROLOGUE ASSETS · intro.mp4 ${(fs.statSync(video).size/1048576).toFixed(1)} MiB`);
}
function run(label,args){
  console.log(`\nRELEASE PREFLIGHT · ${label}`);
  const result=spawnSync(process.execPath,args,{cwd:root,stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0){console.error(`FAIL: ${label} (${result.status??'signal'})`);process.exit(result.status||1);}
}

assertPrologueAssets();
run('identidad jugable',[path.join('scripts','identity-review.cjs')]);
const tests=fs.readdirSync(path.join(root,'tests')).filter(name=>name.endsWith('.cjs')).sort().map(name=>path.join('tests',name));
run('suite de regresión',['--test',...tests]);
console.log('\nPASS: preflight completo. La versión puede pasar a publicación.');
