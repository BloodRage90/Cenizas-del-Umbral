/* Persistent NPC identities: protagonist textures are never a fallback. */
window.CenizasNPCs=(()=>{
 const rows={darien:0,darienChapel:0,attendant:1,patientA:2,patientB:3,patientC:4,courier:5,apprentice:6,pilgrim:7};
 const clergy={nurse:0,sereth:1,serethChapel:1,serethFinal:1,mara:2,novice:3};
 function register(scene){const t=scene.textures.get('npc-citizens');const ys=[[13,190],[198,378],[388,559],[567,749],[757,947],[952,1128],[1136,1322],[1328,1519]],xs=[204,359,514,669];for(let row=0;row<8;row++)for(let col=0;col<4;col++)t.add(row*4+col,0,xs[col],ys[row][0],140,ys[row][1]-ys[row][0]);const c=scene.textures.get('npc-clergy'),cy=[[8,370],[387,757],[770,1141],[1154,1525]];for(let row=0;row<4;row++)for(let col=0;col<4;col++)c.add(row*4+col,0,32+col*256,cy[row][0],224,cy[row][1]-cy[row][0]);}

 function create(scene,id,x,y,legacy){
  let n;
  if(Object.hasOwn(rows,id)||Object.hasOwn(clergy,id)){const row=Object.hasOwn(rows,id)?rows[id]:clergy[id];n=scene.add.sprite(x,y,Object.hasOwn(rows,id)?'npc-citizens':'npc-clergy',row*4).setOrigin(.5,1);n.setScale((id==='courier'?82:90)/n.height);n.npcRow=row;}
  else {const frame=id==='ordanRescue'||id==='ordanChapel'?1:legacy;
   if(frame==='elara')n=scene.add.sprite(x,y,'elara').setOrigin(.5,.94).setDisplaySize(110,110);
   else if(Number.isInteger(frame))n=scene.add.sprite(x,y,'residents',frame).setOrigin(.5,.94).setDisplaySize(110,110);
   else throw new Error('Falta diseño del NPC: '+id);
  }
  n.npcId=id;n.baseScaleX=n.scaleX;n.baseScaleY=n.scaleY;n.setDepth(y);return n;
 }
 function step(n,dx,dy,dt=16){const d=Math.hypot(dx,dy);if(n.npcRow===undefined)return;n.npcDistance=(n.npcDistance||0)+d;if(d>.001){n.setFlipX(dx<-.01);n.setFrame(n.npcRow*4+Math.floor(n.npcDistance/18)%4);}else n.setFrame(n.npcRow*4);}
 return {register,create,step,rows};
})();
