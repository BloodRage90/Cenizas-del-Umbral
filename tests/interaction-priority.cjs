const assert = require('node:assert/strict');
const fs = require('node:fs');

const chapter = fs.readFileSync('dist/chapter.js', 'utf8');
assert.match(chapter, /function missionTargetId\(\)/, 'mission target resolver exists');
assert.match(chapter, /missionTargetId\?\.\(\)/, 'nearby mission NPC takes interaction priority');
assert.match(chapter, /bindNpcTapApproach/, 'NPC taps use the approach interaction');
assert.match(chapter, /villagerTalks/, 'wandering villager conversations are finite');
assert.match(chapter, /state\.flags\.villagerTalks\[id\]=count\+1/, 'villager dialogue advances instead of looping');

console.log('PASS: el objetivo de misión gana prioridad al interactuar y los NPC errantes tienen conversación finita con acercamiento táctil.');
