const {test,expect}=require('@playwright/test');

test('menú y creador de personaje no rompen el flujo inicial',async({page})=>{
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Juego nuevo'})).toBeVisible();
  await page.getByRole('button',{name:'Juego nuevo'}).click();
  await expect(page.locator('#intro-cinema')).toBeVisible();
  await page.getByRole('button',{name:'Continuar'}).click();
  await expect(page.locator('#character-onboarding')).toBeVisible();
});
