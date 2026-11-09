const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('dist/chapter.js','utf8');
(async()=>{
 let choices,stages=[],saves=0;
 const state={flags:{umbralClosed:true,elara:true},gold:20,place:'umbral'};
 const ctx={state,encounterBusy:false,battle:null,scene:{enter(){}},say:(_who,_text,options)=>choices=options,runStage:async steps=>stages.push(steps),save:()=>saves++,item(){},note(){},journal(){}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function journeyEnding(){'),source.indexOf('function mirador(){')),ctx);
 ctx.journeyEnding();await choices[0][1]();
 assert.equal(state.place,'plaza');assert.equal(state.gold,120);assert(state.flags.homecomingSeen);assert.equal(stages.length,2);
 assert(stages[0].some(s=>s.moves?.some(m=>m[0]==='hero')),'descent moves the protagonist');
 assert(stages[1].some(s=>s.moves?.some(m=>m[0]==='maela')),'Maela joins the reunion');
 await ctx.epilogue();ctx.journeyEnding();assert.equal(stages.length,2,'saved reunion is not replayed automatically');assert.equal(state.gold,120,'reward is not repeated');assert(saves>0);
 ctx.encounterBusy=true;state.flags.homecomingSeen=false;await ctx.epilogue();assert.equal(stages.length,2,'cannot overlap a running scene');
 console.log('PASS: staged descent/reunion, persisted completion, one-time reward and re-entry lock');
})();
