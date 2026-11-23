const assert = require('node:assert/strict');
const Motion = require('../dist/locomotion.js');

function sample(fps, columns, rows, seconds = 4) {
  const sprite = {
    walkColumns: columns, walkRows: rows, walkFrame: 0, walkBaseScaleX: 1, walkBaseScaleY: 1,
    scaleX: 1, scaleY: 1, frames: [], scales: [], flipX: false,
    setFrame(frame) { this.frames.push(frame); },
    setScale(x, y) { this.scaleX = x; this.scaleY = y; this.scales.push(y); },
    setFlipX(value) { this.flipX = value; },
    anims: { isPlaying: false },
  };
  const ticks = fps * seconds;
  for (let i = 0; i < ticks; i++) Motion.frame(sprite, 150 / fps, 0, 1000 / fps);
  return { changes: sprite.frames.length, sprite };
}

for (const [columns, rows] of [[2, 2], [4, 4]]) {
  const samples = [30, 60, 144].map((fps) => sample(fps, columns, rows).changes);
  const average = samples.reduce((a, b) => a + b, 0) / samples.length;
  for (const count of samples) assert(Math.abs(count - average) / average <= 0.1, `cadencia ${columns}x${rows}`);
}
const pose = sample(60, 2, 2).sprite;
assert(Math.max(...pose.scales) <= 1.021 && Math.min(...pose.scales) >= 0.979, 'oscilación de pose <= 2%');
const follower = new Motion.Follower(0, 0);
for (let i = 0; i < 240; i++) { follower.record(i * 2.5, 0); follower.update(1000 / 60); }
assert(Math.abs(follower.length - 48) <= 6, `hueco del seguidor: ${follower.length}`);
console.log('PASS: la cadencia de locomoción es independiente del refresco y conserva el hueco del seguidor.');
