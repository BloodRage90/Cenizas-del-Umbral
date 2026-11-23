const fs = require('node:fs');
const path = require('node:path');

/* QA overlay for the hand-authored collision contract in chapter.js.  It is
 * intentionally a standalone inspection tool: it never replaces the scene
 * art and it does not ship an extra runtime asset. */
const WIDTH = 1536;
const HEIGHT = 1024;
const walkable = [
  [
    [430, 490],
    [700, 460],
    [1150, 560],
    [1150, 700],
    [930, 795],
    [580, 755],
    [370, 610],
  ],
  [
    [360, 470],
    [460, 420],
    [600, 430],
    [650, 500],
    [520, 520],
    [430, 550],
  ],
  [
    [1050, 530],
    [1210, 500],
    [1300, 575],
    [1190, 690],
    [1090, 680],
  ],
  [
    [640, 740],
    [900, 760],
    [1040, 920],
    [900, 990],
    [620, 920],
  ],
];
const blocked = [
  [
    [570, 470],
    [700, 445],
    [730, 500],
    [650, 535],
  ],
  [
    [900, 520],
    [1080, 530],
    [1120, 600],
    [1010, 630],
  ],
];

const points = (polygon) => polygon.map(([x, y]) => `${x},${y}`).join(' ');
function overlaySvg() {
  const walk = walkable
    .map(
      (poly) =>
        `<polygon points="${points(poly)}" fill="#4fd18b" fill-opacity=".20" stroke="#4fd18b" stroke-width="4"/>`,
    )
    .join('');
  const walls = blocked
    .map(
      (poly) =>
        `<polygon points="${points(poly)}" fill="#e66d6d" fill-opacity=".48" stroke="#ffb1a7" stroke-width="4"/>`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}"><image href="../dist/scenes/criptas.webp" x="0" y="0" width="${WIDTH}" height="${HEIGHT}"/><g>${walk}${walls}</g><text x="24" y="40" fill="#fff" font-family="system-ui" font-size="24">Criptas · verde transitable · rojo bloqueado</text></svg>`;
}

if (require.main === module) {
  if (process.argv.includes('--write')) {
    const root = path.resolve(__dirname, '..');
    const outDir = path.join(root, 'artifacts');
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, 'criptas-collision-overlay.svg');
    fs.writeFileSync(out, overlaySvg(), 'utf8');
    console.log(out);
  } else {
    process.stdout.write(overlaySvg());
  }
}

module.exports = { WIDTH, HEIGHT, walkable, blocked, overlaySvg };
