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
