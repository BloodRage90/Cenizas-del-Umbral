const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),Nav=require('../dist/navigation.js');
const source=fs.readFileSync('dist/chapter.js','utf8'),rooms=vm.runInNewContext('('+source.split('const rooms=')[1].split('\n};')[0]+'\n})'),r=rooms.bosque;
for(const [x,y] of [[900,800],[1030,535],[780,500],[400,850],[1280,550]])assert(!Nav.walkable(r,x,y),`Water or rocks blocked: ${x},${y}`);
const queue=[{x:r.start[0],y:r.start[1]}],seen=new Set([r.start.join(',')]);for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy] of [[5,0],[-5,0],[0,5],[0,-5]]){const q={x:p.x+dx,y:p.y+dy},key=q.x+','+q.y;if(!seen.has(key)&&Nav.clear(r,p,q)){seen.add(key);queue.push(q);}}}
for(const [id,,x,y] of r.spots){assert(Nav.walkable(r,x,y),id+' on path');assert(queue.some(p=>Math.hypot(p.x-x,p.y-y)<60&&Nav.clear(r,p,{x,y})),id+' reachable');}
assert(!Nav.clear(r,{x:650,y:630},{x:1200,y:750}),'Cannot cross river diagonally');
assert(Nav.walkable(r,...Object.values(Nav.safe(r,{x:950,y:820}))))
console.log('PASS: forest river/rocks blocked, connected bridge route, all interactions reachable and invalid save repaired.');
