const {test,expect}=require('@playwright/test');

async function clickChoice(page,name){
  const button=page.getByRole('button',{name});
  await expect(button).toBeVisible({timeout:15000});
  await button.click();
}

async function walk(page,key,milliseconds){
  await page.keyboard.down(key);
  await page.waitForTimeout(milliseconds);
  await page.keyboard.up(key);
}

test('crea personaje, camina desde el puente y llega a un combate por la interfaz',async({page})=>{
  await page.goto('/index.html');
  await clickChoice(page,'Juego nuevo');
  await expect(page.locator('#intro-cinema')).toBeVisible();
  await clickChoice(page,'Continuar al creador');

  const creator=page.locator('#sheet-frame').contentFrame();
  await expect(creator.locator('#name')).toBeVisible({timeout:15000});
  await creator.locator('#name').fill('Prueba de campaña');
  await creator.locator('#race').selectOption('Elfo');
  await creator.locator('[data-class="Pícaro"]').click();
  await creator.locator('[data-subclass="Explorador"]').click();
  await creator.locator('[data-gender="Mujer"]').click();
  await creator.locator('#save').click();
  await expect(creator.locator('#status')).toContainText('Personaje guardado');
  await expect(page.locator('#sheet-modal')).toBeHidden({timeout:10000});

  // The index game supplies the pathing, dialogue and gate; no state is
  // injected and no localStorage write is performed by this test.
  await page.getByRole('button',{name:'Conversar con Elara'}).click();
  await clickChoice(page,'Mostrar la carta sellada');
  await clickChoice(page,/Sí\. Dice que mi nombre/);
  await clickChoice(page,/Iré a buscarlo/);
  await clickChoice(page,'Acercarme a la puerta');
  await expect(page.locator('#continue-adventure')).toBeVisible({timeout:15000});
  await page.locator('#continue-adventure').click();
  await page.waitForURL('**/chapter.html');

  // Dismiss the plaza arrival staging via its visible Continue control.
  for(let i=0;i<5;i++)await clickChoice(page,'Continuar');
  await clickChoice(page,'Explorar la plaza');
  await expect(page.locator('#scene canvas')).toBeVisible({timeout:15000});

  // Walk to Maela, choose the witness route and enter Ordan's workshop.
  await walk(page,'ArrowLeft',1700);
  await walk(page,'ArrowUp',900);
  await expect(page.locator('#interact')).toBeEnabled({timeout:10000});
  await page.locator('#interact').click();
  await clickChoice(page,/Proteger a los testigos/);
  await clickChoice(page,/Pedir que permanezcan juntos/);
  await clickChoice(page,'Tirar dados');
  await clickChoice(page,'Continuar');
  await clickChoice(page,/Buscar a Ordan/);
  await expect(page.locator('#place')).toContainText('taller');

  await walk(page,'ArrowUp',550);
  await walk(page,'ArrowLeft',950);
  await expect(page.locator('#interact')).toBeEnabled({timeout:10000});
  await page.locator('#interact').click();
  await clickChoice(page,'Prepararme para el encuentro');
  await clickChoice(page,'Comenzar');
  await expect(page.locator('#battle')).toBeVisible({timeout:15000});
  await expect(page.locator('#turn-order')).toBeVisible();
  await clickChoice(page,'Atacar');
  await clickChoice(page,'Tirar dados');
  await expect(page.locator('#dice-result')).not.toHaveText('');
});
