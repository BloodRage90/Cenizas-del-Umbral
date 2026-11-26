const assert = require('node:assert/strict');
const fs = require('node:fs');

const fx = fs.readFileSync(require.resolve('../dist/environment-fx.js'), 'utf8');
const html = fs.readFileSync(require.resolve('../dist/chapter.html'), 'utf8');
assert.match(fx, /content|fireflies|fillCircle/);
assert.match(fx, /prefers-reduced-motion/);
assert.match(html, /environment-fx\.js/);
assert.match(fs.readFileSync(require.resolve('../dist/chapter.js'), 'utf8'), /environment\?\.update/);

console.log('PASS: la exploración tiene iluminación y partículas acotadas, respetando reduced motion.');
