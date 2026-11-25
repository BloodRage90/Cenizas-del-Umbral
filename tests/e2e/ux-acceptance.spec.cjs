/* global document, window */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('creator layout keeps its copy and start action usable', async ({ page }, testInfo) => {
  await page.goto('/character.html?creator=1');
  await page.locator('.simple-creator').waitFor();

  const report = await page.evaluate(() => {
    const clipped = [...document.querySelectorAll('.simple-archetype strong, .simple-archetype small, .simple-archetype em, .simple-preview-label')]
      .filter((node) => node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1)
      .map((node) => node.textContent?.trim());
    const start = document.querySelector('#simple-start')?.getBoundingClientRect();
    return {
      clipped,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      startVisible: Boolean(start && start.top >= 0 && start.bottom <= window.innerHeight + 1),
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    };
  });

  const phase = process.env.UX_CAPTURE || 'after';
  const dir = path.resolve('artifacts', 'ux', phase);
  fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: path.join(dir, `${testInfo.project.name}.png`), fullPage: true });
  fs.writeFileSync(path.join(dir, `${testInfo.project.name}.json`), JSON.stringify(report, null, 2));

  expect(report.horizontalOverflow, `horizontal overflow at ${report.viewport}`).toBe(false);
  expect(report.clipped, `clipped creator copy at ${report.viewport}`).toEqual([]);
  expect(report.startVisible, `start action not visible at ${report.viewport}`).toBe(true);
});

test('the six archetypes keep their combat verb and start on the first click', async ({ page }) => {
  await page.goto('/character.html?creator=1');
  await page.locator('.simple-creator').waitFor();
  const expected = {
    guardia: 'Provocar',
    berserker: 'Furia de ceniza',
    sombra: 'Finta de sombra',
    explorador: 'Marcar objetivo',
    arcanista: 'Llama Arcana',
    tejedor: 'Proyectil de ceniza',
  };
  for (const [id, verb] of Object.entries(expected)) {
    await page.locator(`[data-simple-archetype="${id}"]`).click();
    await expect(page.locator('.simple-preview-copy span')).toContainText(verb);
    await expect(page.locator('.simple-preview-copy small')).toContainText(verb);
  }
  await page.locator('#simple-name').fill('Primera chispa');
  await page.locator('#simple-start').click();
  await expect(page.locator('#status')).toContainText('Personaje guardado');
});
