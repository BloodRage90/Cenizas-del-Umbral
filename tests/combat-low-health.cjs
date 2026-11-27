const assert = require('node:assert/strict');
const fs = require('node:fs');

const visuals = fs.readFileSync('dist/battle-visuals.js', 'utf8');
const polish = fs.readFileSync('dist/combat-polish.css', 'utf8');
const brief = fs.readFileSync('docs/ART-BRIEF.md', 'utf8');

assert.match(visuals, /poseFrames=\{idle:0,windup:1,strike:2,hurt:3,critical:3,low:3\}/);
assert.match(visuals, /u\.hp>0&&u\.max>0&&u\.hp\/u\.max<=\.25/);
assert.match(visuals, /n\.classList\.toggle\('low-health',critical\)/);
assert.match(visuals, /combatArt\.dataset\.pose='critical'/);
assert.match(polish, /\.battle-actor\.low-health \.combat-art/);
assert.match(polish, /low-health-breath/);
assert.match(polish, /prefers-reduced-motion:reduce/);
assert.match(brief, /25 % de PG o menos/);
assert.match(brief, /marcador técnico/);

console.log('PASS: critical-health pose is persistent and documented');
