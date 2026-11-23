/* global localStorage, window */
const { test, expect } = require('@playwright/test');

const profiles = [
  ['Orco', 'Guerrero', 'Berserker', 'Hombre'],
  ['Gnomo', 'Mago', 'Arcanista', 'Mujer'],
  ['Mediano', 'Pícaro', 'Sombra', 'No binario'],
  ['Enano', 'Guerrero', 'Guardia', 'Mujer'],
  ['Elfo', 'Mago', 'Tejedor', 'Hombre'],
  ['Semielfo', 'Pícaro', 'Explorador', 'Mujer'],
  ['Semiorco', 'Guerrero', 'Guardia', 'No binario'],
  ['Humano', 'Mago', 'Arcanista', 'Hombre'],
  ['Humano', 'Pícaro', 'Sombra', 'Mujer'],
  ['Enano', 'Mago', 'Tejedor', 'No binario'],
  ['Orco', 'Pícaro', 'Explorador', 'Mujer'],
  ['Mediano', 'Guerrero', 'Berserker', 'Hombre'],
];
const character = {
  name: 'Matriz',
  race: 'Humano',
  class: 'Guerrero',
  subclass: 'Guardia',
  gender: 'Mujer',
  alignment: 'Neutral bueno',
  base: [16, 14, 14, 12, 10, 8],
  feats: ['Dureza'],
  ranks: {},
  levelBonuses: [0, 0, 0, 0, 0, 0],
};

test('la matriz visual mantiene variantKey y expone el juego solo con e2e=1', async ({ page }) => {
  await page.addInitScript(
    (payload) => {
      localStorage.setItem('cenizas-character-v1', JSON.stringify(payload.character));
      localStorage.setItem(
        'cenizas-campaign-v2',
        JSON.stringify({
          v: 2,
          place: 'plaza',
          flags: { intro: true },
          level: 1,
          hp: null,
          spells: null,
          potions: 2,
          gold: 12,
          items: [],
          log: [],
          combat: null,
        }),
      );
    },
    { character },
  );
  await page.goto('/chapter.html?e2e=1');
  await expect(page.locator('#scene canvas')).toBeVisible({ timeout: 15000 });
  const enabled = await page.evaluate((input) => {
    const keys = input.map(
      ([race, className, subclass, gender]) =>
        window.CenizasHeroVisuals.profile({ race, class: className, subclass, gender }).variantKey,
    );
    return { keys, hasGame: !!window.__cenizasGame };
  }, profiles);
  expect(new Set(enabled.keys).size).toBe(profiles.length);
  expect(enabled.hasGame).toBe(true);

  await page.goto('/chapter.html');
  await expect(page.locator('#scene canvas')).toBeVisible({ timeout: 15000 });
  expect(await page.evaluate(() => '___' + typeof window.__cenizasGame)).toBe('___undefined');
});
