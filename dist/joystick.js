/* Pointer capture keeps touch movement active outside the thumb pad. */
(function(root){
'use strict';
function createJoystick(pad,knob){
 const state={x:0,y:0},deadZone=.14;let pointer=null;
 function reset(){const id=pointer;pointer=null;state.x=state.y=0;knob.style.transform='translate(0px, 0px)';pad.classList.remove('engaged');if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id)}
 function move(e){if(e.pointerId!==pointer)return;e.preventDefault();const r=pad.getBoundingClientRect(),radius=r.width*.32;let x=(e.clientX-r.left-r.width/2)/radius,y=(e.clientY-r.top-r.height/2)/radius;const length=Math.hypot(x,y);if(length>1){x/=length;y/=length}knob.style.transform=`translate(${x*radius}px, ${y*radius}px)`;const force=Math.min(1,length);if(force<deadZone){state.x=state.y=0}else{const amount=(force-deadZone)/(1-deadZone);state.x=x/force*amount;state.y=y/force*amount}}
 pad.addEventListener('pointerdown',e=>{if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;e.preventDefault();pointer=e.pointerId;pad.setPointerCapture(pointer);pad.classList.add('engaged');move(e)});
 pad.addEventListener('pointermove',move);
 for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(e.pointerId===pointer)reset()});
 return{state,reset};
}
if(typeof module!=='undefined'&&module.exports)module.exports=createJoystick;else root.createJoystick=createJoystick;
})(typeof window!=='undefined'?window:globalThis);
