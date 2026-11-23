/* Side-view actors: the arena replaces the tactical grid without changing the combat state. */
window.CenizasBattleVisuals=(()=>{
 const $=id=>document.getElementById(id),HV=window.CenizasHeroVisuals,previous=new Map();
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const sprites={
  anchor:{file:'scenes/umbral.webp',scale:1.25,frames:Array(4).fill([646,20,891,335,770,332])},
  pylon:{file:'scenes/umbral.webp',scale:1.25,frames:Array(4).fill([204,86,362,407,282,404])},
  construct:{file:'custodian.webp',scale:.72,frames:Array(4).fill([0,0,1280,1280,640,1280])},
  // Elara's own combat poses (idle, wind-up, strike, hurt), restored from history (7b5437e). Same 2x2 format as the hero sheets.
  ally:{file:'elara-combat.webp',grid:[2,2],scale:1,noTraits:true},
  hero:{classFiles:{Guerrero:'identity-warrior-pixel.webp',Pícaro:'identity-rogue-pixel.webp',Mago:'identity-mage-pixel.webp'},grid:[2,2],scale:1},
  enemy:{files:{
   'ash-warden':'enemies/ash-warden.png','rootbound-sentinel':'enemies/rootbound-sentinel.png','bell-moth':'enemies/bell-moth.png','river-wisp':'enemies/river-wisp.png','ember-wolf':'enemies/ember-wolf.png',
   'thorn-goblin':'enemies/thorn-goblin.png','marsh-hag':'enemies/marsh-hag.png','rune-beetle':'enemies/rune-beetle.png','drowned-knight':'enemies/drowned-knight.png','candle-imp':'enemies/candle-imp.png',
   'glass-serpent':'enemies/glass-serpent.png','fungal-brute':'enemies/fungal-brute.png','clockwork-raven':'enemies/clockwork-raven.png','mirror-shade':'enemies/mirror-shade.png','ash-drake':'enemies/ash-drake.png',
   'iron-boar':'enemies/iron-boar.png','willow-spirit':'enemies/willow-spirit.png','redcap-miner':'enemies/redcap-miner.png','frost-revenant':'enemies/frost-revenant.png','umbral-spider':'enemies/umbral-spider.png'
  },grid:[1,1],scale:1},
  echo:{file:'combat-echo.webp',scale:420/619,frames:[[88,16,578,643,330,635],[693,13,1227,643,980,635],[12,666,686,1219,375,1212],[705,646,1240,1241,980,1233]]}
 };
 const images={};
 const enemyDefaults={ash:'ash-warden',custodian:'rootbound-sentinel',sentinel:'rune-beetle',echo:'bell-moth',whisper:'river-wisp'};
 const slug=value=>String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const heroSpec=(actor)=>{
   const profile=HV?.profile?.({class:actor?.dataset.class||document.body.dataset.heroClass,race:actor?.dataset.race||document.body.dataset.heroRace,gender:actor?.dataset.gender||document.body.dataset.heroGender,subclass:actor?.dataset.subclass||document.body.dataset.heroSubclass})||{class:'Guerrero',race:'Humano',gender:'No binario',subclass:'Guardia',file:sprites.hero.classFiles.Guerrero,scale:1,filter:'none',raceFeature:'round',genderFeature:'sash',mark:'shield',accent:'#d9b56c',raceAccent:'#d9b56c',genderAccent:'#b9aaf4'};
   const file=profile.file||sprites.hero.classFiles[profile.class];
   return {...sprites.hero,...profile,file,key:'hero|'+file+'|'+profile.race+'|'+profile.gender+'|'+profile.subclass};
 };
 const specFor=a=>{
   if(a.dataset.kind==='ally')return sprites.ally;
   if(a.dataset.kind==='hero')return heroSpec(a);
   if(a.dataset.kind==='enemy'){
     const file=sprites.enemy.files[a.dataset.variant]||sprites.enemy.files[enemyDefaults[a.dataset.baseKind]||'river-wisp'];
     return {...sprites.enemy,file,key:'enemy|'+file};
   }
   return sprites[a.dataset.kind];
 };
 const imageFor=(kind,spec)=>{
   const key=spec.key||kind+'|'+spec.file;
   let img=images[key];
   if(!img){img=images[key]=new Image();img.src=spec.file;}
   return img;
 };
 function paint(a){
   const kind=a.dataset.kind,spec=specFor(a);if(!spec)return;
   const img=imageFor(kind,spec);if(!img.complete||!img.naturalWidth){img.addEventListener('load',()=>paint(a),{once:true});return;}
   let index=['idle','windup','strike','hurt'].indexOf(a.dataset.pose);if(index<0)index=0;
   const canvas=a.querySelector('canvas'),ctx=canvas.getContext('2d');ctx.clearRect(0,0,1024,768);
    if(spec.grid){
      const cols=spec.grid[0],rows=spec.grid[1],frame=index% (cols*rows);
      ctx.imageSmoothingEnabled=false;
      const scale=Math.max(.78,Math.min(1.12,spec.scale||1)),dw=720*scale,dh=700*scale;
      const rendered=!spec.noTraits&&HV?.render?.(spec,{source:img,frame,size:700,columns:cols,rows});
      if(rendered)ctx.drawImage(rendered,(1024-dw)/2,728-dh,dw,dh);
      else {const sw=img.naturalWidth/cols,sh=img.naturalHeight/rows;ctx.save();ctx.filter=spec.filter||'none';ctx.drawImage(img,(frame%cols)*sw,Math.floor(frame/cols)*sh,sw,sh,(1024-dw)/2,728-dh,dw,dh);ctx.restore();}
      return;
    }
   ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   if(kind==='hero'&&document.body.classList.contains('wearing-vigilia'))index=Math.min(3,index+4);
   const f=spec.frames[index], [x,y,r,b,ax,ay]=f,k=spec.scale;
   ctx.drawImage(img,x,y,r-x,b-y,512+(x-ax)*k,540+(y-ay)*k,(r-x)*k,(b-y)*k);
 }
 function art(id,kind,variant,unit){
   const a=document.createElement('div');a.className='combat-art';
   const ownLook=!!unit?.look||id==='elara';
   a.dataset.kind=ownLook?'ally':unit?.team==='party'||id==='hero'?'hero':kind==='coro'?(id==='enemy'?'anchor':['left','right'].includes(id)?'pylon':'construct'):id==='enemy'?'enemy':kind==='ash'?'echo':['custodian','sentinel'].includes(kind)?'construct':'echo';
   if(unit?.team==='party'&&!ownLook){a.dataset.class=unit.class||'Guerrero';a.dataset.race=unit.race||'Humano';a.dataset.gender=unit.gender||'No binario';a.dataset.subclass=unit.subclass||'Guardia';}
   a.dataset.baseKind=kind;a.dataset.variant=variant||'';
   a.dataset.pose='idle';a.setAttribute('aria-hidden','true');const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=768;a.append(canvas);paint(a);return a;
 }
 function pose(el,name){if(!el)return;el.dataset.pose=name;paint(el);}
 function portraitFor(u){
   if(u.id!=='hero')return null;
   const race=slug(document.body.dataset.heroRace)||'humano',gender=slug(document.body.dataset.heroGender)||'no-binario';
   return 'portraits/'+race+'-'+gender+'.webp';
 }
 function render(s,room){
  const stage=$('battle-stage');if(!stage)return;stage.style.backgroundImage=`linear-gradient(#07141db8,#0c1823d9),url(scenes/${room==='plaza'?'plaza-forest':room}.webp)`;
  let wall=stage.querySelector('.umbral-wall-names');
  if(room==='umbral'){
   if(!wall){wall=document.createElement('div');wall.className='umbral-wall-names';stage.append(wall);}
   const hero=s.units.find(u=>u.id==='hero');
   wall.innerHTML=`<span>LOS NOMBRES QUE QUEDAN</span><b>Darien · Mara · Iven · Nerea · ${hero?.name||'Viajero'}</b><small>${s.names<2?'La piedra aún los reclama':'La piedra ya no puede borrarlos'}</small>`;
  }else wall?.remove();
  let layer=stage.querySelector('.battle-actors');if(!layer){layer=document.createElement('div');layer.className='battle-actors';stage.append(layer);}
  const ids=new Set(s.units.map(u=>u.id));layer.querySelectorAll('.battle-actor').forEach(n=>{if(!ids.has(n.dataset.unit))n.remove();});
  const party=s.units.filter(u=>u.team==='party'),foes=s.units.filter(u=>u.team!=='party');
  const partyStep=party.length>1?26/(party.length-1):0,foeStep=foes.length>1?26/(foes.length-1):0;
  for(const u of s.units){
   let n=layer.querySelector(`[data-unit="${u.id}"]`);
   if(!n){n=document.createElement('div');n.className='battle-actor';n.dataset.unit=u.id;n.tabIndex=0;
     n.append(art(u.id,s.kind,s.encounter?.variant||s.variant,u));const badge=portraitFor(u);if(badge){const portrait=document.createElement('img');portrait.className='actor-portrait';portrait.src=badge;portrait.alt='Retrato de '+(document.body.dataset.heroRace||'Humano')+' '+(document.body.dataset.heroGender||'No binario');portrait.loading='eager';portrait.decoding='async';portrait.onerror=()=>portrait.remove();n.append(portrait);}
     const label=document.createElement('span');label.className='actor-name';n.append(label);const hp=document.createElement('div');hp.className='actor-health';hp.innerHTML='<span></span>';n.append(hp);layer.append(n);}
   const old=previous.get(u.id),list=u.team==='party'?party:foes,i=list.indexOf(u),left=u.team==='party'?16+i*partyStep:84-i*foeStep,top=u.team==='party'?68+i*3:66+i*4;
   const combatArt=n.querySelector('.combat-art');if(combatArt){combatArt.dataset.baseKind=s.kind;combatArt.dataset.variant=s.encounter?.variant||s.variant||'';paint(combatArt);}
   n.style.left=left+'%';n.style.top=top+'%';n.style.setProperty('--depth',(1-i*.035).toFixed(2));n.style.zIndex=10-i;n.classList.toggle('active',u.id===s.order[s.index]);n.classList.toggle('enemy-unit',u.team!=='party');n.classList.toggle('party-unit',u.team==='party');n.classList.toggle('selected-target',u.id===s.targetId);n.classList.toggle('fixed-object',['left','right','enemy'].includes(u.id)&&s.kind==='coro');n.classList.toggle('down',u.hp<=0);let telegraph=n.querySelector('.enemy-telegraph');if(!telegraph){telegraph=document.createElement('span');telegraph.className='enemy-telegraph';telegraph.setAttribute('role','status');telegraph.setAttribute('aria-live','polite');n.append(telegraph);}const telegraphOn=u.team!=='party'&&u.hp>0&&(u.warning||(u.id==='enemy'&&s.warning));telegraph.hidden=!telegraphOn;telegraph.textContent=telegraphOn?(u.warning?.type==='pulse'||s.warning?.type==='pulse'?'DESCARGA ANUNCIADA':'ATAQUE ANUNCIADO'):'';
   n.querySelector('.actor-name').textContent=u.name;n.querySelector('.actor-health span').style.width=Math.max(0,u.hp)/u.max*100+'%';n.setAttribute('role','button');n.setAttribute('aria-label',`${u.name}: ${u.hp} de ${u.max} PG${u.id===s.targetId?' · objetivo seleccionado':''}`);n.title=`${u.name} · ${u.hp}/${u.max} PG`;
   if(old&&(old.x!==u.x||old.y!==u.y)){n.classList.add('moving');clearTimeout(n.motionTimer);n.motionTimer=setTimeout(()=>n.classList.remove('moving'),440);}
   if(old&&old.hp!==u.hp){const delta=u.hp-old.hp,float=document.createElement('b');float.className='damage-float'+(delta>0?' healing':'');float.textContent=(delta>0?'+':'')+delta;n.append(float);setTimeout(()=>float.remove(),1500);if(delta<0){pose(n.querySelector('.combat-art'),'hurt');setTimeout(()=>pose(n.querySelector('.combat-art'),'idle'),500);}}
   previous.set(u.id,{x:u.x,y:u.y,hp:u.hp});
  }
  $('party-status').replaceChildren(...party.map(u=>{const el=document.createElement('span');el.className='party-chip'+(u.id===s.order[s.index]?' current':'');el.textContent=`${u.name} ${u.hp}/${u.max}`;return el;}));
  const turnOrder=$('turn-order');if(turnOrder)turnOrder.replaceChildren(...s.order.map(id=>{const u=s.units.find(unit=>unit.id===id);if(!u)return null;const chip=document.createElement('span');chip.className='turn-chip'+(id===s.order[s.index]?' current':'')+(u.hp<=0?' down':'');chip.setAttribute('role','listitem');chip.setAttribute('aria-current',id===s.order[s.index]?'step':'false');chip.textContent=u.name;return chip;}).filter(Boolean));
 }
 function reset(){previous.clear();}
 async function sequence(stage,attacker,target,{magic=false,impact}={}){
  if(!stage||!attacker||!target)return impact?.()||{};const a=attacker.querySelector('.combat-art'),t=target.querySelector('.combat-art'),pause=ms=>new Promise(r=>setTimeout(r,ms)),short=reduced(),windup=short?1:140,travelDuration=short?1:120,freeze=short?1:60,recovery=short?1:220;
  pose(a,'windup');const distance=(target.getBoundingClientRect().left-attacker.getBoundingClientRect().left)*.6;
  const approach=!magic?attacker.animate([{transform:'translate(-50%,-100%) translateX(0)'},{transform:`translate(-50%,-100%) translateX(${Math.min(8,distance*.08)}px)`}],{duration:windup,easing:'ease-out',fill:'forwards'}):null;await pause(windup);
  if(magic){const orb=document.createElement('div');orb.className='spell-orb';stage.append(orb);orb.animate([{left:'25%',opacity:0,scale:.2},{left:'76%',opacity:1,scale:1}],{duration:travelDuration,fill:'forwards',easing:'ease-in'});setTimeout(()=>orb.remove(),travelDuration+120);}else attacker.animate([{transform:`translate(-50%,-100%) translateX(${Math.min(8,distance*.08)}px)`},{transform:`translate(-50%,-100%) translateX(${distance*.6}px)`}],{duration:travelDuration,easing:'cubic-bezier(.2,.7,.3,1)',fill:'forwards'});await pause(travelDuration);pose(a,'strike');await pause(freeze);
  const result=impact?.()||{},damage=Object.values(result.changes||{}).filter(x=>x<0).reduce((n,x)=>n-x,0),cue=/crítico/i.test(result.summary||'')?'critical':damage?'hit':/fallo|no supera/i.test(result.summary||'')?'miss':'hit';window.CenizasSfx?.play(cue);const splash=document.createElement('div');splash.className='impact-glow'+(magic?' arcane':'');splash.style.left=target.classList.contains('party-unit')?'24%':'76%';stage.append(splash);setTimeout(()=>splash.remove(),80);
  if(damage){pose(t,'hurt');target.animate([{transform:'translate(-50%,-100%)'},{transform:'translate(calc(-50% + 9px),-100%)',filter:'brightness(2)'},{transform:'translate(-50%,-100%)',filter:'brightness(1)'}],{duration:80,fill:'forwards'});}const text=document.createElement('b');text.className='cinema-damage';text.textContent=damage?'−'+damage:'Sin daño';target.append(text);setTimeout(()=>text.remove(),recovery+500);if(!short&&stage.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)stage.animate([{transform:'translate(0)'},{transform:'translate(3px, -2px)'},{transform:'translate(-2px, 2px)'},{transform:'translate(0)'}],{duration:100,fill:'forwards'});await pause(recovery);pose(a,'idle');pose(t,'idle');if(approach)approach.cancel();attacker.animate([{transform:`translate(-50%,-100%) translateX(${distance*.6}px)`},{transform:'translate(-50%,-100%)'}],{duration:120,easing:'ease-in-out',fill:'forwards'});return result;
 }
 return {art,pose,render,reset,sequence};
})();
