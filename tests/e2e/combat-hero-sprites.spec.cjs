const { test, expect } = require('@playwright/test');

const heroes = [
  { id: 'guardia', name: 'Cael', class: 'Guerrero', subclass: 'Guardia', race: 'Humano', gender: 'Hombre' },
  { id: 'explorador', name: 'Eiren', class: 'Pícaro', subclass: 'Explorador', race: 'Elfo', gender: 'Hombre' },
  { id: 'tejedor', name: 'Soren', class: 'Mago', subclass: 'Tejedor', race: 'Orco', gender: 'Hombre' },
  { id: 'berserker', name: 'Kaira', class: 'Guerrero', subclass: 'Berserker', race: 'Orco', gender: 'Mujer' },
  { id: 'sombra', name: 'Vesper', class: 'Pícaro', subclass: 'Sombra', race: 'Mediano', gender: 'Mujer' },
  { id: 'arcanista', name: 'Nimra', class: 'Mago', subclass: 'Arcanista', race: 'Gnomo', gender: 'Mujer' },
];

test('los seis sprites de combate aprobados se pintan en la arena', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    localStorage.setItem('cenizas-character-v1', JSON.stringify({
      v: 1, name: 'Cael', race: 'Humano', gender: 'Hombre', class: 'Guerrero',
      subclass: 'Guardia', alignment: 'Neutral bueno', base: [16, 14, 14, 10, 10, 10],
      skills: {}, feats: [], equipment: [],
    }));
  });
  await page.goto('/chapter.html');
  await page.waitForFunction(() => window.CenizasBattleVisuals && window.CenizasHeroVisuals);

  await page.evaluate((roster) => {
    const proof = document.createElement('div');
    proof.id = 'combat-sprite-proof';
    proof.style.cssText = 'position:fixed;inset:0;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:16px;background:#09151f;z-index:9999;';
    for (const hero of roster) {
      const card = document.createElement('figure');
      card.dataset.subclass = hero.subclass;
      card.style.cssText = 'margin:0;display:grid;place-items:center;background:radial-gradient(ellipse,#274350,#09151f 70%);border:1px solid #d7bd72;border-radius:12px;overflow:hidden;';
      const art = window.CenizasBattleVisuals.art('hero', 'whisper', '', { ...hero, team: 'party' });
      art.style.cssText = 'width:100%;height:100%;';
      card.append(art);
      const caption = document.createElement('figcaption');
      caption.textContent = `${hero.name} · ${hero.subclass}`;
      caption.style.cssText = 'position:absolute;color:#f8e8bd;font:600 14px system-ui;';
      card.append(caption);
      proof.append(card);
    }
    document.body.append(proof);
  }, heroes);

  await page.waitForFunction(() => [...document.querySelectorAll('#combat-sprite-proof canvas')].length === 6 && [...document.querySelectorAll('#combat-sprite-proof canvas')].every(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) return true;
    return false;
  }), null, { timeout: 15_000 });

  await expect(page.locator('#combat-sprite-proof figure')).toHaveCount(6);
  await page.screenshot({ path: testInfo.outputPath('combat-hero-sprites.png'), fullPage: true });
});

test('el creador muestra el mismo sprite de combate en cada tarjeta y vista previa', async ({ page }, testInfo) => {
  await page.goto('/character.html?creator=1');
  await page.waitForSelector('.simple-card-art');
  await expect(page.locator('.simple-card-art')).toHaveCount(6);

  const cardSprites = await page.locator('.simple-card-art').evaluateAll(elements =>
    elements.map(element => element.style.getPropertyValue('--simple-card-sprite'))
  );
  expect(cardSprites).toEqual(heroes.map(hero => `url('combat-heroes/${hero.id}.png')`));

  const preview = page.locator('.simple-preview .preview-character-stage');
  await expect(preview).toHaveClass(/approved-combat-preview/);
  await expect(preview.locator('.approved-combat-sprite')).toHaveCount(1);
  await expect(preview.locator('.approved-combat-sprite')).toHaveCSS('background-size', '400% 100%');
  await expect(preview.locator('.preview-race-feature')).toHaveCSS('display', 'none');
  await page.screenshot({ path: testInfo.outputPath('creator-combat-sprites.png'), fullPage: true });
});

test('los seis protagonistas tienen cinco pasos en las cuatro direcciones de exploración', async ({ page }) => {
  await page.goto('/chapter.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.CenizasHeroVisuals && window.CenizasLocomotion);

  const proof = await page.evaluate(async () => {
    const image = new Image();
    image.src = 'hero-vigilia.webp';
    await new Promise(resolve => { image.onload = resolve; image.onerror = resolve; });
    const roster = [
      ['guardia', 'Guerrero', 'Guardia'], ['explorador', 'Pícaro', 'Explorador'],
      ['tejedor', 'Mago', 'Tejedor'], ['berserker', 'Guerrero', 'Berserker'],
      ['sombra', 'Pícaro', 'Sombra'], ['arcanista', 'Mago', 'Arcanista'],
    ];
    const atlases = roster.map(([id, className, subclass]) => {
      const canvas = window.CenizasHeroVisuals.paintWalkCanvas(image,
        window.CenizasHeroVisuals.profile({ class: className, subclass, race: 'Humano', gender: 'No binario' }),
        { columns: 5, rows: 4, sourceColumns: 4, sourceRows: 4 });
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      return { id, width: canvas.width, height: canvas.height, visible: pixels.some((value, index) => index % 4 === 3 && value > 0) };
    });
    const directions = [[0, 2.5], [-2.5, 0], [2.5, 0], [0, -2.5]].map(([dx, dy]) => {
      const sprite = { walkColumns: 5, walkRows: 4, frames: [], scaleX: 1, scaleY: 1, flipX: false,
        setFrame(frame) { this.frames.push(frame); }, setScale() {}, setFlipX(value) { this.flipX = value; },
        setRotation() {}, anims: { isPlaying: false } };
      for (let i = 0; i < 48; i++) window.CenizasLocomotion.frame(sprite, dx, dy, 16);
      return [...new Set(sprite.frames)];
    });
    return { sourceWidth: image.naturalWidth, sourceHeight: image.naturalHeight, atlases, directions };
  });

  expect(proof.atlases).toHaveLength(6);
  for (const atlas of proof.atlases) {
    expect(atlas.width).toBe(Math.round(proof.sourceWidth / 4 * 5));
    expect(atlas.height).toBe(proof.sourceHeight);
    expect(atlas.visible).toBe(true);
  }
  expect(proof.directions.every((frames, row) => frames.length > 1 && frames.every(frame => frame >= row * 5 && frame < row * 5 + 5))).toBe(true);
});
