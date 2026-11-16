'use strict';
window.RegionMap=(()=>{
 const view=document.getElementById('map-viewport'),canvas=document.getElementById('region-canvas');let scale=1,base=780;
 function center(){view.scrollTo({left:canvas.offsetWidth*.47-view.clientWidth/2,top:canvas.offsetHeight*.55-view.clientHeight/2,behavior:'instant'})}
 function layout(next=scale,atPlayer=false){const x=(view.scrollLeft+view.clientWidth/2)/(canvas.offsetWidth||780),y=(view.scrollTop+view.clientHeight/2)/(canvas.offsetHeight||520);scale=Math.max(1,Math.min(2,next));base=Math.max(780,view.clientWidth);canvas.style.width=Math.round(base*scale)+'px';document.getElementById('map-zoom').textContent=Math.round(scale*100)+'%';document.getElementById('map-out').disabled=scale<=1;document.getElementById('map-in').disabled=scale>=2;if(atPlayer)center();else view.scrollTo({left:x*canvas.offsetWidth-view.clientWidth/2,top:y*canvas.offsetHeight-view.clientHeight/2,behavior:'instant'})}
 document.getElementById('map-in').onclick=()=>layout(scale+.25);document.getElementById('map-out').onclick=()=>layout(scale-.25);document.getElementById('map-center').onclick=center;
 window.addEventListener('resize',()=>{if(document.getElementById('region-modal').open)layout(scale,true)});
 return{open(){layout(1,true)}};
})();
