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

test('crea personaje, camina desde el puente y llega a un combate por la interfaz',async({page},testInfo)=>{
  const journeyStartedAt=Date.now();
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

  // The compact arrival has a persistent skip affordance. Exercise it once
  // here; the keyboard/touch advance path is covered by the pacing test.
  await clickChoice(page,'Saltar');
  await clickChoice(page,'Explorar la plaza');
  await expect(page.locator('#scene canvas')).toBeVisible({timeout:15000});
  const plazaReadyMs=Date.now()-journeyStartedAt;
  testInfo.annotations.push({type:'timing',description:`Juego nuevo → plaza jugable: ${plazaReadyMs} ms`});
  expect(plazaReadyMs,`the opening flow took ${plazaReadyMs} ms`).toBeLessThan(45_000);
  await page.waitForTimeout(1200);

  // The active mission target is surfaced by Interact and auto-approached;
  // this avoids a brittle pixel-distance walk in a responsive viewport.
  await expect(page.locator('#interact')).toHaveText('Maela',{timeout:10000});
  await page.locator('#interact').click();
  await clickChoice(page,/Proteger a los testigos/);
  await clickChoice(page,/Pedir que permanezcan juntos/);
  await clickChoice(page,'Tirar dados');
  await clickChoice(page,'Continuar');
  await clickChoice(page,/Buscar a Ordan/);
  await expect(page.locator('#place')).toContainText('taller');

  await expect(page.locator('#interact')).toHaveText('Ordan',{timeout:10000});
  await page.locator('#interact').click();
  // Ordan exposes the first encounter through the authored preparation route.
  await clickChoice(page,'Prepararme para el encuentro');
  await clickChoice(page,'Comenzar');
  await expect(page.locator('#battle')).toBeVisible({timeout:15000});
  await expect(page.locator('#turn-order')).toBeVisible();
  await clickChoice(page,'Entendido');
  await clickChoice(page,'Atacar');
  await expect(page.locator('#battle')).toBeVisible();
  await expect(page.locator('#battle-prompt')).toContainText(/Objetivo|válvula|encuentro/);
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
