const {test,expect}=require('@playwright/test');

test('menú y creador de personaje no rompen el flujo inicial',async({page})=>{
  await page.goto('/index.html');
  await expect(page.getByRole('button',{name:'Juego nuevo'})).toBeVisible();
  await page.getByRole('button',{name:'Juego nuevo'}).click();
  await expect(page.locator('#intro-cinema')).toBeVisible();
  await page.getByRole('button',{name:'Continuar al creador'}).click();
  const creator=page.locator('#sheet-frame').contentFrame();
  await expect(creator.locator('#content')).toBeVisible();
  await expect(creator.locator('#simple-start')).toBeVisible();
});
