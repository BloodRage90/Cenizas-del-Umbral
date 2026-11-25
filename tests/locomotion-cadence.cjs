const assert = require('node:assert/strict');
const Motion = require('../dist/locomotion.js');

function sample(fps, columns, rows, seconds = 4) {
  const sprite = {
    walkColumns: columns,
    walkRows: rows,
    walkFrame: 0,
    walkBaseScaleX: 1,
    walkBaseScaleY: 1,
    scaleX: 1,
    scaleY: 1,
    frames: [],
    scales: [],
    flipX: false,
    setFrame(frame) {
      this.frames.push(frame);
    },
    setScale(x, y) {
      this.scaleX = x;
      this.scaleY = y;
      this.scales.push(y);
    },
    setFlipX(value) {
      this.flipX = value;
    },
    anims: { isPlaying: false },
  };
  const ticks = fps * seconds;
  for (let i = 0; i < ticks; i++) Motion.frame(sprite, 150 / fps, 0, 1000 / fps);
  return { changes: sprite.frames.length, sprite };
}

// Full walk sheets change frames at a stable cadence. Combat pose sheets are
// intentionally pinned to frame 0 during exploration, so their cadence is the
// transform bob (covered below), not a frame counter.
for (const [columns, rows] of [[4, 4]]) {
  const samples = [30, 60, 144].map((fps) => sample(fps, columns, rows).changes);
  const average = samples.reduce((a, b) => a + b, 0) / samples.length;
  for (const count of samples)
    assert(Math.abs(count - average) / average <= 0.1, `cadencia ${columns}x${rows}`);
}

assert.equal(sample(60, 2, 2).changes, 0, 'las hojas de combate no cambian a poses de ataque al caminar');

function distanceFor(inputX, inputY, fps = 60, milliseconds = 1000) {
  let distance = 0;
  const dt = 1000 / fps;
  for (let elapsed = 0; elapsed < milliseconds; elapsed += dt) {
    const input = Motion.normalize(inputX, inputY);
    distance += Math.hypot(input.x * 150 * (dt / 1000), input.y * 150 * (dt / 1000));
  }
  return distance;
}

const cardinalDistance = distanceFor(1, 0);
const diagonalDistance = distanceFor(1, 1);
assert(
  Math.abs(diagonalDistance - cardinalDistance) / cardinalDistance <= 0.02,
  `diagonal ${diagonalDistance} vs cardinal ${cardinalDistance}`,
);

assert.equal(Motion.clampDelta(5000), 32, 'los saltos de reloj se limitan a 32 ms');
assert.equal(Motion.clampDelta(-20), 0, 'un delta negativo no mueve al personaje');
assert(Math.abs(Motion.stepDistance(112, 1000) - 3.584) < 0.001, 'la distancia usa segundos una sola vez');
assert.equal(Motion.stepDistance(112, 5000), 3.584, 'un frame largo no teletransporta al personaje');

const pose = sample(60, 2, 2).sprite;
assert(
  Math.max(...pose.scales) <= 1.021 && Math.min(...pose.scales) >= 0.979,
  'oscilación de pose <= 2%',
);
const follower = new Motion.Follower(0, 0);
for (let i = 0; i < 240; i++) {
  follower.record(i * 2.5, 0);
  follower.update(1000 / 60);
}
assert(Math.abs(follower.length - 48) <= 6, `hueco del seguidor: ${follower.length}`);

const loop = { delta: 5000, elapsed: 5000 };
const guard = new Motion.VisibilityGuard();
const scene = { game: { loop } };
const sprite = sample(60, 2, 2).sprite;
let x = 12;
let poseChanges = 0;
const tick = (dt) => {
  if (!guard.canUpdate(scene)) return;
  x += 150 * (dt / 1000);
  poseChanges += Motion.frame(sprite, 150 * (dt / 1000), 0, dt) ? 1 : 0;
};
guard.pause(scene);
for (let i = 0; i < 300; i++) tick(1000 / 60);
assert.equal(x, 12, 'la pestaña oculta no mueve al héroe');
assert.equal(loop.delta, 0, 'se descarta el delta acumulado al ocultar');
assert.equal(poseChanges, 0, 'la pestaña oculta no cambia poses');
guard.resume(scene);
loop.delta = 5000;
tick(5000);
assert.equal(x, 12, 'el primer frame tras recuperar descarta el salto');
assert.equal(poseChanges, 0, 'la recuperación no dispara una ráfaga de poses');
tick(1000 / 60);
assert.equal(poseChanges <= 1, true, 'el primer frame útil cambia como máximo una pose');
console.log(
  'PASS: la locomoción normaliza diagonales y recupera pestañas sin salto ni ráfaga de poses.',
);
