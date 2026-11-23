const {test,expect}=require('@playwright/test');

async function clickChoice(page,name){
  const button=page.getByRole('button',{name});
  await expect(button).toBeVisible({timeout:15000});
  for(let attempt=0;attempt<120;attempt++){
    if(await button.isEnabled()){
      try{await button.click({timeout:1000});return;}catch{/* the combat turn can refresh the button between checks */}
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`El botón «${name}» no se habilitó a tiempo.`);
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
  // The creator opens in simple mode: archetype buttons, #simple-* controls.
  await expect(creator.locator('#simple-name')).toBeVisible({timeout:15000});
  await creator.locator('#simple-name').fill('Prueba de campaña');
  await creator.locator('[data-simple-archetype="explorador"]').click();
  await creator.locator('#simple-race').selectOption('Elfo');
  await creator.locator('#simple-gender').selectOption('Mujer');
  await creator.locator('#simple-start').click();
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
  // One pause introduces the plaza bell and five more advance the arrival
  // staging; keep these explicit so the test follows the visible sequence.
  for(let i=0;i<6;i++)await clickChoice(page,'Continuar');
  await clickChoice(page,'Explorar la plaza');
  await expect(page.locator('#scene canvas')).toBeVisible({timeout:15000});
  await page.waitForTimeout(1200);

  // Walk to Maela, choose the witness route and enter Ordan's workshop.
  await walk(page,'ArrowLeft',1700);
  await walk(page,'ArrowUp',900);
  await expect(page.locator('#interact')).toHaveText('Maela',{timeout:10000});
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
  // The workshop encounter is now visible before combat starts.
  await clickChoice(page,'Enfrentar a Bruto de hongos');
  await expect(page.locator('#battle')).toBeVisible({timeout:15000});
  await expect(page.locator('#turn-order')).toBeVisible();
  await clickChoice(page,'Tirar dados');
  await clickChoice(page,'Atacar');
  await clickChoice(page,'Tirar dados');
  await expect(page.locator('#dice-result')).not.toHaveText('');
});

test('el modo avanzado del creador sigue disponible desde el modo simple',async({page})=>{
  await page.goto('/index.html');
  await clickChoice(page,'Juego nuevo');
  await clickChoice(page,'Continuar al creador');
  const creator=page.locator('#sheet-frame').contentFrame();
  await expect(creator.locator('#simple-name')).toBeVisible({timeout:15000});
  await creator.locator('#advanced-mode').click();
  await expect(creator.locator('#name')).toBeVisible({timeout:15000});
  await expect(creator.locator('#race')).toBeVisible();
});
