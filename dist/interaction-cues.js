/* Gentle environmental indicators; never affect movement or interaction range. */
window.CenizasInteractionCues={create(scene){
 const ink=scene.add.graphics().setDepth(1900),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 return {destroy(){ink.destroy();},hide(){ink.clear();},draw(time,points){ink.clear();for(const p of points){
 const seed=String(p.id).split('').reduce((n,c)=>n+c.charCodeAt(0)*97,0),phase=((time+seed)%5600)/750;
 if(!reduced&&phase>=1)continue;
 const alpha=reduced?.22:Math.sin(phase*Math.PI)*.5,y=p.y-(reduced?0:phase*5),size=reduced?2:2+Math.sin(phase*Math.PI)*2;
 ink.lineStyle(1,0xffedbc,alpha);ink.lineBetween(p.x-size,y,p.x+size,y);ink.lineBetween(p.x,y-size,p.x,y+size);ink.fillStyle(0xfff7da,alpha*.8);ink.fillCircle(p.x,y,1.1);
 }}};
}};
