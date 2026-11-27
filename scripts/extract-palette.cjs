#!/usr/bin/env node
'use strict';

/*
 * Extracts a compact, deterministic palette from the first (IDLE) cell of
 * each canonical combat strip. This is intentionally stdlib-only so it can
 * run in the static-art pipeline without adding an image dependency.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const ids = ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista'];
const sourceDir = path.join(root, 'dist', 'combat-heroes');
const outputDir = path.join(root, 'art', 'palettes');

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function decodePng(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${file}: no es PNG`);
  let offset = 8, width, height, bitDepth, colorType, idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset); offset += 4;
    const type = bytes.subarray(offset, offset + 4).toString('ascii'); offset += 4;
    const data = bytes.subarray(offset, offset + length); offset += length + 4;
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType)) throw new Error(`${file}: requiere PNG RGB/RGBA de 8 bits`);
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = new Uint8Array(width * height * 4);
  let cursor = 0, previous = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[cursor++];
    const scan = raw.subarray(cursor, cursor + stride); cursor += stride;
    const row = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previous[x] || 0;
      const upLeft = x >= channels ? previous[x - channels] || 0 : 0;
      const value = scan[x];
      row[x] = filter === 0 ? value
        : filter === 1 ? (value + left) & 255
          : filter === 2 ? (value + up) & 255
            : filter === 3 ? (value + Math.floor((left + up) / 2)) & 255
              : (value + paeth(left, up, upLeft)) & 255;
    }
    for (let x = 0; x < width; x++) {
      const source = x * channels, target = (y * width + x) * 4;
      pixels[target] = row[source]; pixels[target + 1] = row[source + 1]; pixels[target + 2] = row[source + 2];
      pixels[target + 3] = channels === 4 ? row[source + 3] : 255;
    }
    previous = row;
  }
  return { width, height, pixels };
}

function quantize(r, g, b) {
  const q = value => Math.max(0, Math.min(255, Math.round(value / 8) * 8));
  return [q(r), q(g), q(b)];
}

function hex([r, g, b]) {
  return `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

function saturation([r, g, b]) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max ? (max - min) / max : 0;
}

function extract(file) {
  const image = decodePng(file);
  const frameWidth = image.width / 4;
  if (!Number.isInteger(frameWidth)) throw new Error(`${file}: la tira debe tener cuatro celdas`);
  const counts = new Map();
  const hairCounts = new Map();
  for (let y = 0; y < image.height; y++) for (let x = 0; x < frameWidth; x++) {
    const index = (y * image.width + x) * 4;
    const rgba = image.pixels.subarray(index, index + 4);
    if (rgba[3] < 24) continue;
    const color = quantize(rgba[0], rgba[1], rgba[2]);
    const key = color.join(','); counts.set(key, (counts.get(key) || 0) + 1);
    /* Idle hair sits in the upper half of the first combat cell. Exclude the
       near-black outline and transparent pixels, then score by frequency and
       chroma so blonde, red, brown and purple hair all remain eligible. */
    if (x > frameWidth * .18 && x < frameWidth * .82 && y < image.height * .42 && rgba[0] + rgba[1] + rgba[2] > 70 && (rgba[0] + rgba[1] + rgba[2]) < 720) {
      const hairKey = color.join(',');
      const brightness = Math.max(rgba[0], rgba[1], rgba[2]) / 255;
      const score = (hairCounts.get(hairKey) || 0) + 1 + saturation(rgba) * 3 + brightness * .5;
      hairCounts.set(hairKey, score);
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 24);
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0) || 1;
  const hair = [...hairCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]?.split(',').map(Number) || [96, 96, 96];
  return {
    source: path.relative(root, file).replaceAll(path.sep, '/'),
    sourceSha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    sourceFrame: 'idle',
    sourceGrid: [4, 1],
    paletteLimit: 24,
    palette: ranked.map(([key, count]) => ({ color: hex(key.split(',').map(Number)), count, ratio: Number((count / total).toFixed(4)) })),
    hairColor: { color: hex(hair), region: 'idle cell · upper 48%', method: 'dominant non-transparent chromatic cluster' },
    status: 'diagnostic-only',
  };
}

fs.mkdirSync(outputDir, { recursive: true });
for (const id of ids) {
  const file = path.join(sourceDir, `${id}.png`);
  if (!fs.existsSync(file)) throw new Error(`Falta la hoja canónica: ${file}`);
  const output = path.join(outputDir, `${id}.json`);
  fs.writeFileSync(output, `${JSON.stringify({ id, ...extract(file) }, null, 2)}\n`);
  console.log(`Palette written: ${path.relative(root, output)}`);
}
