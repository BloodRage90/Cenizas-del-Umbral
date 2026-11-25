const assert = require('node:assert/strict');
const Motion = require('../dist/locomotion.js');

// H-02: the hero sheets are 2x2 combat poses (idle, wind-up, slash, recover),
// all facing right. Walking must never play the attack poses and must mirror
// the sprite for leftward travel.
const sprite = (columns, rows) => ({
  walkColumns: columns,
  walkRows: rows,
  frames: [],
  flipX: false,
  rotation: 0,
  setFrame(index) {
    this.frames.push(index);
  },
  setFlipX(value) {
    this.flipX = value;
  },
  setRotation(value) {
    this.rotation = value;
  },
  anims: { isPlaying: false },
});
const walk = (columns, rows, dx, dy, ticks = 60) => {
  const s = sprite(columns, rows);
  for (let i = 0; i < ticks; i++) Motion.frame(s, dx, dy, 16);
  return s;
};

for (const [dx, dy] of [
  [2.5, 0],
  [-2.5, 0],
  [0, 2.5],
  [0, -2.5],
]) {
  const frames = new Set(walk(2, 2, dx, dy).frames);
  assert.deepEqual([...frames], [0], `pose sheet stays on its neutral frame while walking (${dx},${dy})`);
}

assert.equal(walk(2, 2, 2.5, 0).flipX, false, 'rightward travel is not mirrored');
assert.equal(walk(2, 2, -2.5, 0).flipX, true, 'leftward travel mirrors the sprite');
assert.notEqual(walk(2, 2, 2.5, 0).rotation, 0, 'walking tilts the neutral pose instead of sliding rigidly');

const vertical = walk(2, 2, -2.5, 0);
for (let i = 0; i < 30; i++) Motion.frame(vertical, 0, -2.5, 16);
assert.equal(vertical.flipX, true, 'vertical travel keeps the last horizontal facing');

const resting = walk(2, 2, -2.5, 0);
for (let i = 0; i < 12; i++) Motion.frame(resting, 0, 0, 16);
assert.equal(resting.frames.at(-1), 0, 'resting uses the neutral pose');
assert.equal(resting.flipX, true, 'resting keeps the last facing');
assert.equal(resting.rotation, 0, 'the pose returns upright when movement stops');

const staleAttack = sprite(2, 2);
staleAttack.walkFrame = 2;
Motion.frame(staleAttack, 2.5, 0, 16);
assert.equal(staleAttack.frames.at(-1), 0, 'a stale combat frame is reset before exploration movement');

// Full 4x4 walk sheets (Elara) keep the original direction-per-row behaviour.
const elara = walk(4, 4, -2.5, 0);
assert([...new Set(elara.frames)].every((frame) => frame >= 4 && frame <= 7), 'left row is row 1');
assert.equal(elara.flipX, false, 'full walk sheets are not mirrored');

console.log('PASS: pose sheets never walk with attack poses, mirror on leftward travel and rest neutral.');
