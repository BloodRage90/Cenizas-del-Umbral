const assert=require('node:assert/strict');
const R=require('../dist/combat.js');
const cls={Guerrero:[16,14,14,12,10,8],'Pícaro':[12,16,14,14,10,8],Mago:[8,14,14,16,12,10]};
const rng=n=>Math.min(n,10);
function partyTurn(b){for(let n=0;n<8&&b.actor.team!=='party'&&!b.s.result;n++)b.enemyTurn();}
function navigate(b,target){let guard=0;while(R.distance(b.actor,target)>1&&guard++<30){if(b.s.movement<1){b.end();partyTurn(b);}const a=b.actor,choices=[[1,0],[-1,0],[0,1],[0,-1]].filter(([x,y])=>!b.occupied(a.x+x,a.y+y)&&a.x+x>=0&&a.x+x<7&&a.y+y>=0&&a.y+y<5).sort((p,q)=>R.distance({x:a.x+p[0],y:a.y+p[1]},target)-R.distance({x:a.x+q[0],y:a.y+q[1]},target));assert(choices.length);assert(b.move(...choices[0]));}}
for(const [name,base]of Object.entries(cls)){
 const p=R.profile({...R.defaults,class:name,base,feats:[]});
 const b=new R.Battle('echo',p,{},rng);partyTurn(b);navigate(b,{x:5,y:1});assert(b.act('mechanism'));assert.equal(b.s.result,null,name+' leaves the exposed echo for a finishing hit');b.s.noBoard=true;b.rng=n=>n;for(let i=0;i<12&&!b.s.result;i++){b.s.action=true;b.act('attack');}assert.equal(b.s.result,'victory',name+' can finish the exposed echo');
 const boss=new R.Battle('custodian',p,{},rng);partyTurn(boss);navigate(boss,{x:0,y:1});assert(boss.act('mechanism'));boss.end();partyTurn(boss);navigate(boss,{x:6,y:1});assert(boss.act('mechanism'));assert.equal(boss.s.result,null,name+' exposes the custodian without an instant win');boss.s.noBoard=true;boss.rng=n=>n;for(let i=0;i<20&&!boss.s.result;i++){boss.s.action=true;boss.act('attack');}assert.equal(boss.s.result,'victory',name+' can finish exposed custodian');
}
const b=new R.Battle('whisper',R.profile(R.defaults,2),{flags:{elara:true}},rng);partyTurn(b);const move=b.s.movement;assert(b.move(0,1));assert.equal(b.s.movement,move-1);assert(b.act('guard'));assert(!b.act('potion'),'second standard action rejected');
const snapshot=JSON.parse(JSON.stringify(b.s));const resumed=new R.Battle('whisper',R.profile(R.defaults,2),{combat:snapshot},rng);assert.deepEqual(resumed.s,snapshot,'reload preserves spent action, location, rolls and turn');
for(let i=0;i<10&&b.actor.id!=='elara';i++){if(b.actor.team==='enemy')b.enemyTurn();else b.end();}assert.equal(b.actor.id,'elara');b.act('guard');const enemyHP=b.enemy.hp;b.auto('attack');assert.equal(b.enemy.hp,enemyHP,'automatic handoff does not grant second attack');
const c=new R.Battle('custodian',R.profile(R.defaults),{},rng);partyTurn(c);assert(!c.act('mechanism'));assert(c.s.action,'out of range action does not consume standard action');c.hero.x=c.enemy.x;c.hero.y=c.enemy.y+1;c.rng=()=>1;const hp=c.enemy.hp;c.act('attack');assert.equal(c.enemy.hp,hp,'natural 1 always misses');
assert.equal(R.profile(R.defaults,2).max,23);assert.equal(R.profile({...R.defaults,class:'Pícaro',base:cls['Pícaro'],feats:[]},2).max,14);assert.equal(R.profile({...R.defaults,class:'Mago',base:cls.Mago,feats:[]},2).max,17);
 const d=new R.Battle('echo',R.profile(R.defaults),{},rng);partyTurn(d);d.hero.x=d.enemy.x-1;d.hero.y=d.enemy.y;d.rng=n=>n;for(let i=0;i<12&&!d.s.result;i++){d.s.action=true;d.act('attack');}assert(d.s.history.some(t=>t.includes('crítico')));assert.equal(d.s.result,'victory');
console.log('PASS: three classes, both mechanism victories, actions, Elara handoff, restore, attack dice, level 2.');
