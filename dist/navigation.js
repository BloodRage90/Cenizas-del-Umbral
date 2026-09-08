(function(root){
'use strict';
function inPolygon(x,y,poly){let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
function walkable(room,x,y){return (room.polys||[room.poly]).some(poly=>inPolygon(x,y,poly))&&!(room.obstacles||[]).some(o=>((x-o.x)/o.rx)**2+((y-o.y)/o.ry)**2<=1);}
function clear(room,a,b){const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/6));for(let i=0;i<=steps;i++){const f=i/steps;if(!walkable(room,a.x+(b.x-a.x)*f,a.y+(b.y-a.y)*f))return false;}return true;}
function safe(room,p){if(p&&walkable(room,p.x,p.y))return p;if(p)for(let r=8;r<=240;r+=8)for(let a=0;a<Math.PI*2;a+=Math.PI/24){const q={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};if(walkable(room,q.x,q.y))return q;}return {x:room.start[0],y:room.start[1]};}
const api={walkable,clear,safe};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasNavigation=api;
})(typeof window!=='undefined'?window:globalThis);
