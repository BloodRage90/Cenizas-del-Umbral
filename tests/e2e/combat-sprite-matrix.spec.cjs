/* global document, localStorage, window */
const { test, expect } = require('@playwright/test');

const character = {
  name: 'Auditoría',
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

test('todos los sprites de combate respetan raza, subclase y género', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(
    (payload) => {
      localStorage.setItem('cenizas-character-v1', JSON.stringify(payload.character));
      localStorage.setItem(
        'cenizas-campaign-v2',
        JSON.stringify({
          v: 2,
          place: 'plaza',
          flags: { intro: true },
          level: 1,
          hp: null,
          spells: null,
          potions: 2,
          gold: 12,
          items: [],
          log: [],
          combat: null,
        }),
      );
    },
    { character },
  );
  await page.goto('/chapter.html?e2e=1');
  await page.waitForFunction(() => window.CenizasHeroVisuals && window.CenizasBattleVisuals);

  const result = await page.evaluate(async () => {
    const HV = window.CenizasHeroVisuals;
    const BV = window.CenizasBattleVisuals;
    const CD = window.CenizasCharacterData;
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const hashCanvas = (canvas) => {
      const thumb = document.createElement('canvas');
      thumb.width = 256;
      thumb.height = 192;
      const thumbContext = thumb.getContext('2d');
      thumbContext.imageSmoothingEnabled = false;
      thumbContext.drawImage(canvas, 0, 0, thumb.width, thumb.height);
      const bytes = thumbContext.getImageData(0, 0, thumb.width, thumb.height).data;
      let hash = 2166136261;
      for (let i = 0; i < bytes.length; i += 4) {
        hash ^= bytes[i];
        hash = Math.imul(hash, 16777619);
        hash ^= bytes[i + 1];
        hash = Math.imul(hash, 16777619);
        hash ^= bytes[i + 2];
        hash = Math.imul(hash, 16777619);
        hash ^= bytes[i + 3];
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    };
    const render = async (profile) => {
      const art = BV.art('hero', 'echo', 'bell-moth', { id: 'hero', team: 'party', ...profile });
      document.body.append(art);
      const canvas = art.querySelector('canvas');
      const sample = document.createElement('canvas');
      sample.width = 64;
      sample.height = 48;
      const sampleContext = sample.getContext('2d');
      let ink = false;
      for (let i = 0; i < 800; i++) {
        sampleContext.clearRect(0, 0, sample.width, sample.height);
        sampleContext.drawImage(canvas, 0, 0, sample.width, sample.height);
        const alpha = sampleContext.getImageData(0, 0, sample.width, sample.height).data;
        ink = alpha.some((value, index) => index % 4 === 3 && value > 0);
        if (ink) break;
        await delay(10);
      }
      const output = {
        key: HV.profile(profile).variantKey,
        dataset: {
          class: art.dataset.class,
          race: art.dataset.race,
          gender: art.dataset.gender,
          subclass: art.dataset.subclass,
        },
        hash: ink ? hashCanvas(canvas) : null,
        ink,
      };
      art.remove();
      return output;
    };

    const profiles = [];
    for (const race of Object.keys(HV.raceData)) {
      for (const gender of Object.keys(HV.genderData)) {
        for (const pair of CD.classSubclassPairs) {
          profiles.push({ race, gender, class: pair.class, subclass: pair.subclass });
        }
      }
    }
    const rendered = [];
    for (const profile of profiles) rendered.push({ profile, output: await render(profile) });
    return { profiles: rendered, count: profiles.length };
  });

  expect(result.count).toBe(144);
  expect(result.profiles).toHaveLength(144);
  expect(result.profiles.every(({ output }) => output.ink)).toBeTruthy();
  expect(new Set(result.profiles.map(({ output }) => output.key)).size).toBe(144);
  for (const { profile, output } of result.profiles) {
    expect(output.dataset).toEqual({
      class: profile.class,
      race: profile.race,
      gender: profile.gender,
      subclass: profile.subclass,
    });
  }

  const groups = (fieldNames) => {
    const map = new Map();
    for (const { profile, output } of result.profiles) {
      const key = fieldNames.map((field) => profile[field]).join('|');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(output.hash);
    }
    return [...map.entries()].map(([key, hashes]) => ({ key, hashes }));
  };
  for (const group of groups(['race', 'class', 'subclass'])) {
    expect(new Set(group.hashes).size, group.key).toBe(3);
  }
  for (const group of groups(['race', 'gender'])) {
    expect(new Set(group.hashes).size, group.key).toBe(6);
  }
  for (const group of groups(['class', 'subclass', 'gender'])) {
    expect(new Set(group.hashes).size, group.key).toBe(8);
  }
});
