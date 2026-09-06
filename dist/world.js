/* Navigation in world pixels; the walkable polygon follows the painted road. */
(function(root){
'use strict';
const polygon=[[32,440],[480,460],[560,464],[625,452],[720,452],[800,470],[1180,460],[1320,402],[1390,412],[1440,480],[1500,518],[1500,590],[1280,570],[1140,554],[860,545],[760,540],[620,533],[520,548],[220,525],[32,490]];
const STEP=12, W=128,H=86;
function walkable(x,y){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))inside=!inside}return inside}
const nodes=new Map();for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(walkable(x*STEP,y*STEP))nodes.set(y*W+x,{x:x*STEP,y:y*STEP,id:y*W+x,gx:x,gy:y})}
function nearest(x,y,limit=Infinity){let best=null,d=limit*limit;for(const p of nodes.values()){const q=(p.x-x)**2+(p.y-y)**2;if(q<=d){d=q;best=p}}return best}
function path(from,to){const a=nearest(from.x,from.y),b=nearest(to.x,to.y,80);if(!a||!b)return[];const open=[a.id],cost=new Map([[a.id,0]]),previous=new Map(),closed=new Set();while(open.length){let bi=0,bf=Infinity;for(let i=0;i<open.length;i++){const p=nodes.get(open[i]);const f=cost.get(p.id)+Math.hypot(p.x-b.x,p.y-b.y);if(f<bf){bf=f;bi=i}}const id=open.splice(bi,1)[0],p=nodes.get(id);if(id===b.id){const result=[];let k=id;while(k!==a.id){result.push({x:nodes.get(k).x,y:nodes.get(k).y});k=previous.get(k)}return result.reverse()}closed.add(id);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=p.gx+dx,ny=p.gy+dy,nid=ny*W+nx;if(nx<0||nx>=W||!nodes.has(nid)||closed.has(nid))continue;if(dx&&dy&&(!nodes.has(p.gy*W+nx)||!nodes.has(ny*W+p.gx)))continue;const next=cost.get(id)+STEP*Math.hypot(dx,dy);if(next<(cost.get(nid)??Infinity)){previous.set(nid,id);cost.set(nid,next);if(!open.includes(nid))open.push(nid)}}}return[]}
const api={walkable,nearest,path,polygon,start:{x:300,y:492},guard:{x:1180,y:500},talkSpot:{x:1130,y:516},gate:{x:1356,y:444}};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ValdaraWorld=api;
})(typeof window!=='undefined'?window:globalThis);
