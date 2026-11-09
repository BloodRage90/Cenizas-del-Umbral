// Original score and deterministic offline instruments. Requires Node and FFmpeg only.
// Usage: node scripts/compose-soundtrack.cjs [track ...]
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/music'),tmp=path.join(root,'.soundtrack-work');
fs.mkdirSync(tmp,{recursive:true});
const SR=24000,TAU=Math.PI*2;
const major=[0,2,4,5,7,9,11],minor=[0,2,3,5,7,8,10],dorian=[0,2,3,5,7,9,10];
// Each pair is scale degree / duration in beats. Rests are null.
const themes={
 city:[[[2,1],[4,.5],[5,.5],[4,1],[1,1]],[[0,1.5],[2,.5],[1,1],[null,1]],[[2,.5],[3,.5],[4,1],[6,1],[5,1]],[[4,2],[2,1],[1,1]],[[0,1],[2,1],[4,1.5],[3,.5]],[[2,.5],[1,.5],[0,1],[1,1],[3,1]],[[2,1],[4,1],[1,1],[6-7,1]],[[0,3],[null,1]]],
 bond:[[[4,1.5],[2,.5],[1,1],[0,1]],[[2,2],[null,.5],[3,.5],[4,1]],[[5,1],[4,1],[2,1],[1,1]],[[0,3],[null,1]],[[2,1],[4,.5],[6,.5],[5,2]],[[4,1.5],[3,.5],[2,1],[0,1]],[[1,1],[2,1],[6-7,1],[1,1]],[[0,3],[null,1]]],
 forest:[[[0,.5],[4,.5],[6,1],[5,.5],[4,.5],[2,1]],[[1,1.5],[3,.5],[2,1],[null,1]],[[4,.5],[6,.5],[7,1],[6,1],[4,1]],[[3,2],[1,1],[null,1]],[[2,.5],[4,.5],[5,1],[4,.5],[2,.5],[0,1]],[[6-7,1],[1,1],[3,1],[2,1]],[[1,.5],[2,.5],[4,1],[3,1],[6-7,1]],[[0,2.5],[null,1.5]]],
 battle:[[[0,.5],[0,.5],[4,.5],[3,.5],[2,1],[4,1]],[[5,.75],[4,.25],[2,1],[1,.5],[2,.5],[3,1]],[[4,.5],[4,.5],[7,1],[6,.5],[5,.5],[4,1]],[[3,1.5],[2,.5],[1,1],[6-7,1]],[[0,.5],[2,.5],[4,1],[5,.5],[4,.5],[2,1]],[[3,.5],[5,.5],[7,1],[6,1],[5,1]],[[4,.75],[3,.25],[2,.5],[1,.5],[6-7,1],[1,1]],[[0,2],[4-7,1],[6-7,1]]]
};
// id, title, tempo, tonic, mode, theme, lead, percussion, chord degrees
const scores=[
 ['plaza','Valdara · los nombres al sol',100,62,major,'city','flute',1,[0,5,3,4,0,2,3,4]],
 ['exploration','La carta y el camino',108,62,major,'city','flute',1,[0,3,5,4,0,5,3,4]],
 ['taller','Ordan · madera y bronce',84,55,dorian,'bond','pluck',0,[0,3,2,4,0,5,3,4]],
 ['criptas','El río guarda nombres',76,50,minor,'forest','bell',0,[0,5,3,4,0,2,5,4]],
 ['bosque','Susurros entre las hojas',94,57,dorian,'forest','flute',1,[0,3,6,4,0,5,3,4]],
 ['lindero','Antes de cruzar',112,60,major,'city','pluck',1,[0,5,3,4,2,5,3,4]],
 ['embarcadero','Agua de regreso',88,55,major,'bond','flute',0,[0,3,5,4,2,5,3,4]],
 ['molino','Ruedas sobre la garganta',116,50,dorian,'forest','pluck',2,[0,6,3,4,0,5,3,4]],
 ['monasterio','Hospitalidad de ceniza',78,53,minor,'city','reed',0,[0,5,3,4,0,6,3,4]],
 ['archivo','La tinta recuerda',86,60,dorian,'forest','pluck',0,[0,2,5,4,3,0,5,4]],
 ['enfermeria','Elara y Darien · volver',80,62,major,'bond','flute',0,[0,5,3,4,2,5,3,4]],
 ['capilla','Mara · memoria prestada',72,57,minor,'bond','bell',0,[0,5,3,4,0,6,3,4]],
 ['montana','La deuda que no elegimos',104,52,minor,'city','reed',1,[0,6,5,4,0,3,5,4]],
 ['antesala','Nadie ocupa tu lugar',76,50,dorian,'bond','reed',0,[0,5,3,4,0,2,3,4]],
 ['umbral','El Coro Vacío',92,48,minor,'forest','bell',2,[0,5,6,4,0,3,5,4]],
 ['mystery','La voz bajo el agua',74,50,minor,'bond','bell',0,[0,6,5,4,0,3,5,4]],
 ['battle','Resonancia · luchar juntos',144,50,minor,'battle','reed',3,[0,5,3,4,0,6,3,4]],
 ['finale','El último tañido',132,50,minor,'battle','reed',3,[0,6,5,4,3,5,2,4]],
 ['epilogue','La ciudad vuelve a nombrar',92,62,major,'bond','flute',1,[0,5,3,4,0,2,3,4]]
];
function render(s){
 const [id,title,bpm,key,scale,theme,lead,drums,progression]=s,beat=60/bpm,bars=32,N=Math.round(bars*4*beat*SR);
 const L=new Float32Array(N),R=new Float32Array(N),cache=new Map();let seed=123456789;
 const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const pitch=d=>key+12*Math.floor(d/7)+scale[((d%7)+7)%7];
 function voice(type,midi,duration){
  const k=type+':'+midi+':'+duration.toFixed(4);if(cache.has(k))return cache.get(k);
  const release=type==='bell'?1.8:type==='pad'?.7:.2,n=Math.ceil((duration+release)*SR),a=new Float32Array(n),f=440*2**((midi-69)/12);
  for(let i=0;i<n;i++){
   const t=i/SR,p=TAU*f*t,tail=Math.max(0,1-Math.max(0,t-duration)/release);let y=0,env;
   if(type==='pluck'){y=Math.sin(p)+.38*Math.sin(p*2)+.16*Math.sin(p*3)+.08*Math.sin(p*4);env=(1-Math.exp(-t*400))*Math.exp(-t*3.4)*tail;}
   else if(type==='bell'){y=Math.sin(p)*Math.exp(-t*1.6)+.45*Math.sin(p*2.76)*Math.exp(-t*3.2)+.2*Math.sin(p*5.4)*Math.exp(-t*5);env=(1-Math.exp(-t*250))*tail;}
   else if(type==='bass'){y=Math.sin(p)+.3*Math.sin(p*2)+.12*Math.sin(p*3);env=Math.min(1,t/.012)*Math.exp(-t*.7)*tail;}
   else if(type==='pad'){y=(Math.sin(p)+Math.sin(p*1.0018+.4)+.3*Math.sin(p*2)+.12*Math.sin(p*3))*.45;env=Math.min(1,t/.24)*tail;}
   else {const vibrato=.045*Math.sin(TAU*5.1*t)*Math.min(1,t/.35);y=Math.sin(p+vibrato)+(type==='reed'?.38:.1)*Math.sin(2*p+vibrato)+.14*Math.sin(3*p+vibrato);env=Math.min(1,t/.035)*(.93+.07*Math.sin(TAU*3*t))*tail;}
   a[i]=y*env;
  }cache.set(k,a);return a;
 }
 function mix(a,start,gain,pan){const at=Math.round(start*SR),gl=Math.cos((pan+1)*Math.PI/4)*gain,gr=Math.sin((pan+1)*Math.PI/4)*gain;for(let i=0;i<a.length;i++){const j=(at+i)%N;L[j]+=a[i]*gl;R[j]+=a[i]*gr;}}
 const note=(type,d,start,len,gain,pan=0)=>mix(voice(type,pitch(d),len*beat),start*beat,gain,pan);
 function hit(type,start,gain){const n=Math.round(SR*(type==='hat'?.09:.32)),a=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR,noise=rand()*2-1;a[i]=type==='kick'?Math.sin(TAU*(48*t+7*(1-Math.exp(-t*30))))*Math.exp(-t*17):type==='snare'?(noise*.7+Math.sin(TAU*175*t)*.3)*Math.exp(-t*23):noise*Math.exp(-t*65);}mix(a,start*beat,gain,type==='hat'?.4:-.1);}
 for(let bar=0;bar<bars;bar++){
  const section=Math.floor(bar/8),bridge=section===2,chord=progression[(bar+(bridge?2:0))%8],start=bar*4,energy=section===0?.82:section===3?1: .92;
  // Open chord voicings; the middle section shifts register and thins the rhythm.
  for(const [j,d]of [chord-7,chord+2,chord+4].entries())note('pad',d,start,3.8,.042*energy,(j-1)*.65);
  for(let b=0;b<4;b+=drums>=2?1:2)note('bass',chord-14+(b===2?4:0),start+b,drums>=2?.65:1.7,.16*energy,-.05);
  const arp=bridge?[0,4,2,6]:[0,2,4,2,6,4,2,4],step=bridge?1:.5;
  for(let j=0;j<4/step;j++)note('pluck',chord+arp[j%arp.length]+(id==='archivo'?7:0),start+j*step,.55,.065*energy,j%2?-.48:.48);
  let cursor=0;const phrase=themes[theme][bar%8];
  for(const [d,len]of phrase){
   if(d!==null){let degree=d+7+(bridge?2:0);if(id==='capilla'&&section===2)degree-=7;
    note(bridge&&lead!=='bell'?'pluck':lead,degree,start+cursor,len*.86,.17*energy,bridge?-.2:.14);
    if(section===3&&bar%2===0)note('flute',d,start+cursor+.12,len*.7,.055,-.45);
   }cursor+=len;
  }
  if((bar%4===3)&&drums<2)note('bell',chord+14,start+2,1.8,.035,.65);
  if(drums&&(!bridge||drums>=3)){
   for(let b=0;b<4;b++){if(b%2===0)hit('kick',start+b,drums>=2?.2:.085);else if(drums>=2)hit('snare',start+b,.105);hit('hat',start+b+.5,drums>=2?.032:.015);}
   if(drums>=3){hit('kick',start+2.75,.13);for(let j=0;j<8;j++)hit('hat',start+j*.5,.018);if(bar%8===7)for(let j=0;j<4;j++)hit('snare',start+3+j*.25,.06+j*.015);}
  }
 }
 // Circular stereo reflections retain the musical tail across the loop boundary.
 const dryL=L.slice(),dryR=R.slice();for(const [delay,gain]of [[.137,.12],[.251,.09],[.389,.06],[.521,.035]]){const n=Math.round(delay*SR);for(let i=0;i<N;i++){const j=(i+n)%N;L[j]+=dryR[i]*gain;R[j]+=dryL[i]*gain;}}
 let peak=0,sum=0;for(let i=0;i<N;i++){L[i]=Math.tanh(L[i]*1.1);R[i]=Math.tanh(R[i]*1.1);peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));sum+=L[i]**2+R[i]**2;}
 const rms=Math.sqrt(sum/(N*2)),gain=Math.min(.75/peak,.115/rms),wav=Buffer.alloc(44+N*4);
 wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(SR,24);wav.writeUInt32LE(SR*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(N*4,40);
 for(let i=0;i<N;i++){wav.writeInt16LE(Math.round(L[i]*gain*32767),44+i*4);wav.writeInt16LE(Math.round(R[i]*gain*32767),46+i*4);}
 const file=path.join(tmp,id+'.wav');fs.writeFileSync(file,wav);
 execFileSync('ffmpeg',['-v','error','-y','-i',file,'-ar','44100','-c:a','libmp3lame','-b:a','160k','-metadata','title='+title,'-metadata','artist=Cenizas del Umbral · composición original',path.join(out,id+'.mp3')]);
 fs.unlinkSync(file);const data={id,title,bpm,seconds:N/SR,theme,instruments:[lead,'pluck','pad','bass',...(drums?['percussion']:[])],peakDb:20*Math.log10(peak*gain),rmsDb:20*Math.log10(rms*gain)};console.log(JSON.stringify(data));return data;
}
const selected=process.argv.slice(2),results=scores.filter(s=>!selected.length||selected.includes(s[0])).map(render);
if(!selected.length)fs.writeFileSync(path.join(out,'sources.json'),JSON.stringify({edition:'Resonancias · 2026-11',composition:'Original melodies, arrangements and synthesized instruments; no third-party samples.',generator:'scripts/compose-soundtrack.cjs',tracks:results},null,2)+'\n');
