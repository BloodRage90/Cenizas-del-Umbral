/* Side-view attack director: turns stay explicit, but timing bars do not. */
window.CenizasBattleScene=(()=>{
 const $=id=>document.getElementById(id),Visuals=window.CenizasBattleVisuals;let busy=false;
 function show({attacker='hero',target='enemy',action='attack',resolve}){
  if(busy)return Promise.resolve(null);busy=true;
  const stage=$('battle-stage');
  const find=id=>stage?.querySelector(`[data-unit="${id}"]`);
  const from=find(attacker)||stage?.querySelector('.party-unit,.enemy-unit');
  const to=find(target)||stage?.querySelector('.enemy-unit,.party-unit');
  stage?.classList.add('attack-cue');
  return Visuals.sequence(stage,from,to,{magic:action==='missile',impact:()=>resolve?.({})||{}})
   .finally(()=>{stage?.classList.remove('attack-cue');busy=false;});
 }
 return {show};
})();
