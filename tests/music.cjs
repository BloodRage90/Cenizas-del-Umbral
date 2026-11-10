const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
(async()=>{
 const nodes=new Map(),events={},audios=[],intervals=new Map(),storage=new Map([['cenizas-music-volume','broken']]);let now=0,timer=0;
 const element=()=>({setAttribute(){},prepend(){},append(){},showModal(){this.open=true},close(){this.open=false}});
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 class Audio{constructor(){this.volume=0;this.paused=true;this.events={};audios.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}addEventListener(k,f){this.events[k]=f;}}
 const document={hidden:false,createElement:element,querySelector:element,getElementById:get,body:element(),addEventListener(k,f){events[k]=f;}};
 const ctx={Audio,document,window:{addEventListener(k,f){events[k]=f;}},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},performance:{now:()=>now},setInterval:f=>{intervals.set(++timer,f);return timer;},clearInterval:id=>intervals.delete(id)};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/music.js','utf8'),ctx);
 assert(audios.every(a=>a.paused),'no autoplay before consent');assert.equal(get('music-volume').value,30,'invalid saved volume falls back');
 get('music-enabled').onchange({target:{checked:true}});await Promise.resolve();now=1000;for(const f of [...intervals.values()])f();
 let current=audios.find(a=>!a.paused);assert(current.src.includes('exploration.mp3'));assert.equal(current.volume,.3);
 ctx.window.CenizasMusic.set('umbral',true);await Promise.resolve();now+=1000;for(const f of [...intervals.values()])f();
 current=audios.find(a=>!a.paused);assert(current.src.includes('finale.mp3'));assert.equal(audios.filter(a=>!a.paused).length,1);
 for(const [place,kind,id] of [['training',true,'training-battle'],['bosque','whisper','forest-battle'],['enfermeria','whisper','vigilia-battle'],['criptas','custodian','custodian'],['capilla','ash','ash'],['taller','echo','battle'],['umbral','coro','finale']]){ctx.window.CenizasMusic.set(place,kind);await Promise.resolve();now+=1000;for(const f of [...intervals.values()])f();assert(audios.find(a=>!a.paused).src.includes('/'+id+'.mp3'),id+' routed');}
 document.hidden=true;events.visibilitychange();assert(audios.every(a=>a.paused));assert.equal(intervals.size,0);
 document.hidden=false;events.visibilitychange();await Promise.resolve();assert(audios.some(a=>!a.paused));
 ctx.window.CenizasMusic.set('plaza',false);get('music-enabled').onchange({target:{checked:false}});await Promise.resolve();assert.equal(intervals.size,0,'stale play promise cannot start a fade');assert(audios.every(a=>a.paused));
 assert.equal(storage.get('cenizas-music-enabled'),'false');assert([...storage.keys()].every(k=>k.startsWith('cenizas-music-')));
 const manifest=JSON.parse(fs.readFileSync('dist/music/sources.json'));assert.equal(manifest.tracks.length,25);
 for(const t of manifest.tracks){assert(t.seconds>50&&t.seconds<110);assert(t.peakDb<-2);const file='dist/music/'+t.id+'.mp3';const meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=channels,sample_rate','-of','json',file]));assert.equal(meta.streams[0].channels,2);assert(Math.abs(Number(meta.format.duration)-t.seconds)<.15);execFileSync('ffmpeg',['-v','error','-i',file,'-f','null','-']);}
 console.log('PASS: 25 stereo tracks decoded, durations/headroom, consent, crossfade, intro cue, visibility, stale promises and music-only preferences');
})();
