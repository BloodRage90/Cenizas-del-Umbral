const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const staleFiles=[
  'dist/battle-renders.html',
  'dist/chest.png','dist/combat-echo.png','dist/combat-hero.png','dist/custodian.png','dist/echo.png',
  'dist/elara-walk.png','dist/guard.png','dist/hero-vigilia.png','dist/hero-walk-v2.png',
  'dist/combat-elara.png','dist/enemy-sprite-sheet.png','dist/hero-sprites.png','dist/hero-walk-v2.webp',
  'dist/identity-mage-ash-pixel.png','dist/identity-mage-pixel.png','dist/identity-rogue-pixel.png','dist/identity-warrior-pixel.png',
  'dist/npc-atlas.png','dist/npc-citizens.png','dist/npc-clergy.png','dist/region-map.png','dist/trail-sign.png','dist/valdara.png',
  'dist/portraits/elfo.webp','dist/portraits/enano.webp','dist/portraits/gnomo.webp','dist/portraits/mediano.webp',
  'dist/portraits/orco.webp','dist/portraits/semielfo.webp','dist/portraits/semiorco.webp',
];
for(const file of staleFiles)assert(!fs.existsSync(path.join(root,file)),`no se conserva el recurso legacy ${file}`);
const runtime=fs.readdirSync(path.join(root,'dist'),{withFileTypes:true})
  .filter(entry=>entry.isFile()&&/\.(?:js|html|css)$/.test(entry.name))
  .map(entry=>fs.readFileSync(path.join(root,'dist',entry.name),'utf8')).join('\n');
for(const name of ['battle-renders.html','combat-hero.png','combat-echo.png','hero-walk-v2.png','hero-walk-v2.webp','hero-sprites.png','combat-elara.png','enemy-sprite-sheet.png','npc-clergy.png'])
  assert(!runtime.includes(name),`el runtime no referencia ${name}`);
const activeStyles=['chapter.css','combat-polish.css','style.css']
  .map(file=>fs.readFileSync(path.join(root,'dist',file),'utf8')).join('\n');
for(const selector of ['#board','#duel','#combat-arrows','.unit','#timing'])
  assert(!activeStyles.includes(selector),`quedó CSS legacy no usado: ${selector}`);
console.log('PASS: recursos legacy sin referencias fueron retirados.');
