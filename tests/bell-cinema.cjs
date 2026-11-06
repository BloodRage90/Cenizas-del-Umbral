const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{beats,frame}=require('../dist/bell-cinema.js');
assert.equal(beats.length,5);assert(beats.every(b=>b.duration>=2400));
assert(frame(0,0).cx>frame(0,beats[0].duration).cx,'cart visibly travels downhill');
assert.equal(frame(1,0).cart,0);assert.equal(frame(1,beats[1].duration).cart,1);assert(frame(1,beats[1].duration).bell);
assert.equal(frame(2,0).broken,false);const landed=frame(2,beats[2].duration);assert(landed.broken);assert.equal(landed.bx,805);assert.equal(landed.by,525);
assert.equal(frame(3,beats[3].duration).cartAlpha,0);assert(frame(3,beats[3].duration/2).glow>0);assert(frame(4,0).present);
const source=fs.readFileSync('dist/chapter.js','utf8'),code=source.slice(source.indexOf('async function bellMemory(){'),source.indexOf('function chooseReason('));
(async()=>{
 let seen=true,shows=0,saves=0,notes=0,dialog,release;
 const context={state:{flags:{mountainEcho:true}},battle:null,encounterBusy:false,stop:()=>{},note:()=>notes++,save:()=>saves++,say:(...a)=>dialog=a,window:{CenizasBellCinema:{show:async()=>{shows++;return seen;}}},revealEncounter:()=>{throw Error('must not restart won encounter')},chooseReason:()=>{}};
 vm.createContext(context);vm.runInContext(code,context);
 await context.mountainVoice();assert.equal(shows,1);assert(context.state.flags.bellCinemaSeen);assert.equal(notes,1);assert.equal(context.encounterBusy,false);assert(dialog[2].some(o=>o[0].includes('Recordar')));
 await context.mountainVoice();assert.equal(shows,1,'automatic first viewing only once');await dialog[2][0][1]();assert.equal(shows,2,'explicit replay still available');assert.equal(notes,1,'replay does not duplicate progress');
 delete context.state.flags.bellCinemaSeen;seen=false;await context.bellMemory();assert(!context.state.flags.bellCinemaSeen,'cancel does not consume first viewing');assert.equal(context.encounterBusy,false);
 context.window.CenizasBellCinema.show=()=>new Promise(r=>release=r);const running=context.bellMemory();assert(context.encounterBusy);assert.equal(await context.bellMemory(),false,'prevent duplicate cinematics');release(true);await running;assert(!context.encounterBusy);assert(saves>=4);
 context.battle={};assert.equal(await context.bellMemory(),false,'cannot overlay battle');
 const html=fs.readFileSync('dist/chapter.html','utf8');assert(html.indexOf('bell-cinema.js')<html.indexOf('chapter.js'));
 console.log('PASS: animated cart, break/landing/echo sequence; v34 completed-encounter save, replay, cancel, lock cleanup and battle protection.');
})().catch(e=>{console.error(e);process.exitCode=1});
// Shot boundaries keep the camera continuous; no teleport when pressing Continue.
for(let i=0;i<4;i++){const end=frame(i,beats[i].duration),start=frame(i+1,0);for(const k of ['camX','camY','zoom'])assert(Math.abs(end[k]-start[k])<.001,`continuous ${k} at shot ${i}`);}
const {soundEvents}=require('../dist/bell-cinema.js');assert.deepEqual(soundEvents(2,0,6200),['bounce','bounce','impact']);assert.deepEqual(soundEvents(2,5084,6200),[],'impact cannot play twice');
const air=frame(2,beats[2].duration*.18);assert(air.groundY-air.by>40,'bell rises clear of its contact shadow');assert(frame(1,beats[1].duration).detached,'wheel separates after axle breaks');assert(frame(0,beats[0].duration*.5).wheel>0,'wheel spin follows cart travel');
