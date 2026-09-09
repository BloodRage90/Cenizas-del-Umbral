(function(root){
class Follower{
 constructor(x,y){this.points=[{x,y}];this.x=x;this.y=y;this.length=0;}
 record(x,y){const p=this.points.at(-1),d=Math.hypot(x-p.x,y-p.y);if(d<.01)return;this.points.push({x,y});this.length+=d;}
 update(dt,gap=48){let budget=Math.min(Math.max(0,this.length-gap),185*Math.min(dt,50)/1000),travel=0;
 while(budget>.001&&this.points.length>1){const a=this.points[0],b=this.points[1],d=Math.hypot(b.x-a.x,b.y-a.y),step=Math.min(budget,d);if(d<.001){this.points.shift();continue;}a.x+=(b.x-a.x)/d*step;a.y+=(b.y-a.y)/d*step;budget-=step;travel+=step;this.length-=step;if(step>=d-.001)this.points.shift();}
 this.x=this.points[0].x;this.y=this.points[0].y;return travel;
 }
}
function frame(sprite,dx,dy){const distance=Math.hypot(dx,dy);sprite.anims?.stop();if(distance>.005){sprite.walkDirection=Math.abs(dx)>Math.abs(dy)?(dx>0?2:1):(dy>0?0:3);sprite.walkDistance=(sprite.walkDistance||0)+distance;sprite.setFrame((sprite.walkDirection||0)*4+Math.floor(sprite.walkDistance/9)%4);}else sprite.setFrame((sprite.walkDirection??2)*4+1);}
const api={Follower,frame};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CenizasLocomotion=api;
})(typeof window!=='undefined'?window:globalThis);
