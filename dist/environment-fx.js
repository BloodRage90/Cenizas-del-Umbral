/* Lightweight world atmosphere: procedural light, dust and fireflies. It is
 * intentionally screen-space so it never edits authored backgrounds or NPC
 * sprites, and it updates at a bounded cadence for mid-range phones. */
window.CenizasEnvironmentFX=(()=>{
 'use strict';
 const palettes={
  plaza:{tint:0x183d34,glow:0xf6d18a,particle:0xffe4a3},
  bosque:{tint:0x16372f,glow:0xa8d98f,particle:0xc9ef9d},
  monasterio:{tint:0x25273d,glow:0xf0c879,particle:0xd8c9ff},
  capilla:{tint:0x2b2448,glow:0xf3d590,particle:0xffe9b2},
  umbral:{tint:0x1d2c4c,glow:0x9fbaff,particle:0xc9d8ff},
  default:{tint:0x173329,glow:0xe5c77e,particle:0xcbe8d7}
 };
 const prefersReduced=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function create(scene){
  if(!scene?.add?.graphics)return {update(){},destroy(){}};
  const layer=scene.add.graphics().setScrollFactor(0).setDepth(1900);
  const dots=Array.from({length:14},(_,i)=>({seed:i*17.7,x:(i*.173)%1,y:(i*.317)%1,r:1+(i%3)*.45}));let elapsed=0,lastPlace='';
  function update(place='default',time=0,dt=16){if(prefersReduced()||document.hidden)return;elapsed+=Math.min(100,Math.max(0,dt));if(elapsed<80&&place===lastPlace)return;elapsed=0;lastPlace=place;const p=palettes[place]||palettes.default,w=scene.scale?.width||innerWidth,h=scene.scale?.height||innerHeight,phase=time/1000;layer.clear();
   layer.fillStyle(p.tint,.075);layer.fillRect(0,0,w,h);
   const lights=place==='bosque'?[[.17,.25,130],[.78,.3,95],[.52,.72,80]]:place==='umbral'?[[.5,.35,160],[.28,.78,90],[.74,.78,90]]:[[.16,.17,85],[.84,.2,85],[.5,.9,70]];
   for(const [x,y,r] of lights){const pulse=1+Math.sin(phase*1.6+x*8)*.08;layer.fillStyle(p.glow,.035);layer.fillCircle(w*x,h*y,r*pulse);layer.fillStyle(p.glow,.06);layer.fillCircle(w*x,h*y,r*.32*pulse);}
   for(const d of dots){const x=((d.x+Math.sin(phase*.16+d.seed)*.018+1)%1)*w,y=((d.y+phase*.012*(d.seed%2?1:-1)+1)%1)*h,a=.18+.16*(.5+.5*Math.sin(phase*1.8+d.seed));layer.fillStyle(p.particle,a);layer.fillCircle(x,y,d.r);}
  }
  function destroy(){layer.destroy();}
  return {update,destroy};
 }
 return {create,palettes};
})();
