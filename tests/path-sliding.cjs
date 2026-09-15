const assert=require('node:assert/strict'),Nav=require('../dist/navigation.js');
// Press right against a diagonal bank: continue along it instead of sticking.
const path=(x,y)=>y>x&&y<x+30;
let p={x:20,y:21};
for(let i=0;i<80;i++){const next=Nav.slide(path,p,4,0);assert(path(next.x,next.y));assert(Math.hypot(next.x-p.x,next.y-p.y)<=4.001);p=next;}
assert(p.x>120,'continuous movement follows diagonal bank');
// A long frame must not tunnel through a narrow wall to a valid end point.
const wall=x=>x<10||x>12;
p=Nav.slide(wall,{x:8,y:0},20,0);assert(p.x<10,'whole segment is checked');
// A blocked direction must not push the player backwards.
p=Nav.slide(x=>x<=0,{x:0,y:0},4,0);assert.equal(p.x,0);
console.log('PASS: diagonal bank movement, speed limit, no wall tunnelling or reverse motion.');
