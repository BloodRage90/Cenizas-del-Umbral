(function(root){
class Follower{
 constructor(x,y){this.points=[{x,y}];this.x=x;this.y=y;this.length=0;}
 record(x,y){const p=this.points.at(-1),d=Math.hypot(x-p.x,y-p.y);if(d<.01)return;this.points.push({x,y});this.length+=d;}
 update(dt,gap=48){let budget=Math.min(Math.max(0,this.length-gap),185*Math.min(dt,50)/1000),travel=0;
 while(budget>.001&&this.points.length>1){const a=this.points[0],b=this.points[1],d=Math.hypot(b.x-a.x,b.y-a.y),step=Math.min(budget,d);if(d<.001){this.points.shift();continue;}a.x+=(b.x-a.x)/d*step;a.y+=(b.y-a.y)/d*step;budget-=step;travel+=step;this.length-=step;if(step>=d-.001)this.points.shift();}
 this.x=this.points[0].x;this.y=this.points[0].y;return travel;
 }
}
// Keep keyboard, joystick and scripted movement on the same unit-speed vector.
// Values below a unit vector keep their analog magnitude; only diagonals (or
// other overlong vectors) are reduced to the requested cardinal speed.
function normalize(dx,dy){const length=Math.hypot(dx,dy);return length>1?{x:dx/length,y:dy/length}:{x:dx,y:dy};}

// Phaser reports frame deltas in milliseconds. Keep one bounded conversion in
// this module so a slow/backgrounded frame can never turn into a teleport or a
// burst of walk animation when the scene resumes.
function clampDelta(dt,max=32){const value=Number(dt);return Number.isFinite(value)?Math.min(Math.max(value,0),max):1000/60;}
function stepDistance(speed,dt,max=32){return Math.max(0,Number(speed)||0)*clampDelta(dt,max)/1000;}

// Phaser may report a large loop delta after a tab was backgrounded. The
// guard drops that delta and skips exactly the first frame after resuming so
// movement, pose changes and footstep cadence cannot burst on recovery.
class VisibilityGuard{
 constructor(){this.active=true;this.resumePending=false;}
 resetLoop(scene){const loop=scene?.game?.loop;if(!loop)return;loop.delta=0;loop.elapsed=0;}
 pause(scene){this.active=false;this.resumePending=false;this.resetLoop(scene);}
 resume(scene){this.active=true;this.resumePending=true;this.resetLoop(scene);}
 canUpdate(scene){if(!this.active){this.resetLoop(scene);return false;}if(this.resumePending){this.resumePending=false;this.resetLoop(scene);return false;}return true;}
}
// A full walk cycle spans 112 world pixels. Advance by actual movement,
// with a cadence ceiling so catch-up motion never turns into frantic footsteps.
function frame(sprite,dx,dy,dt=1000/60){
 const distance=Math.hypot(dx,dy),elapsed=clampDelta(dt,50);
 if(sprite.anims?.isPlaying)sprite.anims.stop();
 const stride=sprite.walkStride||26;
 if(sprite.walkDistance===undefined)sprite.walkDistance=0;
 let direction=sprite.walkDirection??2;
 if(distance>.005){
  sprite.walkIdle=0;
  const horizontal=direction===1||direction===2,ax=Math.abs(dx),ay=Math.abs(dy);
  const useHorizontal=horizontal?ax*1.3>=ay:ax>ay*1.3;
  direction=useHorizontal?(dx>=0?2:1):(dy>=0?0:3);
  sprite.walkDirection=direction;
  sprite.walkDistance+=distance;
  sprite.walkPhase=(sprite.walkDistance/stride)%4;
 }else{
  sprite.walkIdle=(sprite.walkIdle||0)+elapsed;
  if(sprite.walkIdle>=80)sprite.walkPhase=0;
 }
 const columns=sprite.walkColumns||4,rows=sprite.walkRows||4;
 // Pose sheets (2x2) are combat art rather than a dedicated walk cycle. Frame 0
 // is the neutral stance and frame 3 is the recovery/settled stance on every
 // supplied hero sheet; alternating only those two poses gives the feet a
 // readable step without ever showing a wind-up or slash frame in exploration.
 if(columns*rows<=4){
  if(distance>.005&&Math.abs(dx)>.005)sprite.facingLeft=dx<0;
  if(typeof sprite.setFlipX==='function'&&sprite.flipX!==!!sprite.facingLeft)sprite.setFlipX(!!sprite.facingLeft);
  const walking=(sprite.walkIdle||0)<80,stepIndex=Math.floor(sprite.walkDistance/stride),poseIndex=walking?(stepIndex%2?Math.min(3,columns*rows-1):0):0;
  const side=stepIndex%2?.1:-.1;
  if(typeof sprite.setScale==='function'){
   sprite.walkBaseScaleX??=sprite.scaleX??1;sprite.walkBaseScaleY??=sprite.scaleY??1;
   const bob=walking?side*.045:0;
   const squash=walking?side*.018:0;
   sprite.setScale(sprite.walkBaseScaleX*(1+squash),sprite.walkBaseScaleY*(1-bob*.35));
  }
  if(typeof sprite.setRotation==='function'){
   const lean=walking?side*.045:0;
   sprite.setRotation(walking?(sprite.facingLeft?-lean:lean):0);
  }
  if(sprite.walkFrame!==poseIndex){sprite.setFrame(poseIndex);sprite.walkFrame=poseIndex;return true;}
  return false;
 }
 const frameDirection=direction%rows;
 if(sprite.walkSynthetic){
  if(distance>.005&&Math.abs(dx)>.005)sprite.facingLeft=dx<0;
  if(typeof sprite.setFlipX==='function'&&sprite.flipX!==!!sprite.facingLeft)sprite.setFlipX(!!sprite.facingLeft);
  const walking=(sprite.walkIdle||0)<80,stepIndex=Math.floor(sprite.walkDistance/stride),phase=walking?stepIndex%columns:0,index=frameDirection*columns+phase,side=stepIndex%2?.1:-.1;
  if(typeof sprite.setScale==='function'){
   sprite.walkBaseScaleX??=sprite.scaleX??1;sprite.walkBaseScaleY??=sprite.scaleY??1;
   const bob=walking?side*.045:0,squash=walking?side*.018:0;
   sprite.setScale(sprite.walkBaseScaleX*(1+squash),sprite.walkBaseScaleY*(1-bob*.35));
  }
  if(typeof sprite.setRotation==='function')sprite.setRotation(walking?(sprite.facingLeft?-side*.045:side*.045):0);
  if(sprite.walkFrame!==index){sprite.setFrame(index);sprite.walkFrame=index;return true;}
  return false;
 }
 // A stopped character breathes in place with two adjacent idle poses. The
 // source atlas keeps those poses on the same direction row, so no attack or
 // wind-up frame can leak into exploration. While moving, use the full six
 // frame cadence generated by hero-visuals.js.
 const idlePhase=(sprite.walkIdle||0)>140?Math.floor((sprite.walkIdle||0)/700)%2:0;
 const phase=distance>.005?Math.floor(sprite.walkDistance/stride)%columns:idlePhase;
 const index=frameDirection*columns+phase;
 if(sprite.walkFrame!==index){sprite.setFrame(index);sprite.walkFrame=index;return true;}
 return false;
}

const api={Follower,VisibilityGuard,normalize,clampDelta,stepDistance,frame};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasLocomotion=api;
})(typeof window!=='undefined'?window:globalThis);
