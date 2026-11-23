/* global localStorage */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const fixtureRoot = path.join(__dirname, '..', 'fixtures', 'saves');
const fixtureNames = fs.readdirSync(fixtureRoot).sort();
const validCharacter = {
  name: 'Fixture',
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

test('los ocho guardados adversos se recuperan sin pageerror', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error));
  for (const name of fixtureNames) {
    const text = fs.readFileSync(path.join(fixtureRoot, name), 'utf8');
    await page.addInitScript(
      ({ campaign, character }) => {
        localStorage.clear();
        localStorage.setItem('cenizas-campaign-v2', campaign);
        if (character) localStorage.setItem('cenizas-character-v1', JSON.stringify(character));
      },
      { campaign: text, character: name.includes('no-character') ? null : validCharacter },
    );
    await page.goto(`/chapter.html?save-fixture=${encodeURIComponent(name)}`);
    await page.waitForTimeout(900);
    expect(pageErrors, `${name} no debe producir pageerror`).toEqual([]);
    const save = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cenizas-campaign-v2') || 'null'),
    );
    expect(save?.v, `${name} conserva la clave de campaña`).toBe(2);
    expect([1, 2, 3, 4, 5]).toContain(save.level);
    expect(save.gold).toBeGreaterThanOrEqual(0);
    expect(save.combat === null || Array.isArray(save.combat?.units)).toBeTruthy();
  }
});
