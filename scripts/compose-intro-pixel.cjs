#!/usr/bin/env node
'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');

const root=path.resolve(__dirname,'..');
const dist=path.join(root,'dist');
const work=path.join(root,'.intro-pixel-work');
const ffmpeg=process.env.FFMPEG_BIN||'ffmpeg';
const output=path.join(dist,'intro.mp4');

const scenes=[
  {file:'intro-pixel-plaza.png',text:'Durante trece años, las campanas de Valdara guardaron silencio.'},
  {file:'intro-pixel-montana.png',text:'Una carta sellada con ceniza llega a tus manos.'},
  {file:'intro-pixel-capilla.png',text:'La Vigilia juró proteger un umbral que nadie puede ver.'},
  {file:'intro-pixel-umbral.png',text:'Alguien intenta abrirlo desde el otro lado.',title:true}
];

function run(args){
  const result=spawnSync(ffmpeg,args,{cwd:root,stdio:'inherit',windowsHide:true});
  if(result.error)throw result.error;
  if(result.status!==0)throw new Error(`ffmpeg terminó con código ${result.status}`);
}
function escapeDrawtext(value){
  return value.replace(/\\/g,'\\\\').replace(/:/g,'\\:').replace(/'/g,"\\'").replace(/%/g,'\\%');
}
function sceneFilter(scene){
  const text=escapeDrawtext(scene.text);
  const alpha="if(lt(t,0.45),t/0.45,if(gt(t,6.35),(7-t)/0.65,1))";
  const filters=[
    'scale=1280:720:force_original_aspect_ratio=increase:flags=lanczos',
    'crop=1280:720',
    "zoompan=z='min(zoom+0.00018,1.075)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=30",
    'drawbox=x=0:y=570:w=1280:h=150:color=black@0.48:t=fill',
    `drawtext=font='Georgia':text='${text}':fontcolor=0xf5ead2:fontsize=30:x=(w-text_w)/2:y=618:alpha='${alpha}'`
  ];
  if(scene.title){
    filters.push("drawtext=font='Georgia':text='CENIZAS DEL UMBRAL':fontcolor=0xf5ead2:fontsize=44:x=(w-text_w)/2:y=472:alpha='if(lt(t,1),t,1)'", "drawtext=font='Georgia':text='EL VIAJE COMIENZA':fontcolor=0xe2bd6d:fontsize=18:x=(w-text_w)/2:y=530:alpha='if(lt(t,1),t,1)'");
  }
  return filters.join(',');
}

function main(){
  for(const scene of scenes){
    const source=path.join(dist,'scenes',scene.file);
    if(!fs.existsSync(source))throw new Error(`Falta el plano pixel-art: ${source}`);
  }
  if(!fs.existsSync(output))throw new Error(`Falta la pista de música base: ${output}`);
  fs.rmSync(work,{recursive:true,force:true});
  fs.mkdirSync(work,{recursive:true});
  const clips=[];
  try{
    scenes.forEach((scene,index)=>{
      const clip=path.join(work,`scene-${index}.mp4`);
      run(['-y','-loop','1','-i',path.join(dist,'scenes',scene.file),'-t','7','-vf',sceneFilter(scene),'-an','-r','30','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',clip]);
      clips.push(clip);
    });
    const inputs=clips.flatMap(clip=>['-i',clip]).concat(['-i',output]);
    const filter='[0:v][1:v]xfade=transition=fade:duration=0.6:offset=6.4[v01];[v01][2:v]xfade=transition=fade:duration=0.6:offset=12.8[v012];[v012][3:v]xfade=transition=fade:duration=0.6:offset=19.2[vraw];[vraw]tpad=stop_mode=clone:stop_duration=2,trim=duration=28,setpts=PTS-STARTPTS[vout]';
    const rebuilt=path.join(work,'intro-pixel.mp4');
    run(['-y',...inputs,'-filter_complex',filter,'-map','[vout]','-map','4:a:0','-t','28','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-af','afade=t=in:st=0:d=1,afade=t=out:st=26:d=2','-movflags','+faststart',rebuilt]);
    fs.copyFileSync(rebuilt,output);
    console.log(`OK: ${path.relative(root,output)} · ${(fs.statSync(output).size/1048576).toFixed(1)} MiB · 4 planos pixel-art`);
  }finally{
    fs.rmSync(work,{recursive:true,force:true});
  }
}

main();
