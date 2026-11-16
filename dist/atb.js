/* Isolated training rules. No campaign state or storage access. */
(function(root){
'use strict';
const WIDTH=7, HEIGHT=5, COST=2;
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const initial=()=>({v:1,mode:'wait',time:0,result:null,warning:null,potions:2,log:[],units:[
 {id:'hero',name:'Viajero',team:'party',x:1,y:3,hp:30,max:30,mp:6,charge:0,speed:24,moves:2,guard:false},
 {id:'elara',name:'Elara',team:'party',x:1,y:2,hp:28,max:28,mp:6,charge:0,speed:22,moves:2,guard:false},
 {id:'echo',name:'Eco de práctica',team:'enemy',x:4,y:2,hp:48,max:48,mp:0,charge:0,speed:16,moves:0,guard:false}
]});
function valid(s){
 const base=initial();
 if(!s||s.v!==1||!['wait','active'].includes(s.mode)||![null,'victory','defeat'].includes(s.result)||!Number.isFinite(s.time)||s.time<0||!Number.isInteger(s.potions)||s.potions<0||s.potions>2||!Array.isArray(s.units)||s.units.length!==3||!Array.isArray(s.log)||s.log.length>20||s.log.some(x=>typeof x!=='string'||x.length>240))return false;
 if(!s.units.every((u,i)=>u&&['id','name','team','max','speed'].every(k=>u[k]===base.units[i][k])&&['hp','mp','charge','x','y','moves'].every(k=>Number.isFinite(u[k]))&&Number.isInteger(u.hp)&&u.hp>=0&&u.hp<=u.max&&Number.isInteger(u.mp)&&u.mp>=0&&u.mp<=base.units[i].mp&&u.charge>=0&&u.charge<=100&&Number.isInteger(u.x)&&u.x>=0&&u.x<WIDTH&&Number.isInteger(u.y)&&u.y>=0&&u.y<HEIGHT&&Number.isInteger(u.moves)&&u.moves>=0&&u.moves<=2&&typeof u.guard==='boolean'))return false;
 const live=s.units.filter(u=>u.hp>0);if(new Set(live.map(u=>u.x+','+u.y)).size!==live.length)return false;
 const w=s.warning;if(w!==null&&(!w||!Number.isInteger(w.row)||w.row<0||w.row>=HEIGHT||!Number.isFinite(w.remaining)||w.remaining<=0||w.remaining>2600))return false;
 const defeated=s.units.slice(0,2).every(u=>u.hp===0),victory=s.units[2].hp===0;
 return !(victory&&defeated)&&s.result===(victory?'victory':defeated?'defeat':null)&&(!s.result||w===null);
}
class Battle{
 constructor(saved){if(saved!==undefined&&!valid(saved))throw new Error('Guardado ATB no válido');this.s=saved?JSON.parse(JSON.stringify(saved)):initial();}
 unit(id){return this.s.units.find(u=>u.id===id)}
 ready(id){const u=this.unit(id);return !!u&&u.team==='party'&&u.hp>0&&u.charge>=100&&!this.s.result;}
 note(message){this.s.log.push(message);this.s.log=this.s.log.slice(-20);}
 check(){if(this.unit('echo').hp<=0)this.s.result='victory';else if(this.s.units.filter(u=>u.team==='party').every(u=>u.hp<=0))this.s.result='defeat';if(this.s.result)this.s.warning=null;}
 tick(ms,{paused=false,menu=false}={}){
  if(paused||(menu&&this.s.mode==='wait')||this.s.result||!Number.isFinite(ms)||ms<=0)return;
  // Small steps preserve warning timing even if callers provide a long interval.
  for(let left=Math.min(ms,10000);left>0&&!this.s.result;){const dt=Math.min(left,50);left-=dt;this.s.time+=dt;
   for(const u of this.s.units)if(u.hp>0&&!(u.team==='enemy'&&this.s.warning))u.charge=Math.min(100,u.charge+u.speed*dt/1000);
   if(this.s.warning){this.s.warning.remaining-=dt;if(this.s.warning.remaining<=0){const row=this.s.warning.row;for(const u of this.s.units.filter(u=>u.team==='party'&&u.hp>0&&u.y===row)){const damage=u.guard?2:5;u.hp=Math.max(0,u.hp-damage);this.note(u.name+' recibe '+damage+' PG.');}this.s.warning=null;this.unit('echo').charge=0;this.check();}}
   else if(this.unit('echo').charge>=100){const target=this.s.units.filter(u=>u.team==='party'&&u.hp>0).sort((a,b)=>a.hp-b.hp)[0];this.s.warning={row:target.y,remaining:2600};this.note('El Eco anuncia un pulso en la fila '+(target.y+1)+'.');}
  }
 }
 reachable(id){
  if(!this.ready(id))return [];const u=this.unit(id),queue=[{x:u.x,y:u.y,cost:0}],seen=new Set([u.x+','+u.y]);
  for(let i=0;i<queue.length;i++){const p=queue[i];if(p.cost>=u.moves)continue;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,key=x+','+y;if(x<0||x>=WIDTH||y<0||y>=HEIGHT||seen.has(key)||this.s.units.some(v=>v.hp>0&&v.x===x&&v.y===y))continue;seen.add(key);queue.push({x,y,cost:p.cost+1});}}
  return queue.slice(1);
 }
 move(id,x,y){const p=this.reachable(id).find(p=>p.x===x&&p.y===y);if(!p)return false;Object.assign(this.unit(id),{x,y,moves:this.unit(id).moves-p.cost});return true;}
 reason(id,action){
  if(!this.ready(id))return 'Espera a que se llene la barra ATB.';
  const u=this.unit(id),e=this.unit('echo');
  if(action==='attack')return distance(u,e)>1?'Acércate a una casilla del Eco.':'';
  if(action==='tech')return u.mp<COST?'Necesitas 2 PM.':distance(u,e)>3?'El Eco está fuera del alcance de 3 casillas.':'';
  if(action==='combo'){const pair=this.s.units.filter(v=>v.team==='party');if(pair.some(v=>!this.ready(v.id)))return 'Ambos deben estar en pie y tener ATB completo.';if(pair.some(v=>v.mp<COST))return 'Cada participante necesita 2 PM.';if(pair.some(v=>distance(v,e)>2))return 'Ambos deben estar a 2 casillas o menos del Eco.';return '';}
  if(action==='potion')return this.s.potions<1?'No quedan pociones.':u.hp===u.max?'Ya tienes todos tus PG.':'';
  return action==='guard'?'':'Acción desconocida.';
 }
 act(id,action){
  if(this.reason(id,action))return false;
  const u=this.unit(id),e=this.unit('echo'),actors=action==='combo'?this.s.units.filter(v=>v.team==='party'):[u];
  // Validate everybody first, then spend both turns in this synchronous transaction.
  for(const a of actors){a.charge=0;a.moves=2;a.guard=false;if(action==='tech'||action==='combo')a.mp-=COST;}
  if(action==='guard'){u.guard=true;this.note(u.name+' se protege hasta su próxima acción.');}
  else if(action==='potion'){u.hp=Math.min(u.max,u.hp+10);this.s.potions--;this.note(u.name+' recupera hasta 10 PG.');}
  else {const damage=action==='combo'?18:action==='tech'?8:6;e.hp=Math.max(0,e.hp-damage);this.note((action==='combo'?'Resonancia del Umbral':u.name+(action==='tech'?' · Técnica':' · Ataque'))+': '+damage+' PG.');}
  this.check();return true;
 }
}
const api={Battle,valid,WIDTH,HEIGHT,distance};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasATB=api;
})(typeof window!=='undefined'?window:globalThis);
