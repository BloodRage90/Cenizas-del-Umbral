/* global document, window, getComputedStyle */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

test('the creator keeps touch targets and content inside the viewport', async ({ page }) => {
  await page.goto('/character.html?creator=1');
  await expect(page.locator('.simple-fixed-name')).toBeVisible({ timeout: 15_000 });

  const report = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0
      );
    };
    const controls = [
      ...document.querySelectorAll(
        'header button, main button, main input, main select, main textarea',
      ),
    ]
      .filter(visible)
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          id: element.id,
          text: element.textContent.trim(),
          width: rect.width,
          height: rect.height,
        };
      });
    const small = controls.filter(({ width, height }) => width < 44 || height < 44);
    return {
      small,
      overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    };
  });

  expect(report.small, JSON.stringify(report.small)).toEqual([]);
  expect(report.overflow).toBe(false);
});

test('the dice tray uses three non-overlapping columns at desktop width', async ({ page }) => {
  await page.goto('/character.html?creator=1');
  await page.addStyleTag({
    content: fs.readFileSync(path.join(__dirname, '../../dist/chapter.css'), 'utf8'),
  });

  const report = await page.evaluate(() => {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<dialog id="dice-dialog"><div id="dice-tray"></div><div id="dice-auto-setting"><label class="auto-close"><input type="checkbox"> Cierre automático</label></div><div class="dice-buttons"><button id="dice-roll">Tirar dados</button></div></dialog>',
    );
    const dialog = document.querySelector('#dice-dialog');
    const tray = document.querySelector('#dice-tray');
    tray.replaceChildren(
      ...Array.from({ length: 3 }, (_, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'die-wrap';
        const die = document.createElement('div');
        die.className = 'die-3d';
        die.textContent = String(index + 1);
        wrap.append(die, Object.assign(document.createElement('small'), { textContent: 'd20' }));
        return wrap;
      }),
    );
    dialog.setAttribute('open', '');
    const rects = [...tray.querySelectorAll('.die-3d')].map((element) =>
      element.getBoundingClientRect(),
    );
    const roll = document.querySelector('#dice-roll').getBoundingClientRect();
    const auto = document.querySelector('#dice-auto-setting').getBoundingClientRect();
    const overlap = (a, b) =>
      a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    return {
      columns: getComputedStyle(tray).gridTemplateColumns.split(' ').length,
      dieOverlap: rects.some((rect, index) =>
        rects.slice(index + 1).some((other) => overlap(rect, other)),
      ),
      controlsOverlap: overlap(roll, auto),
    };
  });

  expect(report.columns).toBe(3);
  expect(report.dieOverlap).toBe(false);
  expect(report.controlsOverlap).toBe(false);
});
