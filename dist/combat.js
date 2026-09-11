/* Small deterministic turn engine. Rules specific to this campaign are explicit. */
(function(root){
'use strict';
const mod=n=>Math.floor((n-10)/2),sign=n=>n>=0?'+'+n:String(n);
const defaults={name:'Viajero',race:'Humano',class:'Guerrero',base:[16,14,14,12,10,8],feats:['Dureza','Iniciativa mejorada','Soltura con el arma'],ranks:{}};
function profile(c=defaults,level=1){
 const cls=['Guerrero','Pícaro','Mago'].includes(c.class)?c.class:'Guerrero';
 const base=Array.isArray(c.base)&&c.base.length===6&&c.base.every(n=>Number.isFinite(n)&&n>=8&&n<=18)?c.base:defaults.base;
 const m=base.map((v,i)=>mod(v+(c.race==='Elfo'?(i===1?2:i===2?-2:0):c.race==='Enano'?(i===2?2:i===5?-2:0):0)));
 const feats=Array.isArray(c.feats)?c.feats:[],has=f=>feats.includes(f),lvl=Math.max(1,Math.min(2,level));
 const hd={Guerrero:10,'Pícaro':6,Mago:4}[cls],bab=cls==='Guerrero'?lvl:cls==='Pícaro'?Math.floor(lvl*.75):Math.floor(lvl/2),armor={Guerrero:5,'Pícaro':2,Mago:0}[cls];
 const hp=Math.max(1,hd+m[2])+(has('Dureza')?3:0)+(cls==='Mago'?3:0)+(lvl>1?Math.max(1,hd/2+1+m[2]):0);
 return {id:'hero',name:String(c.name||'Viajero').slice(0,40),class:cls,level:lvl,max:hp,ac:10+armor+Math.min(m[1],cls==='Guerrero'?4:cls==='Pícaro'?6:99),flat:10+armor+Math.min(0,m[1]),attack:bab+m[0]+(has('Soltura con el arma')?1:0),damage:cls==='Guerrero'?8:6,bonus:m[0]<0?m[0]:Math.floor(m[0]*(cls==='Mago'?1.5:1)),threat:cls==='Mago'?20:19,init:m[1]+(has('Iniciativa mejorada')?4:0),ref:(cls==='Pícaro'?(lvl===2?3:2):0)+m[1]+(has('Reflejos rápidos')?2:0),move:c.race==='Enano'?4:6,spells:cls==='Mago'&&base[3]>=11?(lvl+(m[3]>=1?1:0)):0,power:has('Ataque poderoso')&&m[0]>=1,bab};
}
const enemies={sentinel:{name:'Centinela del claro',max:22,ac:14,flat:14,attack:3,damage:4,bonus:1,init:0,ref:0,move:0,threat:20,construct:true},echo:{name:'Eco incipiente',max:4,ac:12,flat:11,attack:1,damage:3,bonus:-1,init:1,ref:1,move:4,threat:20},custodian:{name:'Custodio de la compuerta',max:16,ac:13,flat:13,attack:2,damage:4,bonus:1,init:-1,ref:0,move:0,threat:20,construct:true},whisper:{name:'Eco del murmullo',max:12,ac:13,flat:11,attack:3,damage:4,bonus:0,init:2,ref:2,move:6,threat:20}};
const elara={id:'elara',name:'Elara',max:16,ac:16,flat:15,attack:4,damage:8,bonus:2,threat:19,init:1,ref:1,move:6};
function fresh(){return {v:2,place:'plaza',flags:{},branch:null,level:1,hp:null,spells:null,potions:2,gold:0,items:[],log:[],combat:null,elaraHP:16,elaraMode:'manual',tactic:'protect',position:null};}
function valid(s){return s&&s.v===2&&['plaza','taller','criptas','bosque','lindero','embarcadero'].includes(s.place)&&[1,2].includes(s.level)&&s.flags&&typeof s.flags==='object'&&Array.isArray(s.items)&&Array.isArray(s.log)&&Number.isFinite(s.potions)&&Number.isFinite(s.gold);}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),inside=(x,y)=>x>=0&&x<7&&y>=0&&y<5;
class Battle{
 constructor(kind,p,save={},rng){this.rng=rng||null;this.events=[];this.rolls=[];
 if(save.combat){this.s=JSON.parse(JSON.stringify(save.combat));return;}
 const h={...p,hp:save.hp??p.max,x:1,y:3,team:'party'},e={...enemies[kind],id:'enemy',kind,hp:enemies[kind].max,x:['custodian','sentinel'].includes(kind)?3:4,y:['custodian','sentinel'].includes(kind)?1:2,team:'enemy'};
 this.s={kind,units:[h,e],round:1,index:0,order:[],action:true,movement:h.move,acted:[],wheels:[],valve:false,exposed:false,spellArmor:false,spells:save.spells??p.spells,potions:save.potions??2,warning:null,history:[],result:null,opening:true};
 if(['whisper','sentinel'].includes(kind)&&save.flags?.elara)this.s.units.push({...elara,hp:save.elaraHP??16,x:1,y:2,team:'party'});
 this.s.order=this.s.units.map(u=>{const die=this.die();this.log(`${u.name} · iniciativa ${die} ${sign(u.init)} = ${die+u.init}`);return {id:u.id,n:die+u.init,dex:u.init}}).sort((a,b)=>b.n-a.n||b.dex-a.dex).map(x=>x.id);
 this.begin();
 }
 die(n=20){let value;if(this.rng)value=this.rng(n);else{const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);value=a[0]%n+1;}this.rolls.push({sides:n,value});return value;}
 log(s){this.s.history.push(s);this.s.history=this.s.history.slice(-60);this.events.push(s)}
 get actor(){return this.s.units.find(u=>u.id===this.s.order[this.s.index])}
 get hero(){return this.s.units.find(u=>u.id==='hero')}
 get enemy(){return this.s.units.find(u=>u.id==='enemy')}
 begin(){const a=this.actor;this.s.action=true;this.s.movement=a.move;this.s.guard=false;this.log(`Turno de ${a.name} · ronda ${this.s.round}`)}
 occupied(x,y){return this.s.units.some(u=>u.hp>0&&u.x===x&&u.y===y)}
 move(dx,dy){if(this.s.result||this.actor.team!=='party'||Math.abs(dx)+Math.abs(dy)!==1||this.s.movement<1)return false;const a=this.actor,x=a.x+dx,y=a.y+dy;if(!inside(x,y)||this.occupied(x,y))return false;a.x=x;a.y=y;this.s.movement--;return true;}
 hit(a,b,power=0){const ac=(!this.s.acted.includes(b.id)?b.flat:b.ac)+(b.guard?4:0),d=this.die(),bonus=a.attack-power+(a.team==='party'&&this.precision?2:0);this.log(`${a.name}: d20 ${d} ${sign(bonus)} = ${d+bonus} contra CA ${ac}`);if(d===1||(d!==20&&d+bonus<ac)){this.log('Fallo.');return 0;}
 let crit=false;if(d>=a.threat&&!b.construct){const q=this.die();crit=q!==1&&(q===20||q+bonus>=ac);this.log(`Confirmación: ${q} ${sign(bonus)} = ${q+bonus} · ${crit?'crítico':'impacto normal'}`)}
 let dmg=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1));if(crit)dmg+=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1));
 const ally=this.s.units.find(u=>u.team==='party'&&u.id!==a.id&&u.hp>0);const flank=ally&&distance(a,b)===1&&distance(ally,b)===1&&a.x+ally.x===2*b.x&&a.y+ally.y===2*b.y;
 if(a.class==='Pícaro'&&(!b.construct||this.s.exposed)&&(!this.s.acted.includes(b.id)||flank||this.s.exposed)){const sneak=this.die(6);dmg+=sneak;this.log(`Ataque furtivo +${sneak} (1d6).`)}
 dmg=this.mitigate(b,dmg);b.hp=Math.max(0,b.hp-dmg);this.log(`${b.name} recibe ${dmg} de daño${crit?' crítico':''}.`);return dmg;}
 mitigate(target,damage){if(target.team!=='party'||!this.reaction)return damage;const n=this.reaction==='parry'?0:Math.floor(damage/2);this.log(`${target.name}: ${this.reaction==='parry'?'parada':'esquiva'} reduce ${damage} a ${n} PG.`);return n;}
 act(kind,options={}){this.precision=!!options.precision;if(this.s.result||this.actor.team!=='party'||!this.s.action)return false;const a=this.actor,e=this.enemy;
 if(kind==='attack'||kind==='power'){if(distance(a,e)!==1)return this.fail('Acércate con las flechas: alcance 1 casilla.');if(kind==='power'&&!a.power)return false;this.hit(a,e,kind==='power'?a.bab:0);}
 else if(kind==='missile'){if(a.class!=='Mago'||this.s.spells<1)return false;const d=this.die(4)+1+(this.precision?1:0);e.hp=Math.max(0,e.hp-d);this.s.spells--;this.log(`Proyectil mágico: 1d4+1${this.precision?' +1 de precisión':''} = ${d}. Impacta sin tirada de ataque.`);}
 else if(kind==='armor'){if(a.class!=='Mago'||this.s.spells<1||this.s.spellArmor)return false;this.s.spells--;a.ac+=4;a.flat+=4;this.s.spellArmor=true;this.log('Armadura de mago: +4 CA durante este encuentro.');}
 else if(kind==='potion'){if(!this.s.potions||a.hp===a.max)return false;const d=this.die(8)+1,healed=Math.min(d,a.max-a.hp);a.hp+=healed;this.s.potions--;this.log(`${a.name} bebe una poción: 1d8+1 = ${d}; recupera ${healed} PG.`);}
 else if(kind==='guard'){a.guard=true;this.log(`${a.name} adopta defensa total: +4 CA hasta su siguiente turno.`);}
 else if(kind==='mechanism'){if(this.s.kind==='echo'){if(distance(a,{x:5,y:1})>1)return this.fail('Acércate a la válvula, marcada en verde.');this.s.valve=true;e.hp=0;this.log('La válvula queda cerrada. El eco se disipa.');}
 else if(this.s.kind==='whisper'){if(distance(a,{x:5,y:1})>1)return this.fail('Acércate al foco verde para envolver el fragmento con el paño.');e.hp=0;this.log('Aíslas el foco con el paño. El eco se deshace.');}
 else if(this.s.kind==='custodian'){const i=[{x:0,y:1},{x:6,y:1}].findIndex((p,j)=>distance(a,p)<=1&&!this.s.wheels.includes(j));if(i<0)return this.fail('Acércate a una rueda que todavía esté encendida.');this.s.wheels.push(i);this.log(`Rueda ${i+1} cerrada (${this.s.wheels.length}/2).`);if(this.s.wheels.length===2){e.hp=0;this.log('Ambas ruedas cerradas: el Custodio se apaga.');}}
 else return false;}
 else if(kind==='conduit'){if(this.s.kind!=='custodian'||this.s.exposed||distance(a,e)!==1)return false;const d=this.die();this.log(`Conducto: d20 ${d} ${sign(a.attack)} contra CA 10.`);if(d!==1&&(d===20||d+a.attack>=10)){const dmg=Math.max(1,this.die(a.damage)+a.bonus);this.s.conduitHP=(this.s.conduitHP??3)-dmg;this.log(`Conducto recibe ${dmg} de daño.`);if(this.s.conduitHP<=0){e.hp=Math.max(0,e.hp-4);this.s.exposed=true;this.s.cancelNext=true;this.log('Carga interrumpida. Núcleo expuesto; Custodio pierde 4 PG.');}}}
 else return false;
 this.s.action=false;this.check();return true;}
 fail(msg){this.log(msg);return false;}
 check(){if(this.hero.hp<=0){this.s.result='defeat';this.log('Has caído. Puedes volver al punto seguro.');}else if(this.enemy.hp<=0){this.s.result='victory';this.log('Encuentro resuelto.');}}
 end(){if(this.s.result)return;const a=this.actor;if(!this.s.acted.includes(a.id))this.s.acted.push(a.id);let tries=0;do{this.s.index=(this.s.index+1)%this.s.order.length;if(this.s.index===0)this.s.round++;tries++;}while(this.actor.hp<=0&&tries<4);this.actor.guard=false;this.begin();}
 enemyTurn(options={}){this.reaction=options.defense||null;if(this.s.result||this.actor.team!=='enemy')return;const e=this.enemy;const targets=this.s.units.filter(u=>u.team==='party'&&u.hp>0).sort((a,b)=>distance(e,a)-distance(e,b));
 if(['custodian','sentinel'].includes(this.s.kind)){
  if(this.s.cancelNext){this.log('El conducto roto cancela el golpe anunciado.');this.s.cancelNext=false;}
  else if(this.s.warning){const w=this.s.warning;for(const t of targets){if(w.type==='strike'&&t.x===w.x&&t.y===w.y)this.hit(e,t);if(w.type==='pulse'&&t.y===w.y){const d=this.die(),dmg=this.die(4),ok=d===20||(d!==1&&d+t.ref>=12);let actual=ok?(t.class==='Pícaro'&&t.level>=2?0:Math.floor(dmg/2)):dmg;actual=this.mitigate(t,actual);t.hp=Math.max(0,t.hp-actual);this.log(`${t.name}: Reflejos ${d} ${sign(t.ref)} contra CD 12; descarga ${actual} PG.`);}}}
  else this.log(this.s.kind==='sentinel'?'El Centinela despierta. Observa la casilla marcada y prepárate para moverte.':'El Custodio arranca. Ordan señala las dos ruedas.');
  const t=targets[0];this.s.warning=this.s.warning?.type==='strike'?{type:'pulse',y:t.y}:{type:'strike',x:t.x,y:t.y};this.log(this.s.warning.type==='pulse'?`Próximo turno: descarga sobre la fila ${this.s.warning.y+1}. Sal de la zona roja.`:'Próximo turno: puño en la casilla roja. Muévete antes del golpe.');
 }else if(this.s.opening){this.s.opening=false;this.log(this.s.kind==='echo'?'El eco reúne ceniza. Tienes tiempo para llegar a la válvula.':'El eco imita el silbato. Elara reconoce la falsificación.');}
 else{const t=targets[0];for(let n=0;n<e.move&&distance(e,t)>1;n++){const steps=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:e.x+dx,y:e.y+dy})).filter(p=>inside(p.x,p.y)&&!this.occupied(p.x,p.y)).sort((a,b)=>distance(a,t)-distance(b,t));if(!steps.length||distance(steps[0],t)>=distance(e,t))break;Object.assign(e,steps[0]);}if(distance(e,t)===1)this.hit(e,t);else this.log('El eco se acerca.');}
 this.reaction=null;this.check();if(!this.s.result)this.end();}
 autoPlan(tactic){const a=this.actor,e=this.enemy;if(a.id!=='elara'||this.s.result)return {action:'guard'};
 if(a.hp<=5&&this.s.potions)return {action:'potion'};
 const score=p=>tactic==='distance'?-distance(p,e):tactic==='protect'?distance(p,e)+Math.max(0,distance(p,this.hero)-2):distance(p,e);
 if(this.s.movement>0){const options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({dx,dy,x:a.x+dx,y:a.y+dy})).filter(p=>inside(p.x,p.y)&&!this.occupied(p.x,p.y)).sort((p,q)=>score(p)-score(q));if(options.length&&score(options[0])<score(a))return {move:[options[0].dx,options[0].dy]};}
 return {action:distance(a,e)===1&&tactic!=='distance'?'attack':'guard'};
 }
 auto(tactic){if(this.actor.id!=='elara'||this.s.result)return;const a=this.actor,e=this.enemy;
 if(a.hp<=5&&this.s.potions){this.act('potion');this.end();return;}
 const hero=this.hero;
 while(this.s.movement>0){let options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({dx,dy,x:a.x+dx,y:a.y+dy})).filter(p=>inside(p.x,p.y)&&!this.occupied(p.x,p.y));
 const score=p=>tactic==='distance'?-distance(p,e):tactic==='protect'?distance(p,e)+Math.max(0,distance(p,hero)-2):distance(p,e);
 options.sort((p,q)=>score(p)-score(q));if(!options.length||score(options[0])>=score(a))break;this.move(options[0].dx,options[0].dy);}
 if(distance(a,e)===1&&tactic!=='distance')this.act('attack');else this.act('guard');if(!this.s.result)this.end();}
}
const api={profile,fresh,valid,Battle,defaults,distance,elara:Object.freeze({...elara})};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasRules=api;
})(typeof window!=='undefined'?window:globalThis);
