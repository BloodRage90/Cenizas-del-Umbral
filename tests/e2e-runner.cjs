const assert = require('node:assert/strict');
const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const runner = fs.readFileSync('scripts/run-e2e.cjs', 'utf8');

assert.equal(packageJson.scripts['test:e2e'], 'node scripts/run-e2e.cjs');
assert.match(runner, /freePort\(\)/);
assert.match(runner, /waitForPort\(port\)/);
assert.match(runner, /require\.resolve\('@playwright\/test\/cli'\)/);
assert.match(runner, /if \(args\[0\] === '--'\) args\.shift\(\)/);
assert.match(runner, /closeChild\(server\)/);

console.log('PASS: Playwright usa un puerto libre y cierra su servidor estático.');
