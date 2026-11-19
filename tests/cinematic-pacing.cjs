const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');

(async()=>{
 let release,impacts=0,sequenceCalls=0;
 const stage={classList:{add(){},remove(){}},querySelector(){return null}};
 const c={window:{CenizasBattleVisuals:{sequence:async(_stage,_from,_to,options)=>{sequenceCalls++;await new Promise(resolve=>release=resolve);return options.impact();}}},document:{getElementById:id=>id==='battle-stage'?stage:null}};
 const source=fs.readFileSync('dist/battle-scene.js','utf8');
 assert(source.includes('timingGate')&&source.includes('data-no-timing'),'la escena ofrece timing opcional y una salida accesible sin timing');
 vm.createContext(c);vm.runInContext(source,c);

 const first=c.window.CenizasBattleScene.show({attacker:'hero',target:'enemy',action:'attack',resolve:()=>{impacts++;return{summary:'OK'}}});
 const blocked=c.window.CenizasBattleScene.show({resolve:()=>{impacts++;return{summary:'NO'}}});
 assert.equal(await blocked,null,'a second cinematic is ignored while one is running');
 assert.equal(sequenceCalls,1);
 release();
 assert.deepEqual(await first,{summary:'OK'});
 assert.equal(impacts,1,'impact resolves once after the visual sequence');

 const third=c.window.CenizasBattleScene.show({resolve:()=>{impacts++;return{summary:'NEXT'}}});
 release();
 assert.deepEqual(await third,{summary:'NEXT'});
 assert.equal(impacts,2);
 console.log('PASS: side-view cinematic serializes attacks and resolves each impact once.');
})();
