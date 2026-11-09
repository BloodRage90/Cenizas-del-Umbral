// Seven independent melodies, bridges and drum/riff patterns, in scale degrees.
// Eight eighth-notes per bar; null is a deliberate rest. No transcribed game music.
const minor=[0,2,3,5,7,8,10],dorian=[0,2,3,5,7,9,10],harmonic=[0,2,3,5,7,8,11];
const phrase=rows=>rows.map(row=>row.map(n=>[n,.5]));
function score(id,title,bpm,key,mode,melody,bridge,chords,kicks,riff,lead='guitar'){
 return [id,title,bpm,key,mode,id,lead,4,chords,{melody:phrase(melody),bridge:phrase(bridge),kicks,riff}];
}
module.exports=[
score('battle','Acero y voluntad',156,50,dorian,
 [[0,null,4,3,2,null,0,2],[4,5,4,null,2,1,0,null],[2,4,7,6,5,4,2,null],[3,2,1,0,-1,null,1,2]],
 [[7,7,null,6,4,null,5,6],[5,null,4,2,3,4,null,2],[4,6,7,null,9,7,6,4],[3,null,2,1,0,null,-1,null]],
 [0,0,5,3,0,6,3,4],[0,.75,2,2.5,3.75],[0,.5,1.5,2,2.5,3.5]),
score('forest-battle','Raíces en fuga',168,57,dorian,
 [[4,2,0,null,2,4,6,null],[7,6,4,2,3,null,1,null],[0,2,4,null,6,7,9,7],[6,4,3,2,1,null,-1,0]],
 [[2,null,5,4,2,null,1,0],[3,5,7,5,4,null,3,null],[6,null,7,9,7,6,4,2],[1,3,2,0,-1,null,0,null]],
 [0,3,6,4,0,2,5,4],[0,1.5,2.25,3],[0,.75,1.5,2,2.75,3.5],'fm'),
score('vigilia-battle','La marcha de las firmas',132,48,minor,
 [[0,0,null,3,2,0,null,4],[3,3,null,5,4,2,1,null],[5,4,3,null,2,3,4,null],[1,1,2,1,-1,null,0,null]],
 [[4,null,4,5,7,null,6,5],[3,null,3,4,6,5,4,null],[2,3,5,7,6,null,5,3],[2,null,1,0,-1,null,1,null]],
 [0,0,3,3,5,6,4,4],[0,2,2.75],[0,.5,1,2,2.5,3]),
score('custodian','Piedra contra el río',128,45,harmonic,
 [[0,null,0,-1,0,null,4,null],[1,0,-1,null,3,2,1,null],[4,null,5,4,3,null,1,0],[-1,0,1,null,4,3,1,null]],
 [[7,null,6,5,4,null,3,4],[5,4,3,2,1,null,0,null],[3,4,5,null,6,5,4,3],[2,null,1,-1,0,null,0,null]],
 [0,1,0,4,5,3,1,4],[0,.5,1.75,2.5,3],[0,.25,1.5,2.25,3,3.5]),
score('ash','Ceniza bajo el martillo',148,52,minor,
 [[0,4,0,5,0,4,3,2],[3,null,5,3,2,null,1,0],[4,7,4,6,4,5,4,2],[3,2,0,null,-1,1,2,null]],
 [[7,6,5,4,5,7,9,null],[8,7,5,null,6,5,3,null],[4,5,7,6,4,3,2,null],[1,2,3,1,-1,null,0,null]],
 [0,5,0,6,3,5,1,4],[0,.75,1.5,2,3.25],[0,.5,1,1.75,2.5,3.25]),
score('finale','Romper el Coro',160,50,harmonic,
 [[0,7,6,null,4,5,4,2],[3,4,6,7,6,null,5,3],[4,2,0,-1,0,2,4,6],[7,null,6,4,3,2,1,-1]],
 [[7,null,9,8,7,null,6,4],[5,7,9,7,6,5,4,null],[3,5,7,6,5,4,2,0],[1,3,2,1,-1,null,0,null]],
 [0,6,5,4,3,1,5,4],[0,.5,1.25,2,2.75,3.5],[0,.25,.75,1.5,2,2.75,3.5],'fm'),
score('training-battle','Dos pulsos, un paso',140,55,dorian,
 [[0,2,4,null,2,0,1,null],[3,2,0,null,4,5,4,null],[2,4,6,7,6,4,2,null],[1,2,3,2,0,null,-1,null]],
 [[4,null,7,6,4,2,3,null],[5,4,2,0,2,3,4,null],[6,7,9,7,6,4,5,6],[4,3,2,1,0,null,0,null]],
 [0,3,5,4,0,6,2,4],[0,1.75,2.5],[0,.5,1.5,2,3,3.5])
];
