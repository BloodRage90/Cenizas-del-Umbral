/* Small deterministic turn engine. Rules specific to this campaign are explicit. */
(function(root){
'use strict';
const mod=n=>Math.floor((n-10)/2),sign=n=>n>=0?'+'+n:String(n);
const Data=typeof module!=='undefined'&&module.exports?require('./character-data.js'):(root.CenizasCharacterData||{});
const Systems=typeof module!=='undefined'&&module.exports?require('./combat-systems.js'):root.CenizasCombatSystems||{
 MAX_PI:5,classVerbs:Data?.classVerbs||{},raceVerbs:Data?.raceVerbs||{},
 TECHS:{filoUmbrio:{id:'filoUmbrio',name:'Filo Umbrío',requires:['Pícaro','Guerrero'],cost:2,multiplier:1.5},llamaArcana:{id:'llamaArcana',name:'Llama Arcana',requires:['Mago','Guerrero'],cost:3,multiplier:1.6},sombraDoble:{id:'sombraDoble',name:'Sombra Doble',requires:['Pícaro','Mago'],cost:2,multiplier:1.5},provocar:{id:'provocar',name:'Provocar',requires:['Guerrero'],cost:1,multiplier:1}},
 beginBlock:(targetId='hero',o={})=>({targetId,startedAt:o.startedAt??Date.now(),duration:o.duration??1200,windowStart:o.windowStart??.38,windowEnd:o.windowEnd??.7,attempts:0,status:'pending',reduction:0}),
 resolveBlock:(b,elapsed)=>{if(!b||b.status!=='pending')return{success:false,ignored:true,reduction:0,piGain:0};b.attempts=(b.attempts||0)+1;const p=elapsed>1?elapsed/b.duration:elapsed,success=p>=b.windowStart&&p<=b.windowEnd;b.status=success?'success':'fail';b.reduction=success?.5:0;return{success,reduction:b.reduction,piGain:success?1:0,attempts:b.attempts};},
 partyClasses:party=>new Set((party||[]).filter(u=>u&&u.hp>0).flatMap(u=>Array.isArray(u.classes)?u.classes:[u.class]).filter(Boolean)),
 canUseTech:(id,party,pi)=>{const t=Systems.TECHS[id],classes=Systems.partyClasses(party);return !!t&&pi>=t.cost&&t.requires.every(c=>classes.has(c));}
};
// Keep the engine playable even when the optional character-data script failed to
// load (for example, a direct file preview or a partially cached deployment).
// The browser normally supplies the complete data module; these values are only
// a deterministic safety net and are intentionally kept small.
const fallbackRace={mods:[0,0,0,0,0,0],speed:6,size:'M',damageDiePenalty:0,attackBonus:0,acBonus:0};
const fallbackClasses={
 Guerrero:{hp:10,armor:4,shield:1,maxDex:4,damageDie:8},
 Pícaro:{hp:8,armor:2,shield:0,maxDex:6,damageDie:6},
 Mago:{hp:6,armor:1,shield:0,maxDex:5,damageDie:6}
};
const raceData=Object.keys(Data.raceData||{}).length?Data.raceData:{Humano:fallbackRace};
const classes=Object.keys(Data.classes||{}).length?Data.classes:fallbackClasses;
const subclassRules=Data.subclassRules||{};
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
 const damageType=cls==='Mago'?(c.subclass==='Tejedor'?'fire':'arcane'):cls==='Pícaro'?'piercing':'slash';
 return {id:'hero',name:String(c.name||'Viajero').slice(0,40),class:cls,race,subclass:c.subclass||null,gender:c.gender||null,level:lvl,max:hp,ac,flat:10+armor+Math.min(0,m[1])+(rule?.ac||0),attack,damage,bonus:(cls==='Mago'?m[3]:m[0])+(rule?.damage||0),damageType,threat:cls==='Mago'?20:19,init:m[1]+(has('Iniciativa mejorada')?4:0)+(rule?.initiative||0),ref:(cls==='Pícaro'?(2+Math.floor(lvl/2)):Math.floor(lvl/3))+m[1]+(has('Reflejos rápidos')?2:0),strength:m[0],move:raceSpeed[race]??6,range:1,missileRange:4+(rule?.ranged||0),spells,power:has('Ataque poderoso')&&m[0]>=1,bab,subclassRule:rule?.label||null,sneakDie:rule?.sneakDie||0,spellDC:rule?.spellDC||0,action:rule?.action||null,actionLabel:rule?.combatName||Systems.classVerbs?.[cls]?.combat||'Actuar',actionCost:rule?.combatCost||0,actionDescription:rule?.combatDescription||rule?.description||'',verb:Systems.classVerbs?.[cls]||null,raceVerb:Systems.raceVerbs?.[race]||null,small};
}
 const enemies={ash:{name:"Guardián de ceniza",max:42,ac:16,flat:15,attack:8,damage:6,bonus:3,init:1,ref:2,move:4,threat:20,construct:true,weak:'fire',resist:'slash',sprite:'ash-warden',pattern:['heavy','radius','guard']},sentinel:{name:'Centinela del claro',max:22,ac:14,flat:14,attack:3,damage:4,bonus:1,init:0,ref:0,move:0,threat:20,construct:true,weak:'arcane',resist:'slash',sprite:'rootbound-sentinel',pattern:['strike','guard','pulse']},echo:{name:'Eco incipiente',max:4,ac:12,flat:11,attack:1,damage:3,bonus:-1,init:1,ref:1,move:4,threat:20,weak:'slash',resist:'arcane',sprite:'mirror-shade',pattern:['strike','guard']},custodian:{name:'Custodio de la compuerta',max:16,ac:13,flat:13,attack:2,damage:4,bonus:1,init:-1,ref:0,move:0,threat:20,construct:true,weak:'fire',resist:'slash',sprite:'drowned-knight',pattern:['strike','pulse','guard']},whisper:{name:'Eco del murmullo',max:12,ac:13,flat:11,attack:3,damage:4,bonus:0,init:2,ref:2,move:6,threat:20,weak:'slash',resist:'fire',sprite:'willow-spirit',pattern:['curse','strike','guard']}};
 const variantData={
  'river-wisp':{name:'Náyade de la compuerta',max:13,ac:13,attack:3,damage:4,bonus:1,init:3,ref:2,behavior:'water',pattern:['guard','strike','curse']},
  'candle-imp':{name:'Diablillo de la rueda',max:10,ac:14,attack:4,damage:3,bonus:1,init:4,ref:3,behavior:'haste',pattern:['strike','haste']},
  'thorn-goblin':{name:'Trasgo de espinas',max:15,ac:14,attack:3,damage:5,bonus:0,init:1,ref:1,behavior:'bleed',pattern:['strike','heavy']},
  'mirror-shade':{name:'Sombra de espejo',max:11,ac:15,attack:3,damage:4,bonus:0,init:4,ref:4,behavior:'mirror'},
  'bell-moth':{name:'Polilla campana',max:12,ac:13,attack:2,damage:4,bonus:2,init:5,ref:3,behavior:'bell'},
  'ember-wolf':{name:'Lobo de brasa',max:16,ac:14,attack:5,damage:5,bonus:0,init:3,ref:2,behavior:'burn'},
  'marsh-hag':{name:'Bruja del pantano',max:18,ac:12,attack:3,damage:6,bonus:1,init:0,ref:3,behavior:'curse'},
  'fungal-brute':{name:'Bruto micelial',max:24,ac:12,attack:4,damage:6,bonus:2,init:-1,ref:0,behavior:'spore'},
  'drowned-knight':{name:'Caballero ahogado',max:20,ac:16,attack:5,damage:5,bonus:2,init:0,ref:2,behavior:'guard'},
  'redcap-miner':{name:'Minero bermejo',max:14,ac:14,attack:4,damage:4,bonus:1,init:2,ref:1,behavior:'mine'},
  'willow-spirit':{name:'Espíritu de sauce',max:17,ac:13,attack:3,damage:5,bonus:2,init:2,ref:4,behavior:'root'},
  'clockwork-raven':{name:'Cuervo de engranajes',max:12,ac:16,attack:4,damage:3,bonus:1,init:6,ref:2,behavior:'copper'},
  'glass-serpent':{name:'Serpiente de vidrio',max:13,ac:15,attack:3,damage:4,bonus:1,init:5,ref:4,behavior:'reflect'},
  'frost-revenant':{name:'Revenante de escarcha',max:19,ac:14,attack:4,damage:5,bonus:2,init:1,ref:3,behavior:'frost'},
  'rune-beetle':{name:'Escarabajo rúnico',max:9,ac:17,attack:2,damage:3,bonus:0,init:4,ref:5,behavior:'rune'},
  'ash-drake':{name:'Draco de ceniza',max:22,ac:15,attack:5,damage:6,bonus:2,init:2,ref:2,behavior:'ash'},
  'iron-boar':{name:'Jabalí de hierro',max:21,ac:15,attack:6,damage:5,bonus:1,init:1,ref:1,behavior:'charge'},
  'ash-warden':{name:'Guardián de pavesas',max:18,ac:16,attack:4,damage:5,bonus:1,init:2,ref:2,behavior:'ember'},
  'rootbound-sentinel':{name:'Centinela de raíces',max:23,ac:15,attack:5,damage:5,bonus:2,init:0,ref:3,behavior:'root'},
  'umbral-spider':{name:'Araña umbría',max:14,ac:16,attack:4,damage:4,bonus:1,init:5,ref:3,behavior:'web'}
 };
 const elara={id:'elara',name:'Elara',look:{sheet:'elara-walk',facing:'right'},class:'Guerrero',classes:['Guerrero','Pícaro','Mago'],max:16,hp:16,ac:16,flat:15,attack:4,damage:8,bonus:2,threat:19,init:1,ref:1,move:6,range:1,role:'Guardia de Valdara'};
 const allyProfiles={
  elara,
  ordan:{id:'ordan',name:'Ordan',class:'Guerrero',race:'Enano',gender:'Hombre',subclass:'Guardia',classes:['Guerrero'],max:18,hp:18,ac:15,flat:14,attack:5,damage:8,bonus:2,threat:19,init:0,ref:1,move:6,range:1,role:'Campanero del taller'},
  iria:{id:'iria',name:'Iria',class:'Pícaro',race:'Elfo',gender:'Mujer',subclass:'Explorador',classes:['Pícaro'],max:14,hp:14,ac:15,flat:14,attack:5,damage:6,bonus:2,threat:19,init:4,ref:4,move:7,range:2,role:'Guardabosques',sneakDie:6,action:'marcar'},
  darien:{id:'darien',name:'Darien',class:'Mago',race:'Humano',gender:'Hombre',subclass:'Arcanista',classes:['Mago'],max:12,hp:12,ac:12,flat:11,attack:2,damage:6,bonus:3,threat:20,init:2,ref:3,move:6,range:3,spells:3,action:'canalizar',spellDC:1,role:'Archivista'}
 };
 const allyUnlock=(id,save={})=>id==='elara'?!!save.flags?.elara:id==='ordan'?!!(save.flags?.ordanMet||save.flags?.workshop||save.flags?.mountainStarted):id==='iria'?!!save.flags?.iriaJoined:id==='darien'?!!save.flags?.darienMet:false;
 function selectedParty(save={}){
  const raw=Array.isArray(save.party)?save.party:['elara'];
  return [...new Set(raw)].filter(id=>allyProfiles[id]&&allyUnlock(id,save)).slice(0,2);
 }
const places=['plaza','taller','criptas','bosque','lindero','embarcadero','molino','monasterio','archivo','enfermeria','capilla','montana','antesala','umbral'];
Object.values(enemies).forEach(e=>{e.range=1;});
function fresh(){return {v:2,place:'plaza',flags:{},branch:null,level:1,hp:null,spells:null,potions:2,gold:12,items:[],log:[],combat:null,party:['elara'],allyHP:{elara:16},elaraHP:16,elaraMode:'manual',tactic:'protect',atbMode:'turn',timingMode:'standard',timingWindow:'standard',position:null,pi:0,piMax:Systems.MAX_PI,blockStreak:0,techsUsed:[],techsLearned:['provocar']};}
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
 if(!Number.isFinite(raw.pi)){s.pi=base.pi;fields.push('pi');}else s.pi=Math.max(0,Math.min(base.piMax,Math.floor(raw.pi)));
 s.piMax=base.piMax;
 if(!Number.isFinite(raw.blockStreak)){s.blockStreak=0;fields.push('blockStreak');}else s.blockStreak=Math.max(0,Math.floor(raw.blockStreak));
 s.techsUsed=Array.isArray(raw.techsUsed)?raw.techsUsed.filter(x=>typeof x==='string').slice(-20):[];
 if(raw.hp===null||raw.hp===undefined)s.hp=null;else if(!Number.isFinite(raw.hp)){s.hp=null;fields.push('hp');}else s.hp=Math.max(0,Math.floor(raw.hp));
 if(raw.spells===null||raw.spells===undefined)s.spells=null;else if(!Number.isFinite(raw.spells)){s.spells=null;fields.push('spells');}else s.spells=Math.max(0,Math.floor(raw.spells));
 s.party=Array.isArray(raw.party)?[...new Set(raw.party.filter(x=>typeof x==='string'))].slice(0,2):base.party.slice();
 s.allyHP=raw.allyHP&&typeof raw.allyHP==='object'&&!Array.isArray(raw.allyHP)?Object.fromEntries(Object.entries(raw.allyHP).filter(([id,hp])=>allyProfiles[id]&&Number.isFinite(hp)).map(([id,hp])=>[id,Math.max(0,Math.floor(hp))])):{...base.allyHP};
 s.elaraHP=Number.isFinite(raw.elaraHP)?Math.max(0,Math.floor(raw.elaraHP)):Number.isFinite(s.allyHP.elara)?s.allyHP.elara:base.elaraHP;
 s.allyHP.elara=s.elaraHP;
 s.atbMode=raw.atbMode==='active'?'active':'turn';
 s.timingMode=raw.timingMode==='off'?'off':'standard';
 s.timingWindow=['short','standard','wide'].includes(raw.timingWindow)?raw.timingWindow:'standard';
 s.techsLearned=Array.isArray(raw.techsLearned)?raw.techsLearned.filter(x=>typeof x==='string'&&Systems.TECHS[x]).slice(-30):base.techsLearned.slice();
 s.position=raw.position&&Number.isFinite(raw.position.x)&&Number.isFinite(raw.position.y)?{x:raw.position.x,y:raw.position.y}:null;
 if(raw.combat!==null&&raw.combat!==undefined){if(raw.combat&&typeof raw.combat==='object'&&Array.isArray(raw.combat.units)&&typeof raw.combat.kind==='string')s.combat=raw.combat;else{s.combat=null;fields.push('combat');}}else s.combat=null;
 return {state:s,changed:fields.length>0||raw.v!==2,invalidFields:fields};
}
const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),inside=(x,y)=>x>=0&&x<7&&y>=0&&y<5;
class Battle{
 constructor(kind,p,save={},rng){this.rng=rng||null;this.events=[];this.rolls=[];
 if(save.combat){this.s=JSON.parse(JSON.stringify(save.combat));this.s.pi=Math.max(0,Math.min(Systems.MAX_PI,Math.floor(this.s.pi??save.pi??0)));this.s.piMax=Systems.MAX_PI;this.s.block=null;this.s.blockStreak=Math.max(0,Math.floor(this.s.blockStreak??save.blockStreak??0));this.s.techsUsed=Array.isArray(this.s.techsUsed)?this.s.techsUsed.slice(-20):[];this.s.techsLearned=Array.isArray(this.s.techsLearned)?this.s.techsLearned.slice(-30):(Array.isArray(save.techsLearned)?save.techsLearned.slice(-30):['provocar']);this.s.channeling=!!this.s.channeling;this.s.techEffects=this.s.techEffects||{};this.s.markBonusTarget??=null;this.s.filoMark??=null;this.s.shadowFeintTarget??=null;this.s.shadowFeintUntil??=0;return;}
 const h={...p,hp:save.hp??p.max,x:1,y:3,team:'party'},e={...enemies[kind],id:'enemy',kind,hp:enemies[kind].max,x:['custodian','sentinel','ash'].includes(kind)?3:4,y:['custodian','sentinel','ash'].includes(kind)?1:2,team:'enemy'};
 this.s={kind,units:[h,e],round:1,index:0,order:[],action:true,movement:h.move,acted:[],wheels:[],valve:false,exposed:false,spellArmor:false,spells:save.spells??p.spells,potions:save.potions??2,warning:null,history:[],result:null,opening:true,shadowFeint:false,shadowFeintTarget:null,shadowFeintUntil:0,markedTarget:null,markBonusTarget:null,filoMark:null,arcaneFocus:false,pi:Math.max(0,Math.min(Systems.MAX_PI,Math.floor(save.pi??0))),piMax:Systems.MAX_PI,block:null,blockStreak:Math.max(0,Math.floor(save.blockStreak??0)),techsUsed:Array.isArray(save.techsUsed)?save.techsUsed.slice(-20):[],techsLearned:Array.isArray(save.techsLearned)?save.techsLearned.slice(-30):['provocar'],channeling:false,techEffects:{}};
 for(const id of selectedParty(save)){const ally=allyProfiles[id];const hp=Number.isFinite(save.allyHP?.[id])?save.allyHP[id]:id==='elara'?(save.elaraHP??ally.max):ally.max;this.s.units.push({...ally,hp:Math.max(0,Math.min(ally.max,Math.floor(hp))),x:1,y:2,team:'party'});}
 this.s.order=this.s.units.map(u=>{const die=this.die();this.log(`${u.name} · iniciativa ${die} ${sign(u.init)} = ${die+u.init}`);return {id:u.id,n:die+u.init,dex:u.init}}).sort((a,b)=>b.n-a.n||b.dex-a.dex).map(x=>x.id);
 if(kind==='ash')this.s.warning={type:'radius',x:3,y:1};this.begin();
 }
  setVariant(variant,encounter={}){const data=variantData[variant];if(!data||!this.enemy)return false;Object.assign(this.enemy,data,{variant,sprite:data.sprite||variant});this.enemy.max=data.max;this.enemy.hp=data.max;this.enemy.name=encounter.enemyName||data.name;this.enemy.flat=data.flat??Math.max(10,data.ac-1);this.s.variant=variant;this.s.variantBehavior=data.behavior;this.s.encounter=encounter;this.log(`${this.enemy.name} entra en escena.`);return true;}
 die(n=20){let value;if(this.rng)value=this.rng(n);else{const a=new Uint32Array(1),limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a)}while(a[0]>=limit);value=a[0]%n+1;}this.rolls.push({sides:n,value});return value;}
 log(s){this.s.history.push(s);this.s.history=this.s.history.slice(-60);this.events.push(s)}
 get actor(){return this.s.units.find(u=>u.id===this.s.order[this.s.index])}
 get hero(){return this.s.units.find(u=>u.id==='hero')}
 get enemy(){return this.s.units.find(u=>u.id==='enemy')}
 chooseEnemyPattern(enemy){const pattern=Array.isArray(enemy?.pattern)&&enemy.pattern.length?enemy.pattern:['strike'];const roll=this.rng?this.rng(20):Math.floor(Math.random()*20)+1;return pattern[Math.max(0,(Math.floor(roll)-1)%pattern.length)];}
 enemyPatternTurn(enemy,target){const action=this.chooseEnemyPattern(enemy);if(!['guard','pulse'].includes(action))this.moveToward(enemy,target);this.s.warning={type:'pattern',action};this.s.enemyPattern=action;this.log(`${enemy.name} anuncia: ${action==='heavy'?'golpe pesado':action==='guard'?'guardia':action==='curse'?'maldición':action==='pulse'?'descarga':'ataque'}.`);return action;}
 begin(){const a=this.actor;this.s.action=true;this.s.movement=a.move;this.s.guard=false;this.log(`Turno de ${a.name} · ronda ${this.s.round}`)}
 gainPI(amount=1,reason=''){
  const before=this.s.pi||0;this.s.pi=Math.min(this.s.piMax||Systems.MAX_PI,before+Math.max(0,Math.floor(amount)));
  if(this.s.pi>before)this.log(`PI +${this.s.pi-before}${reason?' · '+reason:''} (${this.s.pi}/${this.s.piMax||Systems.MAX_PI}).`);return this.s.pi-before;
 }
 spendPI(amount){const cost=Math.max(0,Math.floor(amount));if((this.s.pi||0)<cost)return false;this.s.pi-=cost;this.log(`PI −${cost} (${this.s.pi}/${this.s.piMax||Systems.MAX_PI}).`);return true;}
 prepareBlock(targetId='hero',options={}){this.s.block=Systems.beginBlock(targetId,{...options,startedAt:Date.now()});this.log('Defensa activa: pulsa Bloquear en la ventana dorada.');return this.s.block;}
 resolveBlock(elapsed){if(!this.s.block)return {success:false,ignored:true,reduction:0,piGain:0};const result=Systems.resolveBlock(this.s.block,elapsed);if(result.success){this.s.blockStreak=(this.s.blockStreak||0)+1;this.gainPI(1,'bloqueo perfecto');}else this.s.blockStreak=0;this.s.block.result=result;this.log(result.success?'¡Bloqueo perfecto! Daño reducido.':'Bloqueo fallido: recibes el daño completo.');return result;}
 consumeBlock(target){const block=this.s.block;if(!block||block.targetId!==target.id)return {reduction:0,success:false};if(block.status==='pending')this.resolveBlock(block.duration+1);const result=block.result||block;this.s.block=null;return {reduction:result.reduction||0,success:!!result.success};}
 incoming(target,damage){if(!target||target.team!=='party')return damage;const block=this.consumeBlock(target);let reduced=block.success?Math.max(0,Math.floor(damage*(1-block.reduction))):damage;if(target.guard){this.gainPI(1,'postura de guardia');reduced=Math.floor(reduced*.65);}return this.mitigate(target,reduced);}
 applyAcDebuff(target,amount=2,duration=1){if(!target)return;const n=Math.max(0,Math.floor(amount));target._acDebuff=(target._acDebuff||0)+n;target._acDebuffUntil=Math.max(target._acDebuffUntil||0,this.s.round+duration);target.ac=Math.max(1,(target.ac??10)-n);target.flat=Math.max(1,(target.flat??10)-n);}
 restoreAcDebuffs(){for(const unit of this.s.units){if(!unit._acDebuff||this.s.round<unit._acDebuffUntil)continue;unit.ac=(unit.ac??10)+unit._acDebuff;unit.flat=(unit.flat??10)+unit._acDebuff;delete unit._acDebuff;delete unit._acDebuffUntil;this.log(`${unit.name} recupera su defensa.`);}}
 typedDamage(attacker,target,damage,type=attacker?.damageType){const weak=target?.weakness||target?.weak,resist=target?.resistance||target?.resist;let multiplier=1;if(type&&weak&&((Array.isArray(weak)&&weak.includes(type))||weak===type)){multiplier=1.5;this.log(`${target.name} es vulnerable a ${type}: daño aumentado.`);}else if(type&&resist&&((Array.isArray(resist)&&resist.includes(type))||resist===type)){multiplier=.5;this.log(`${target.name} resiste ${type}: daño reducido.`);}return Math.max(0,Math.floor(damage*multiplier));}
 availableTechs(){const party=this.s.units.filter(u=>u.team==='party'&&u.hp>0),learned=new Set(this.s.techsLearned||[]);return Object.values(Systems.TECHS).filter(t=>learned.has(t.id)&&Systems.canUseTech(t.id,party,this.s.pi||0));}
 useTech(id,target=this.enemy){const tech=Systems.TECHS[id];if(!tech||!target||target.hp<=0||!(this.s.techsLearned||[]).includes(id))return false;const party=this.s.units.filter(u=>u.team==='party'&&u.hp>0);if(!Systems.canUseTech(id,party,this.s.pi||0)||!this.s.action)return false;if(!this.spendPI(tech.cost))return false;const striker=party.find(u=>u.class==='Guerrero'&&tech.requires.includes('Guerrero'))||this.actor;const rogue=party.find(u=>u.class==='Pícaro'),mage=party.find(u=>u.class==='Mago');if(id==='filoUmbrio'){this.s.markedTarget=target.id;this.s.filoMark={targetId:target.id,bonus:2};this.applyAcDebuff(target,2,1);this.log(`Filo Umbrío: ${rogue?.name||'El Pícaro'} abre una grieta; el próximo golpe de ${striker.name} suma +2 daño.`);}
  else if(id==='llamaArcana'){this.s.techEffects.flame=true;this.s.techEffects.flameTarget=target.id;this.s.techEffects.flameActor=striker.id;this.log(`Llama Arcana: ${mage?.name||'El Mago'} imbuye el arma; el próximo golpe de ${striker.name} añade fuego.`);}
	  else if(id==='sombraDoble'){this.s.shadowFeint=true;this.s.shadowFeintTarget=target.id;this.s.shadowFeintUntil=this.s.round+1;target.slowed=true;const rogueActor=rogue||this.actor,base=Math.max(1,this.die(rogueActor.damage)+rogueActor.bonus),damage=Math.max(1,Math.floor(base*tech.multiplier)+(rogueActor.sneakDie?this.die(rogueActor.sneakDie):0));target.hp=Math.max(0,target.hp-damage);this.log(`Sombra Doble: ${mage?.name||'El Mago'} ralentiza y ${rogueActor.name} garantiza el furtivo · ${damage} PG.`);}
	  else if(id==='provocar'){this.applyAcDebuff(target,2,1);target.taunted=true;this.log(`${striker.name} provoca a ${target.name}: −2 CA hasta el siguiente ciclo.`);}
  this.s.techsUsed.push(id);this.s.techsUsed=this.s.techsUsed.slice(-20);this.s.action=false;this.check();return true;}
 occupied(x,y){return this.s.units.some(u=>u.hp>0&&u.x===x&&u.y===y)}
 move(dx,dy){if(this.s.result||this.actor.team!=='party'||Math.abs(dx)+Math.abs(dy)!==1||this.s.movement<1)return false;const a=this.actor,x=a.x+dx,y=a.y+dy;if(!inside(x,y)||this.occupied(x,y))return false;a.x=x;a.y=y;this.s.movement--;return true;}
 hit(a,b,power=0){const reach=a.range??1;if(!this.s.noBoard&&distance(a,b)>reach){this.log(a.name+' está fuera de alcance para un ataque cuerpo a cuerpo.');return null;}const ac=(!this.s.acted.includes(b.id)?b.flat:b.ac)+(b.guard?4:0),d=this.die(),bonus=a.attack-power+(a.team==='party'&&this.precision?2:0);this.log(`${a.name}: d20 ${d} ${sign(bonus)} = ${d+bonus} contra CA ${ac}`);if(d===1||(d!==20&&d+bonus<ac)){this.log('Fallo.');return 0;}
  this.log('Impacto: el ataque supera la defensa.');let crit=false;if(d>=a.threat&&!b.construct){const q=this.die();crit=q!==1&&(q===20||q+bonus>=ac);this.log(`Confirmación: ${q} ${sign(bonus)} = ${q+bonus} · ${crit?'crítico':'impacto normal'}`);if(crit&&a.team==='party')this.gainPI(1,'crítico')}
 let dmg=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1));if(a._fury){dmg+=2;a._fury=false;this.log('Furia de ceniza añade +2 daño.');}if(crit)dmg+=Math.max(1,this.die(a.damage)+a.bonus+power*(a.class==='Mago'?2:1));
 if(this.s.markBonusTarget===b.id){dmg+=2;this.s.markBonusTarget=null;this.s.markedTarget=null;this.log('La marca se consume: +2 daño.');}
 if(a.class==='Guerrero'&&this.s.filoMark?.targetId===b.id){dmg+=this.s.filoMark.bonus||2;this.s.filoMark=null;this.s.markedTarget=null;this.log('Filo Umbrío potencia el golpe del Guerrero.');}
 if(a.class==='Guerrero'&&this.s.techEffects?.flame&&this.s.techEffects.flameTarget===b.id&&(!this.s.techEffects.flameActor||this.s.techEffects.flameActor===a.id)){const fire=this.die(4);dmg+=fire;this.s.techEffects.flame=false;delete this.s.techEffects.flameTarget;delete this.s.techEffects.flameActor;this.log(`Llama Arcana añade ${fire} PG de fuego.`);}
 const ally=this.s.units.find(u=>u.team==='party'&&u.id!==a.id&&u.hp>0);const flank=ally&&distance(a,b)===1&&distance(ally,b)===1&&a.x+ally.x===2*b.x&&a.y+ally.y===2*b.y;
 if(a.class==='Pícaro'&&(!b.construct||this.s.exposed)&&(this.s.shadowFeint&&(!this.s.shadowFeintTarget||this.s.shadowFeintTarget===b.id)||!this.s.acted.includes(b.id)||flank||this.s.exposed)){const sides=a.sneakDie||6,sneak=this.die(sides);dmg+=sneak;this.s.shadowFeint=false;this.s.shadowFeintTarget=null;this.s.shadowFeintUntil=0;this.log(`Ataque furtivo +${sneak} (1d${sides}).`)}
 dmg=this.typedDamage(a,b,dmg);dmg=this.incoming(b,dmg);b.hp=Math.max(0,b.hp-dmg);this.log(`${b.name} recibe ${dmg} de daño${crit?' crítico':''}.`);return dmg;}
 mitigate(target,damage){if(target.team!=='party'||!this.reaction)return damage;const n=this.reaction==='parry'?0:Math.floor(damage/2);this.log(`${target.name}: ${this.reaction==='parry'?'parada':'esquiva'} reduce ${damage} a ${n} PG.`);return n;}
 act(kind,options={}){this.precision=!!options.precision;if(this.s.result||this.actor.team!=='party'||!this.s.action)return false;const a=this.actor,e=this.enemy;
 if(kind==='tech')return this.useTech(options.techId,e);
 if(kind==='attack'||kind==='power'){if(kind==='power'&&!a.power)return false;const damage=this.hit(a,e,kind==='power'?a.bab:0);if(damage===null)return false;}
 else if(kind==='missile'){if(a.class!=='Mago'||this.s.spells<1)return false;if(!this.s.noBoard&&distance(a,e)>(a.missileRange??4))return this.fail('El objetivo está fuera del alcance del proyectil mágico.');const raw=this.die(4)+1+(this.precision?1:0)+(a.subclass==='Tejedor'?1:0)+(this.s.arcaneFocus?(a.spellDC||0):0),d=this.typedDamage(a,e,raw);e.hp=Math.max(0,e.hp-d);this.s.spells--;this.s.arcaneFocus=false;this.gainPI(1,'acción elemental');this.log(`Proyectil mágico${a.subclass==='Tejedor'?' de ceniza':''}: 1d4+1${a.subclass==='Tejedor'?' +1 de Tejedor':''}${this.precision?' +1 de precisión':''} = ${d}. Impacta sin tirada de ataque.`);}
 else if(kind==='armor'){if(a.class!=='Mago'||this.s.spells<1||this.s.spellArmor)return false;this.s.spells--;a.ac+=4;a.flat+=4;this.s.spellArmor=true;this.s.arcaneFocus=false;this.log('Armadura de mago: +4 CA durante este encuentro.');}
 else if(kind==='potion'){if(!this.s.potions||a.hp===a.max)return false;const d=this.die(8)+1,healed=Math.min(d,a.max-a.hp);a.hp+=healed;this.s.potions--;this.log(`${a.name} bebe una poción: 1d8+1 = ${d}; recupera ${healed} PG.`);}
 else if(kind==='furia'){if(a.class!=='Guerrero'||a.subclass!=='Berserker'||!this.spendPI(1))return false;a._fury=true;a.ac=Math.max(1,a.ac-2);a.flat=Math.max(1,a.flat-2);this.log(`${a.name} entra en Furia de ceniza: el próximo golpe suma +2 daño y pierde 2 CA.`);}
 else if(kind==='finta'){if(a.class!=='Pícaro'||a.action==='marcar')return false;this.s.shadowFeint=true;this.s.targetId=e.id;this.log(`${a.name} ejecuta una finta de sombra: el próximo ataque puede aplicar furtivo +1d${a.sneakDie||8}.`);}
 else if(kind==='marcar'){if(a.class!=='Pícaro'||a.action!=='marcar')return false;this.s.markedTarget=e.id;this.s.markBonusTarget=e.id;this.s.targetId=e.id;this.log(`${a.name} marca a ${e.name}: el siguiente impacto causa +2 daño.`);}
 else if(kind==='canalizar'){if(a.class!=='Mago'||a.action!=='canalizar'||!this.spendPI(1))return false;this.s.arcaneFocus=true;this.s.channeling=true;this.s.channelingActor=a.id;this.s.spells=(this.s.spells||0)+1;a.ac=Math.max(1,a.ac-2);a.flat=Math.max(1,a.flat-2);this.log(`${a.name} usa ${a.actionLabel||'Canalizar'}: gana un espacio de conjuro, pero queda −2 CA hasta su próximo turno.`);}
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
 check(){if(this.hero.hp<=0){this.s.result='defeat';this.log('Has caído. Puedes volver al punto seguro.');return;}const mechanismWin=this.s.kind==='ash'&&this.s.wheels.length===2;if(this.s.kind==='ash'&&!mechanismWin&&this.enemy.hp<=0){this.enemy.hp=1;if(!this.s.ashResetLogged){this.s.ashResetLogged=true;this.log('El Guardián se aferra al ancla: apaga los dos soportes para vencerlo.');}return;}if(mechanismWin||this.enemy.hp<=0){this.s.result='victory';this.log('Encuentro resuelto.');}}
 end(){if(this.s.result)return;const a=this.actor;if(this.s.channelingActor===a.id){a.ac+=2;a.flat+=2;this.s.channeling=false;this.s.channelingActor=null;}if(!this.s.acted.includes(a.id))this.s.acted.push(a.id);let tries=0;do{this.s.index=(this.s.index+1)%this.s.order.length;if(this.s.index===0)this.s.round++;tries++;}while(this.actor.hp<=0&&tries<4);this.restoreAcDebuffs();if(this.s.shadowFeint&&this.s.round>=this.s.shadowFeintUntil){this.s.shadowFeint=false;this.s.shadowFeintTarget=null;}this.actor.guard=false;this.begin();}
   moveToward(actor,target){if(this.s.noBoard)return;let steps=Math.max(0,actor.move??0),moved=0,range=actor.range??1;while(steps>0&&distance(actor,target)>range){const options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:actor.x+dx,y:actor.y+dy,dx,dy})).filter(p=>inside(p.x,p.y)&&!this.occupied(p.x,p.y)).sort((u,v)=>distance(u,target)-distance(v,target));if(!options.length)break;actor.x=options[0].x;actor.y=options[0].y;steps--;moved++;}if(moved)this.log(actor.name+' avanza '+moved+' casilla'+(moved===1?'':'s')+' para entrar en alcance.');}
  enemyTurn(){if(this.s.result||this.actor.team!=='enemy')return;const e=this.enemy,targets=this.s.units.filter(u=>u.team==='party'&&u.hp>0).sort((a,b)=>distance(e,a)-distance(e,b)),t=targets[0];if(!t){this.check();return;}
  if(this.s.kind==='ash'){
   if(this.s.cancelNext){this.log('Los soportes apagados cancelan el pulso.');this.s.cancelNext=false;this.s.warning=null;}
   else if(this.s.warning?.type==='radius'){const d=this.die(),raw=this.die(4)+this.die(4),ok=d===20||(d!==1&&d+t.ref>=14),damage=ok?(t.class==='Pícaro'&&t.level>=2?0:Math.floor(raw/2)):raw,actual=this.incoming(t,damage);t.hp=Math.max(0,t.hp-actual);this.log(`${t.name}: Reflejos ${d}+${t.ref} CD 14; pulso ${actual} PG.`);this.s.warning=null;}
   else{this.moveToward(e,t);this.hit(e,t);this.s.warning={type:'radius'};this.log('Pulso de ceniza anunciado: el siguiente ataque será un área.');}
  }else if(['custodian','sentinel'].includes(this.s.kind)){
   if(this.s.cancelNext){this.log('El conducto roto cancela el golpe anunciado.');this.s.cancelNext=false;}
   else if(this.s.warning?.type==='pulse'){const d=this.die(),dmg=this.die(4),ok=d===20||(d!==1&&d+t.ref>=12),damage=ok?(t.class==='Pícaro'&&t.level>=2?0:Math.floor(dmg/2)):dmg,actual=this.incoming(t,damage);t.hp=Math.max(0,t.hp-actual);this.log(`${t.name}: Reflejos ${d} ${sign(t.ref)} contra CD 12; descarga ${actual} PG.`);}
   else if(this.s.warning){this.moveToward(e,t);this.hit(e,t);}
   else this.log(this.s.kind==='sentinel'?'El Centinela despierta y prepara un golpe.':'El Custodio arranca y prepara un golpe.');
   this.s.warning=this.s.warning?.type==='strike'?{type:'pulse'}:{type:'strike'};this.log(this.s.warning.type==='pulse'?'Próximo turno: descarga anunciada.':'Próximo turno: golpe anunciado.');
  }else if(this.s.opening){this.s.opening=false;this.log(this.s.kind==='echo'?'El eco reúne ceniza. Tienes tiempo para atacar.':'El eco imita el silbato. Elara reconoce la falsificación.');}
  else {const pending=this.s.warning?.type==='pattern',action=pending?this.s.warning.action:this.enemyPatternTurn(e,t);if(pending&&action){this.s.warning=null;if(action==='guard'){e.guard=true;this.log(`${e.name} adopta guardia y prepara su defensa.`);}else if(action==='heavy'){this.moveToward(e,t);this.hit(e,t,2);this.log(`${e.name} descarga un golpe pesado.`);}else if(action==='curse'){this.moveToward(e,t);this.hit(e,t);t._acDebuff=(t._acDebuff||0)+1;this.log(`${t.name} queda marcado por la maldición.`);}else if(action==='pulse'){this.s.warning={type:'pulse'};this.log('La descarga queda anunciada para el próximo turno.');}else{this.moveToward(e,t);this.hit(e,t);}}}
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
 const api={profile,fresh,migrate,valid,places,Battle,defaults,distance,races:raceData,subclassRules,variants:variantData,systems:Systems,elara:Object.freeze({...elara}),allies:Object.freeze(Object.fromEntries(Object.entries(allyProfiles).map(([id,u])=>[id,Object.freeze({...u})]))),selectedParty};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasRules=api;
})(typeof window!=='undefined'?window:globalThis);
