#!/usr/bin/env node
/*
 * Validates the approved hero sheets and writes a small runtime manifest.
 *
 * The repository intentionally has no image build step.  When final art is
 * approved, place one RGBA strip in art/src/<id>/combat.png (or pass --source)
 * and run this script.  Until then the six existing combat strips are marked
 * as placeholders instead of being silently regenerated or recoloured.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist', 'hero-atlas.json');
const ids = ['guardia', 'explorador', 'tejedor', 'berserker', 'sombra', 'arcanista'];

function pngSize(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const heroes = {};
for (const id of ids) {
  const file = path.join(root, 'dist', 'combat-heroes', `${id}.png`);
  if (!fs.existsSync(file)) throw new Error(`Falta la hoja de combate: ${file}`);
  const size = pngSize(file);
  if (!size) throw new Error(`${id}: el archivo no es un PNG válido`);
  if (size.width < 4 || size.height < 1) throw new Error(`${id}: dimensiones inválidas`);
  heroes[id] = {
    file: `combat-heroes/${id}.png`,
    grid: [4, 1],
    poses: ['idle', 'windup', 'strike', 'hurt'],
    status: 'placeholder-approved-sheet',
    source: `art/src/${id}/combat.png`,
    width: size.width,
    height: size.height,
  };
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  status: 'PLACEHOLDER_ART_PENDING_APPROVAL',
  note: 'No se sustituyen hojas ni se generan variantes finales sin aprobación de arte.',
  heroes,
};

fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Manifest written: ${path.relative(root, output)}`);
