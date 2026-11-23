(function(root){
class Follower{
 constructor(x,y){this.points=[{x,y}];this.x=x;this.y=y;this.length=0;}
 record(x,y){const p=this.points.at(-1),d=Math.hypot(x-p.x,y-p.y);if(d<.01)return;this.points.push({x,y});this.length+=d;}
 update(dt,gap=48){let budget=Math.min(Math.max(0,this.length-gap),185*Math.min(dt,50)/1000),travel=0;
 while(budget>.001&&this.points.length>1){const a=this.points[0],b=this.points[1],d=Math.hypot(b.x-a.x,b.y-a.y),step=Math.min(budget,d);if(d<.001){this.points.shift();continue;}a.x+=(b.x-a.x)/d*step;a.y+=(b.y-a.y)/d*step;budget-=step;travel+=step;this.length-=step;if(step>=d-.001)this.points.shift();}
 this.x=this.points[0].x;this.y=this.points[0].y;return travel;
 }
}
// A full walk cycle spans 112 world pixels. Advance by actual movement,
// with a cadence ceiling so catch-up motion never turns into frantic footsteps.
function frame(sprite,dx,dy,dt=1000/60){
 const distance=Math.hypot(dx,dy),elapsed=Math.max(0,Math.min(dt,50));
 if(sprite.anims?.isPlaying)sprite.anims.stop();
 let direction=sprite.walkDirection??2;
 if(distance>.005){
  sprite.walkIdle=0;
  const horizontal=direction===1||direction===2,ax=Math.abs(dx),ay=Math.abs(dy);
  const useHorizontal=horizontal?ax*1.3>=ay:ax>ay*1.3;
  direction=useHorizontal?(dx>=0?2:1):(dy>=0?0:3);
  sprite.walkDirection=direction;
  sprite.walkPhase=((sprite.walkPhase??1)+Math.min(distance/28,elapsed/140))%4;
 }else{
  sprite.walkIdle=(sprite.walkIdle||0)+elapsed;
  if(sprite.walkIdle>=80)sprite.walkPhase=1;
 }
 const columns=sprite.walkColumns||4,rows=sprite.walkRows||4;
 // Pose sheets (2x2: idle, wind-up, slash, recover) are right-facing combat art,
 // not walk cycles. Never play the attack poses while walking: rest on frame 0,
 // step between the two neutral poses (0 and 3) and mirror for leftward travel.
 if(columns*rows<=4){
  if(distance>.005&&Math.abs(dx)>.005)sprite.facingLeft=dx<0;
  if(typeof sprite.setFlipX==='function'&&sprite.flipX!==!!sprite.facingLeft)sprite.setFlipX(!!sprite.facingLeft);
  const walking=(sprite.walkIdle||0)<80,poseIndex=walking?[0,3][Math.floor(sprite.walkPhase??1)%2]:0;
  if(sprite.walkFrame!==poseIndex){sprite.setFrame(poseIndex);sprite.walkFrame=poseIndex;}
  return;
 }
 const frameDirection=direction%rows,phase=Math.floor(sprite.walkPhase??1)%columns;
 const index=frameDirection*columns+phase;
 if(sprite.walkFrame!==index){sprite.setFrame(index);sprite.walkFrame=index;}
}

const api={Follower,frame};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasLocomotion=api;
})(typeof window!=='undefined'?window:globalThis);
