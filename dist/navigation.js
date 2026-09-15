(function(root){
'use strict';
function inPolygon(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function walkable(room,x,y){return (room.polys||[room.poly]).some(poly=>inPolygon(x,y,poly))&&!(room.obstacles||[]).some(o=>((x-o.x)/o.rx)**2+((y-o.y)/o.ry)**2<=1);}
function clear(room,a,b){const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/6));for(let i=0;i<=steps;i++){const f=i/steps;if(!walkable(room,a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))return false;}return true;}
function safe(room,p){if(p&&walkable(room,p.x,p.y))return p;if(p)for(let r=8;r<=240;r+=8)for(let a=0;a<Math.PI*2;a+=Math.PI/24){const q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(walkable(room,q.x,q.y))return q;}return {x:room.start[0],y:room.start[1]};}
// Follow the nearest traversable tangent instead of stopping at a diagonal edge.
function slide(canWalk,p,dx,dy){
 const length=Math.hypot(dx,dy);if(length<.001)return {x:p.x,y:p.y};
 const clearTo=q=>{const steps=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/2));for(let i=1;i<=steps;i++)if(!canWalk(p.x+(q.x-p.x)*i/steps,p.y+(q.y-p.y)*i/steps))return false;return true;};
 const direct={x:p.x+dx,y:p.y+dy};if(clearTo(direct))return direct;
 let best={x:p.x,y:p.y},score=0;
 for(const fraction of [1,.5,.25])for(const angle of [0,15,-15,30,-30,45,-45,60,-60,75,-75,85,-85]){const r=angle*Math.PI/180,c=Math.cos(r),s=Math.sin(r),qx=(dx*c-dy*s)*fraction,qy=(dx*s+dy*c)*fraction,q={x:p.x+qx,y:p.y+qy},value=(qx*dx+qy*dy)/length;if(value>score&&clearTo(q)){score=value;best=q;}}
 return best;
}
function move(room,p,dx,dy,blocked=()=>false){return slide((x,y)=>walkable(room,x,y)&&!blocked(x,y),p,dx,dy);}
const api={walkable,clear,safe,slide,move};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasNavigation=api;
})(typeof window!=='undefined'?window:globalThis);
