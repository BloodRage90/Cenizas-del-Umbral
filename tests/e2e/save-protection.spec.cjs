const { test, expect } = require('@playwright/test');

test('Juego nuevo pide confirmación y cancelar conserva los guardados', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) =>
    failedRequests.push(`${request.url()} · ${request.failure()?.errorText || 'falló'}`),
  );

  const original = {
    'cenizas-valdara-v1': '{"stage":2,"x":17}',
    'cenizas-character-v1': '{"name":"Iria","unknown":"legacy"}',
    'cenizas-campaign-v2': '{"level":3,"flags":{"intro":true}}',
  };
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) globalThis.localStorage.setItem(key, value);
  }, original);
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Juego nuevo' }).click();
  const dialog = page.locator('#overwrite-save-modal');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('la partida actual se reemplazará');

  await dialog.getByRole('button', { name: 'Conservar partida' }).click();
  const afterCancel = await page.evaluate(
    (keys) => Object.fromEntries(keys.map((key) => [key, globalThis.localStorage.getItem(key)])),
    Object.keys(original),
  );
  expect(afterCancel).toEqual(original);
  await expect(dialog).toBeHidden();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(failedRequests).toEqual([]);
});
