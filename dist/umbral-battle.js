/* J03: two conductors, two register actions, then the anchor. Save-compatible. */
(function(root){
'use strict';
const R=typeof module!=='undefined'&&module.exports?require('./combat.js'):root.CenizasRules;
class UmbralBattle extends R.Battle{
 constructor(profile,save={},rng){
  super('ash',profile,save,rng);if(save.combat)return;
  const party=this.s.units.filter(u=>u.team==='party');this.events=[];this.rolls=[];
  const object=(id,name,x,y,hp,ac=12)=>({id,name,x,y,hp,max:hp,ac,flat:ac,team:'object',construct:true,move:0,init:0,ref:0});
  const armor=(id,x)=>({...object(id,'Armadura '+(x===2?'izquierda':'derecha'),x,1,14,15),max:31,attack:3,damage:6,bonus:1,threat:20,move:4});
  Object.assign(this.s,{kind:'coro',units:[...party,{...object('enemy','Piedra ancla',3,0,24,14),team:'enemy'},object('left','Conductor izquierdo',0,1,8),object('right','Conductor derecho',6,1,8),armor('armorL',2),armor('armorR',4)],history:[],warning:null,opening:true,envTurns:0,names:0,fracture:0,serethRescued:false,pulseQueue:[],targetId:'left',exposed:false,index:0,round:1,acted:[]});
  this.s.order=party.map(u=>{const d=this.die();this.log(`${u.name}: iniciativa ${d}+${u.init}`);return {id:u.id,n:d+u.init};}).sort((a,b)=>b.n-a.n).map(u=>u.id);this.s.order.push('enemy');this.begin();
 }
 unit(id){return this.s.units.find(u=>u.id===id)}
 get enemy(){return this.unit(this.s.targetId||'enemy')}
 get powered(){return this.unit('left').hp>0||this.unit('right').hp>0}
 select(id){const u=this.unit(id);if(u&&u.team!=='party'&&u.hp>0){this.s.targetId=id;return true;}return false;}
 check(){
  for(const [c,a]of [['left','armorL'],['right','armorR']])if(this.unit(c).hp<=0){this.unit(a).hp=0;delete this.unit(a).warning;}
  if(!this.powered&&this.s.warning?.regular)this.s.warning=null;
  if(this.enemy.hp<=0)this.s.targetId=(this.s.units.find(u=>u.team!=='party'&&u.hp>0&&u.id!=='enemy')||this.unit('enemy')).id;
  if(this.hero.hp<=0){this.s.result='defeat';this.log('Has caído. Puedes volver al inicio del encuentro.');}
  else if(this.unit('enemy').hp<=0&&this.s.names>=2){this.s.result='victory';this.s.warning=null;this.s.pulseQueue=[];for(const a of ['armorL','armorR'])delete this.unit(a).warning;this.log('El ancla se rompe. El Coro queda en silencio.');}
 }
 act(kind,options={}){
  if(this.s.result||this.actor.team!=='party'||!this.s.action)return false;
  const a=this.actor;
  if(['attack','power','missile'].includes(kind)){
   if(this.enemy.hp<=0)return this.fail('Selecciona otro objetivo.');
   if(this.enemy.id==='enemy'&&this.s.names<2)return this.fail('La piedra está protegida. Libera primero los nombres.');
   return super.act(kind,options);
  }
  if(kind==='mechanism'){
   const c=['left','right'].map(id=>this.unit(id)).find(u=>u.hp>0);
   if(!c)return this.fail('Los dos conductores ya están apagados.');c.hp=0;this.log(c.name+' apagado; su armadura pierde energía.');
  }else if(kind==='names'){
   if(this.powered)return this.fail('Apaga los dos conductores antes de abrir el registro.');
   if(this.s.names>=2)return this.fail('Los nombres ya fueron liberados.');
   this.s.names++;this.log(`Nombres liberados: ${this.s.names}/2.`);
   if(this.s.names===2){this.s.exposed=true;this.s.pulseQueue.push('final');this.log('El ancla queda expuesta. La descarga final se anunciará antes de golpear.');}
  }else if(kind==='rescue'){
   if(this.powered||this.s.serethRescued)return this.fail('Apaga los conductores antes de rescatar a Sereth.');
   this.s.serethRescued=true;this.s.pulseQueue.unshift('emergency');this.log('Liberas a Sereth. La descarga de emergencia se anunciará un turno antes.');
  }else if(kind==='fracture'){
   if(this.s.names<2)return this.fail('Libera los nombres antes de fracturar el ancla.');
   this.s.fracture++;this.log(`Abrazadera del ancla: ${this.s.fracture}/2 acciones.`);if(this.s.fracture>=2)this.unit('enemy').hp=0;
  }else return super.act(kind,options);
  this.s.action=false;this.check();return true;
 }
 enemyTurn(){
  if(this.s.result||this.actor.team!=='enemy')return;this.s.envTurns++;let party=this.s.units.filter(u=>u.team==='party'&&u.hp>0);
  if(this.s.warning&&!this.s.opening&&party[0]){const d=this.die(),raw=this.die(4)+this.die(4),t=party[0],ok=d===20||(d!==1&&d+t.ref>=14),damage=ok?(t.class==='Pícaro'?0:Math.floor(raw/2)):raw;t.hp=Math.max(0,t.hp-damage);this.log(`${t.name}: Reflejos ${d}+${t.ref} CD 14; descarga ${damage} PG.`);}
  this.s.warning=null;this.s.opening=false;
  for(const id of ['armorL','armorR']){const arm=this.unit(id);if(arm.hp<=0||(id==='armorR'&&this.s.envTurns<2)||!party.length)continue;if(arm.warning){const t=party[0];this.hit(arm,t);delete arm.warning;}else{arm.warning={armed:true};this.log(arm.name+' prepara un golpe anunciado.');}}
  const pulse=this.s.pulseQueue.shift();if(pulse||this.powered){this.s.warning={type:'pulse',regular:!pulse};this.log(`Descarga ${pulse==='emergency'?'de emergencia':pulse==='final'?'final':''} anunciada para el próximo turno.`);}
  this.reaction=null;this.check();if(!this.s.result)this.end();
 }
 autoPlan(){
  const a=this.actor;if(a.id!=='elara'||this.s.result)return {action:'guard'};
  if(a.hp<=5&&this.s.potions)return {action:'potion'};
  const active=['left','right'].map(id=>this.unit(id)).filter(u=>u.hp>0).sort((u,v)=>R.distance(a,u)-R.distance(a,v));
  const target=active[0]||(this.s.names<2?{x:3,y:2}:this.unit('enemy')),action=active.length?'mechanism':this.s.names<2?'names':'fracture';
  if(R.distance(a,target)<=1)return {action};
  if(this.s.movement>0){const queue=[{x:a.x,y:a.y,path:[]}],seen=new Set([a.x+','+a.y]);while(queue.length){const p=queue.shift();if(R.distance(p,target)<=1&&p.path.length)return {move:p.path[0]};for(const d of [[1,0],[-1,0],[0,1],[0,-1]]){const q={x:p.x+d[0],y:p.y+d[1]},key=q.x+','+q.y;if(q.x<0||q.x>6||q.y<0||q.y>4||seen.has(key)||this.occupied(q.x,q.y))continue;seen.add(key);queue.push({...q,path:[...p.path,d]});}}}
  return {action:'guard'};
 }
}
if(typeof module!=='undefined'&&module.exports)module.exports=UmbralBattle;else root.CenizasUmbralBattle=UmbralBattle;
})(typeof window!=='undefined'?window:globalThis);
