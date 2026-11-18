const {test,expect}=require('@playwright/test');
const Rules=require('../../dist/combat.js');

const places=[
  'plaza','taller','criptas','bosque','lindero','embarcadero','molino',
  'monasterio','archivo','enfermeria','capilla','montana','antesala','umbral'
];
const character={name:'Prueba de campaña',race:'Elfo',class:'Pícaro',subclass:'Explorador',gender:'Mujer',base:[14,16,12,10,10,10],ranks:{},feats:['Dureza']};

function campaign(place){
  const flags={intro:true,branchDone:true,workshop:true,custodian:true,elara:true,dockVisited:true,millAccepted:true,millRecovered:true,monasteryEntered:true,archiveOpen:true,archiveCompared:true,captivesFreed:true,chapelRevealed:true,chapelWon:true,mountainStarted:true,mountainEcho:true,namesUnbound:true};
  return {...Rules.fresh(),place,flags,position:null};
}

test('crea personaje, recorre las 14 zonas y completa un combate lateral',async({page})=>{
  await page.goto('/character.html');
  await page.locator('#name').fill(character.name);
  await page.locator('[data-class="Pícaro"]').click();
  await page.locator('[data-subclass="Explorador"]').click();
  await page.locator('[data-gender="Mujer"]').click();
  await page.locator('#name').fill(character.name);
  await page.locator('#save').click();
  await expect(page.locator('#status')).toContainText('Personaje guardado');

  for(const place of places){
    await page.evaluate(({c,s})=>{localStorage.setItem('cenizas-character-v1',JSON.stringify(c));localStorage.setItem('cenizas-campaign-v2',JSON.stringify(s));},{c:character,s:campaign(place)});
    await page.goto('/chapter.html');
    await expect(page.locator('#scene canvas')).toBeVisible({timeout:15000});
    await expect(page.locator('#place')).not.toHaveText('');
  }

  const save=campaign('plaza');
  const battle=new Rules.Battle('echo',Rules.profile(character),save,()=>10);
  battle.s.noBoard=true;
  save.combat=battle.s;
  await page.evaluate(({c,s})=>{localStorage.setItem('cenizas-character-v1',JSON.stringify(c));localStorage.setItem('cenizas-campaign-v2',JSON.stringify(s));},{c:character,s:save});
  await page.goto('/chapter.html');
  await expect(page.locator('#battle')).toBeVisible({timeout:15000});
  await page.getByRole('button',{name:'Atacar'}).click();
  await expect(page.locator('#dice-dialog')).toBeVisible();
  await page.getByRole('button',{name:'Tirar dados'}).click();
  await expect(page.locator('#dice-result')).not.toHaveText('');
});
