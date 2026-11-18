/* Small deterministic turn engine. Rules specific to this campaign are explicit. */
(function(root){
'use strict';
const mod=n=>Math.floor((n-10)/2),sign=n=>n>=0?'+'+n:String(n);
const Data=typeof module!=='undefined'&&module.exports?require('./character-data.js'):root.CenizasCharacterData;
const {raceData,classes,subclassRules}=Data;
const raceMods=Object.fromEntries(Object.entries(raceData).map(([name,value])=>[name,value.mods])),raceSpeed=Object.fromEntries(Object.entries(raceData).map(([name,value])=>[name,value.speed]));
const defaults={name:'Viajero',race:'Humano',class:'Guerrero',base:[16,14,14,12,10,8],feats:['Dureza','Iniciativa mejorada','Soltura con el arma'],ranks:{}};
function profile(c=defaults,level=1){
 const cls=classes[c.class]?c.class:'Guerrero',race=raceData[c.race]?c.race:'Humano',rule=subclassRules[c.subclass]?.class===cls?subclassRules[c.subclass]:null;
 const base=Array.isArray(c.base)&&c.base.length===6&&c.base.every(n=>Number.isFinite(n)&&n>=8&&n<=18)?c.base.map((n,i)=>n+(Number(c.levelBonuses?.[i])||0)):defaults.base;
 const m=base.map((v,i)=>mod(v+(raceMods[race]?.[i]||0)));
 const feats=Array.isArray(c.feats)?c.feats:[],has=f=>feats.includes(f),lvl=Math.max(1,Math.min(5,level));
 const hd=classes[cls].hp,bab=cls==='Guerrero'?lvl:cls==='Pícaro'?Math.floor(lvl*.75):Math.floor(lvl/2),armor=classes[cls].armor+(classes[cls].shield||0);
 const hp=Math.max(1,hd+m[2])+(has('Dureza')?3:0)+(cls==='Mago'?3:0)+(lvl-1)*Math.max(1,hd/2+1+m[2]);
 const small=raceData[race].size==='S',baseDamage=classes[cls].damageDie|| (cls==='Guerrero'?8:6),damage=Math.max(4,baseDamage-(small?(raceData[race].damageDiePenalty||1):0));
 const attack=bab+m[0]+(has('Soltura con el arma')?1:0)+(raceData[race].attackBonus||0);
 const ac=10+armor+Math.min(m[1],classes[cls].maxDex)+(raceData[race].acBonus||0)+(rule?.ac||0);
 const spells=cls==='Mago'&&base[3]>=11?lvl+(m[3]>=1?1:0)+(rule?.spellSlots||0):0;
 return {id:'hero',name:String(c.name||'Viajero').slice(0,40),class:cls,race,subclass:c.subclass||null,gender:c.gender||null,level:lvl,max:hp,ac,flat:10+armor+Math.min(0,m[1])+(rule?.ac||0),attack,damage,bonus:(cls==='Mago'?m[3]:m[0])+(rule?.damage||0),threat:cls==='Mago'?20:19,init:m[1]+(has('Iniciativa mejorada')?4:0)+(rule?.initiative||0),ref:(cls==='Pícaro'?(2+Math.floor(lvl/2)):Math.floor(lvl/3))+m[1]+(has('Reflejos rápidos')?2:0),strength:m[0],move:raceSpeed[race]??6,range:1,missileRange:4+(rule?.ranged||0),spells,power:has('Ataque poderoso')&&m[0]>=1,bab,subclassRule:rule?.label||null,sneakDie:rule?.sneakDie||0,spellDC:rule?.spellDC||0,action:rule?.action||null,small};
}
const enemies={ash:{name:"Guardián de ceniza",max:42,ac:16,flat:15,attack:8,damage:6,bonus:3,init:1,ref:2,move:4,threat:20,construct:true},sentinel:{name:'Centinela del claro',max:22,ac:14,flat:14,attack:3,damage:4,bonus:1,init:0,ref:0,move:0,threat:20,construct:true},echo:{name:'Eco incipiente',max:4,ac:12,flat:11,attack:1,damage:3,bonus:-1,init:1,ref:1,move:4,threat:20},custodian:{name:'Custodio de la compuerta',max:16,ac:13,flat:13,attack:2,damage:4,bonus:1,init:-1,ref:0,move:0,threat:20,construct:true},whisper:{name:'Eco del murmullo',max:12,ac:13,flat:11,attack:3,damage:4,bonus:0,init:2,ref:2,move:6,threat:20}};
const elara={id:'elara',name:'Elara',max:16,ac:16,flat:15,attack:4,damage:8,bonus:2,threat:19,init:1,ref:1,move:6,range:1};
const places=['plaza','taller','criptas','bosque','lindero','embarcadero','molino','monasterio','archivo','enfermeria','capilla','montana','antesala','umbral'];
Object.values(enemies).forEach(e=>{e.range=1;});
function fresh(){return {v:2,place:'plaza',flags:{},branch:null,level:1,hp:null,spells:null,potions:2,gold:12,items:[],log:[],combat:null,elaraHP:16,elaraMode:'manual',tactic:'protect',position:null};}
function valid(s){return s&&s.v===2&&places.includes(s.place)&&[1,2,3,4,5].includes(s.level)&&s.flags&&typeof s.flags==='object'&&Array.isArray(s.items)&&Array.isArray(s.log)&&Number.isFinite(s.potions)&&Number.isFinite(s.gold);}
function migrate(raw){
 const base=fresh(),fields=[];
 if(!raw||typeof raw!=='object')return {state:base,changed:true,invalidFields:['save']};
 const s={...base,...raw};s.v=2;
 if(!places.includes(raw.place)){s.place=base.place;fields.push('place');}
 if(!Number.isInteger(raw.level)||raw.level<1||raw.level>5){const n=Number(raw.level);s.level=Number.isFinite(n)?Math.max(1,Math.min(5,Math.floor(n))):base.level;fields.push('level');}
 s.flags=raw.flags&&typeof raw.flags==='object'&&!Array.isArray(raw.flags)?{...base.flags,...raw.flags}:{...base.flags};
 if(!Array.isArray(raw.items)){s.items=[];fields.push('items');}else s.items=raw.items.filter(x=>typeof x==='string').slice(0,200);
 if(!Array.isArray(raw.log)){s.log=[];fields.push('log');}else s.log=raw.log.filter(x=>typeof x==='string').slice(-100);
 if(!Number.isFinite(raw.potions)){s.potions=base.potions;fields.push('potions');}else s.potions=Math.max(0,Math.min(9,Math.floor(raw.potions)));
 if(!Number.isFinite(raw.gold)){s.gold=base.gold;fields.push('gold');}else s.gold=Math.max(0,Math.floor(raw.gold));
 if(raw.hp===null||raw.hp===undefined)s.hp=null;else if(!Number.isFinite(raw.hp)){s.hp=null;fields.push('hp');}else s.hp=Math.max(0,Math.floor(raw.hp));
 if(raw.spells===null||raw.spells===undefined)s.spells=null;else if(!Number.isFinite(raw.spells)){s.spells=null;fields.push('spells');}else s.spells=Math.max(0,Math.floor(raw.spells));
 s.elaraHP=Number.isFinite(raw.elaraHP)?Math.max(0,Math.floor(raw.elaraHP)):base.elaraHP;
 s.position=raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y)?{x:raw.position.x,y:raw.position.y}:null;
 if(raw.combat!==null&&raw.combat!==undefined){if(raw.combat&&typeof raw.combat==='object'&&Array.isArray(raw.combat.units)&&typeof raw.combat.kind==='string')s.combat=raw.combat;else{s.combat=null;fields.push('combat');}}else s.combat=null;
 return {state:s,changed:fields.length>0||raw.v!==2,invalidFields:fields};
}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),inside=(x,y)=>x>=0&&x<7&&y>=0&&y<5;
class Battle{
 constructor(kind,p,save={},rng){this.rng=rng||null;this.events=[];this.rolls=[];
 if(save.combat){this.s=JSON.parse(JSON.stringify(save.combat));return;}
 const h={...p,hp:save.hp??p.max,x:1,y:3,team:'party'},e={...enemies[kind],id:'enemy',kind,hp:enemies[kind].max,x:['custodian','sentinel','ash'].includes(kind)?3:4,y:['custodian','sentinel','ash'].includes(kind)?1:2,team:'enemy'};
 this.s={kind,units:[h,e],round:1,index:0,order:[],action:true,movement:h.move,acted:[],wheels:[],valve:false,exposed:false,spellArmor:false,spells:save.spells??p.spells,potions:save.potions??2,warning:null,history:[],result:null,opening:true,shadowFeint:false,markedTarget:null,arcaneFocus:false};
 if(['whisper','sentinel','ash'].includes(kind)&&save.flags?.elara)this.s.units.push({...elara,hp:save.elaraHP??16,x:1,y:2,team:'party'});
 this.s.order=this.s.units.map(u=>{const die=this.die();this.log(`${u.name} · iniciativa ${die} ${sign(u.init)} = ${die+u.init}`);return {id:u.id,n:die+u.init,dex:u.init}}).sort((a,b)=>b.n-a.n||b.dex-a.dex).map(x=>x.id);
 if(kind==='ash')this.s.warning={type:'radius',x:3,y:1};this.begin();
 }
 die(n=20){let value;if(this.rng)value=this.rng(n);else{const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);value=a[0]%n+1;}this.rolls.push({sides:n,value});return value;}
 log(s){this.s.history.push(s);this.s.history=this.s.history.slice(-60);this.events.push(s)}
 get actor(){return this.s.units.find(u=>u.id===this.s.order[this.s.index])}
 get hero(){return this.s.units.find(u=>u.id==='hero')}
 get enemy(){return this.s.units.find(u=>u.id==='enemy')}
 begin(){const a=this.actor;this.s.action=true;this.s.movement=a.move;this.s.guard=false;this.log(`Turno de ${a.name} · ronda ${this.s.round}`)}
 occupied(x,y){return this.s.units.some(u=>u.hp>0&&u.x===x&&u.y===y)}
 move(dx,dy){if(this.s.result||this.actor.team!=='party'||Math.abs(dx)+Math.abs(dy)!==1||this.s.movement<1)return false;const a=this.actor,x=a.x+dx,y=a.y+dy;if(!inside(x,y)||this.occupied(x,y))return false;a.x=x;a.y=y;this.s.movement--;return true;}
 hit(a,b,power=0){const reach=a.range??1;if(!this.s.noBoard&&distance(a,b)>reach){this.log(a.name+' está fuera de alcance para un ataque cuerpo a cuerpo.');return null;}const ac=(!this.s.acted.includes(b.id)?b.flat:b.ac)+(b.guard?4:0),d=this.die(),bonus=a.attack-power+(a.team==='party'&&this.precision?2:0);this.log(`${a.name}: d20 ${d} ${sign(bonus)} = ${d+bonus} contra CA ${ac}`);if(d===1||(d!==20&&d+bonus<ac)){this.log('Fallo.');return 0;}
  this.log('Impacto: el ataque supera la defensa.');let crit=false;if(d>=a.threat&&!b.construct){const q=this.die();crit=q!==1&&(q===20||q+bonus>=ac);this.log(`Confirmación: ${q} ${sign(bonus)} = ${q+bonus} · ${crit?'crítico':'impacto normal'}`)}
 let dmg=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1)+(this.s.markedTarget===b.id?2:0));if(crit)dmg+=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1));
 const ally=this.s.units.find(u=>u.team==='party'&&u.id!==a.id&&u.hp>0);const flank=ally&&distance(a,b)===1&&distance(ally,b)===1&&a.x+ally.x===2*b.x&&a.y+ally.y===2*b.y;
 if(a.class==='Pícaro'&&(!b.construct||this.s.exposed)&&(this.s.shadowFeint||!this.s.acted.includes(b.id)||flank||this.s.exposed)){const sides=a.sneakDie||6,sneak=this.die(sides);dmg+=sneak;this.s.shadowFeint=false;this.log(`Ataque furtivo +${sneak} (1d${sides}).`)}
 dmg=this.mitigate(b,dmg);b.hp=Math.max(0,b.hp-dmg);this.log(`${b.name} recibe ${dmg} de daño${crit?' crítico':''}.`);return dmg;}
 mitigate(target,damage){if(target.team!=='party'||!this.reaction)return damage;const n=this.reaction==='parry'?0:Math.floor(damage/2);this.log(`${target.name}: ${this.reaction==='parry'?'parada':'esquiva'} reduce ${damage} a ${n} PG.`);return n;}
 act(kind,options={}){this.precision=!!options.precision;if(this.s.result||this.actor.team!=='party'||!this.s.action)return false;const a=this.actor,e=this.enemy;
 if(kind==='attack'||kind==='power'){if(kind==='power'&&!a.power)return false;const damage=this.hit(a,e,kind==='power'?a.bab:0);if(damage===null)return false;}
 else if(kind==='missile'){if(a.class!=='Mago'||this.s.spells<1)return false;if(!this.s.noBoard&&distance(a,e)>(a.missileRange??4))return this.fail('El objetivo está fuera del alcance del proyectil mágico.');const d=this.die(4)+1+(this.precision?1:0)+(a.subclass==='Tejedor'?1:0)+(this.s.arcaneFocus?(a.spellDC||0):0);e.hp=Math.max(0,e.hp-d);this.s.spells--;this.s.arcaneFocus=false;this.log(`Proyectil mágico${a.subclass==='Tejedor'?' de ceniza':''}: 1d4+1${a.subclass==='Tejedor'?' +1 de Tejedor':''}${this.precision?' +1 de precisión':''} = ${d}. Impacta sin tirada de ataque.`);}
 else if(kind==='armor'){if(a.class!=='Mago'||this.s.spells<1||this.s.spellArmor)return false;this.s.spells--;a.ac+=4;a.flat+=4;this.s.spellArmor=true;this.s.arcaneFocus=false;this.log('Armadura de mago: +4 CA durante este encuentro.');}
 else if(kind==='potion'){if(!this.s.potions||a.hp===a.max)return false;const d=this.die(8)+1,healed=Math.min(d,a.max-a.hp);a.hp+=healed;this.s.potions--;this.log(`${a.name} bebe una poción: 1d8+1 = ${d}; recupera ${healed} PG.`);}
 else if(kind==='finta'){if(a.class!=='Pícaro'||a.action==='marcar')return false;this.s.shadowFeint=true;this.s.targetId=e.id;this.log(`${a.name} ejecuta una finta de sombra: el próximo ataque puede aplicar furtivo +1d${a.sneakDie||8}.`);}
 else if(kind==='marcar'){if(a.class!=='Pícaro'||a.action!=='marcar')return false;this.s.markedTarget=e.id;this.s.targetId=e.id;this.log(`${a.name} marca a ${e.name}: el siguiente impacto causa +2 daño.`);}
 else if(kind==='canalizar'){if(a.class!=='Mago'||a.action!=='canalizar')return false;this.s.arcaneFocus=true;this.log(`${a.name} canaliza el Umbral: el próximo conjuro recibe +${a.spellDC||0} CD y precisión.`);}
 else if(kind==='guard'){a.guard=true;this.log(`${a.name} adopta defensa total: +4 CA hasta su siguiente turno.`);}
  else if(kind==='mechanism'){
  const needsContact=['echo','whisper','custodian'].includes(this.s.kind);
  const contactTarget=this.s.kind==='custodian'?{x:this.s.wheels.includes(0)?6:0,y:1}:e;
  if(needsContact&&!this.s.noBoard&&distance(a,contactTarget)>1)return this.fail('Debes acercarte al mecanismo antes de activarlo.');
  if(this.s.kind==='echo'){this.s.valve=true;e.hp=0;this.log('La válvula queda cerrada. El eco se disipa.');}
 else if(this.s.kind==='whisper'){e.hp=0;this.log('Aíslas el foco con el paño. El eco se deshace.');}
 else if(this.s.kind==='ash'){const i=[0,1].find(j=>!this.s.wheels.includes(j));if(i===undefined)return this.fail('Los dos soportes ya están apagados.');this.s.wheels.push(i);e.attack=8-this.s.wheels.length;this.log('Soporte apagado. El martillo pierde fuerza.');if(this.s.wheels.length===2){this.s.cancelNext=true;this.s.exposed=true;this.log('Ambos soportes apagados. La palanca central queda libre.');}}
 else if(this.s.kind==='custodian'){const i=[0,1].find(j=>!this.s.wheels.includes(j));if(i===undefined)return this.fail('Las dos ruedas ya están cerradas.');this.s.wheels.push(i);this.log(`Rueda ${i+1} cerrada (${this.s.wheels.length}/2).`);if(this.s.wheels.length===2){e.hp=0;this.log('Ambas ruedas cerradas: el Custodio se apaga.');}}
 else return false;}
 else if(kind==='lever'){if(this.s.kind!=='ash'||this.s.wheels.length<2)return this.fail('Apaga los dos soportes antes de accionar la palanca.');const helper=this.s.leverHelper;if(helper&&helper!==a.id){this.s.leverDone=true;this.log('Ambos personajes completan la maniobra de la palanca.');}else{const d=this.die(),bonus=a.strength??a.bonus??0;this.log(`Palanca: ${d} + ${bonus} contra CD 12.`);if(d+bonus>=12)this.s.leverDone=true;else{this.s.leverHelper=a.id;this.log('Puedes reintentar o pedir al compañero que complete la maniobra.');}}if(this.s.leverDone)e.hp=0;}
 else if(kind==='conduit'){if(this.s.kind!=='custodian'||this.s.exposed)return false;const d=this.die();this.log(`Conducto: d20 ${d} ${sign(a.attack)} contra CA 10.`);if(d!==1&&(d===20||d+a.attack>=10)){const dmg=Math.max(1,this.die(a.damage)+a.bonus);this.s.conduitHP=(this.s.conduitHP??3)-dmg;this.log(`Conducto recibe ${dmg} de daño.`);if(this.s.conduitHP<=0){e.hp=Math.max(0,e.hp-4);this.s.exposed=true;this.s.cancelNext=true;this.log('Carga interrumpida. Núcleo expuesto; Custodio pierde 4 PG.');}}}
 else return false;
 this.s.action=false;this.check();return true;}
 fail(msg){this.log(msg);return false;}
 check(){if(this.hero.hp<=0){this.s.result='defeat';this.log('Has caído. Puedes volver al punto seguro.');}else if(this.enemy.hp<=0&&(this.s.kind!=='ash'||this.s.wheels.length===2)){this.s.result='victory';this.log('Encuentro resuelto.');}}
 end(){if(this.s.result)return;const a=this.actor;if(!this.s.acted.includes(a.id))this.s.acted.push(a.id);let tries=0;do{this.s.index=(this.s.index+1)%this.s.order.length;if(this.s.index===0)this.s.round++;tries++;}while(this.actor.hp<=0&&tries<4);this.actor.guard=false;this.begin();}
   moveToward(actor,target){if(this.s.noBoard)return;let steps=Math.max(0,actor.move??0),moved=0,range=actor.range??1;while(steps>0&&distance(actor,target)>range){const options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:actor.x+dx,y:actor.y+dy,dx,dy})).filter(p=>inside(p.x,p.y)&&!this.occupied(p.x,p.y)).sort((u,v)=>distance(u,target)-distance(v,target));if(!options.length)break;actor.x=options[0].x;actor.y=options[0].y;steps--;moved++;}if(moved)this.log(actor.name+' avanza '+moved+' casilla'+(moved===1?'':'s')+' para entrar en alcance.');}
  enemyTurn(){if(this.s.result||this.actor.team!=='enemy')return;const e=this.enemy,targets=this.s.units.filter(u=>u.team==='party'&&u.hp>0).sort((a,b)=>distance(e,a)-distance(e,b)),t=targets[0];if(!t){this.check();return;}
  if(this.s.kind==='ash'){
   if(this.s.cancelNext){this.log('Los soportes apagados cancelan el pulso.');this.s.cancelNext=false;this.s.warning=null;}
   else if(this.s.warning?.type==='radius'){const d=this.die(),raw=this.die(4)+this.die(4),ok=d===20||(d!==1&&d+t.ref>=14),damage=ok?(t.class==='Pícaro'&&t.level>=2?0:Math.floor(raw/2)):raw;t.hp=Math.max(0,t.hp-damage);this.log(`${t.name}: Reflejos ${d}+${t.ref} CD 14; pulso ${damage} PG.`);this.s.warning=null;}
   else{this.moveToward(e,t);this.hit(e,t);this.s.warning={type:'radius'};this.log('Pulso de ceniza anunciado: el siguiente ataque será un área.');}
  }else if(['custodian','sentinel'].includes(this.s.kind)){
   if(this.s.cancelNext){this.log('El conducto roto cancela el golpe anunciado.');this.s.cancelNext=false;}
   else if(this.s.warning?.type==='pulse'){const d=this.die(),dmg=this.die(4),ok=d===20||(d!==1&&d+t.ref>=12),actual=ok?(t.class==='Pícaro'&&t.level>=2?0:Math.floor(dmg/2)):dmg;t.hp=Math.max(0,t.hp-actual);this.log(`${t.name}: Reflejos ${d} ${sign(t.ref)} contra CD 12; descarga ${actual} PG.`);}
   else if(this.s.warning){this.moveToward(e,t);this.hit(e,t);}
   else this.log(this.s.kind==='sentinel'?'El Centinela despierta y prepara un golpe.':'El Custodio arranca y prepara un golpe.');
   this.s.warning=this.s.warning?.type==='strike'?{type:'pulse'}:{type:'strike'};this.log(this.s.warning.type==='pulse'?'Próximo turno: descarga anunciada.':'Próximo turno: golpe anunciado.');
  }else if(this.s.opening){this.s.opening=false;this.log(this.s.kind==='echo'?'El eco reúne ceniza. Tienes tiempo para atacar.':'El eco imita el silbato. Elara reconoce la falsificación.');}
  else this.moveToward(e,t);this.hit(e,t);
  this.reaction=null;this.check();if(!this.s.result)this.end();}
 autoPlan(tactic){const a=this.actor,e=this.enemy;if(a.id!=='elara'||this.s.result)return {action:'guard'};
 if(a.hp<=5&&this.s.potions)return {action:'potion'};
 if(this.s.kind==='ash'&&e.hp<=0){const target=this.s.wheels.length<2?{x:this.s.wheels.includes(0)?6:0,y:1}:{x:3,y:3};if(distance(a,target)<=1)return {action:this.s.wheels.length<2?'mechanism':'lever'};if(this.s.movement>0){const moves=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>inside(a.x+dx,a.y+dy)&&!this.occupied(a.x+dx,a.y+dy)).sort((u,v)=>distance({x:a.x+u[0],y:a.y+u[1]},target)-distance({x:a.x+v[0],y:a.y+v[1]},target));if(moves.length)return {move:moves[0]};}}
 if(this.s.noBoard){if(this.s.kind==='echo'||this.s.kind==='whisper')return {action:'mechanism'};if(this.s.kind==='custodian'&&!this.s.exposed&&this.s.wheels.length<2)return {action:'mechanism'};if(this.s.kind==='custodian'&&this.s.exposed)return {action:'conduit'};if(this.s.kind==='ash'&&e.hp<=0)return {action:this.s.wheels.length<2?'mechanism':'lever'};return {action:'attack'};}
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
const api={profile,fresh,valid,migrate,places,Battle,defaults,distance,races:raceData,subclassRules,elara:Object.freeze({...elara})};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasRules=api;
})(typeof window!=='undefined'?window:globalThis);
