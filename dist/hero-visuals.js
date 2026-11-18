(function (root) {
  'use strict';

  /* One visual contract for the creator, exploration and side-view combat.
   * The art is intentionally shared by class, while race, gender and subclass
   * change the silhouette treatment, palette and equipment accents at runtime. */
  const classFiles = {
    Guerrero: 'identity-warrior-pixel.webp',
    Pícaro: 'identity-rogue-pixel.webp',
    Mago: 'identity-mage-pixel.webp'
  };
  const raceData = {
    Humano: { scale: 1, filter: 'none', accent: '#d9b56c', feature: 'round' },
    Elfo: { scale: 1.03, filter: 'saturate(1.12) hue-rotate(8deg)', accent: '#a9d6b6', feature: 'ears' },
    Enano: { scale: 0.91, filter: 'sepia(.13) saturate(.92) contrast(1.06)', accent: '#c58d62', feature: 'beard' },
    Orco: { scale: 1.12, filter: 'saturate(.72) sepia(.3) hue-rotate(26deg) contrast(1.08)', accent: '#92a85d', feature: 'tusks' },
    Mediano: { scale: 0.78, filter: 'saturate(1.08) brightness(1.04)', accent: '#e2bc7a', feature: 'small' },
    Gnomo: { scale: 0.83, filter: 'saturate(.98) hue-rotate(-7deg) brightness(1.04)', accent: '#d8a1d2', feature: 'cap' },
    Semielfo: { scale: 1, filter: 'saturate(1.04) hue-rotate(2deg)', accent: '#b9d0b2', feature: 'half-ears' },
    Semiorco: { scale: 1.08, filter: 'saturate(.82) sepia(.2) hue-rotate(25deg) contrast(1.08)', accent: '#a9a36b', feature: 'half-tusks' }
  };
  const genderData = {
    Mujer: { key: 'woman', accent: '#e6a3b8', feature: 'ribbon' },
    Hombre: { key: 'man', accent: '#9eb9d1', feature: 'braid' },
    'No binario': { key: 'nonbinary', accent: '#b9aaf4', feature: 'sash' }
  };
  const subclassData = {
    Guardia: { visual: 'guardian', accent: '#d9b56c', mark: 'shield' },
    Berserker: { visual: 'berserker', accent: '#e47f5f', mark: 'rage' },
    Sombra: { visual: 'shadow', accent: '#8fc8b1', mark: 'crescent' },
    Explorador: { visual: 'scout', accent: '#c7d98c', mark: 'compass' },
    Arcanista: { visual: 'arcane', accent: '#b9aaf4', mark: 'rune' },
    Tejedor: { visual: 'ash-weaver', accent: '#d6a17c', mark: 'ember' }
  };

  const validClass = value => Object.prototype.hasOwnProperty.call(classFiles, value) ? value : 'Guerrero';
  const validRace = value => Object.prototype.hasOwnProperty.call(raceData, value) ? value : 'Humano';
  const validGender = value => Object.prototype.hasOwnProperty.call(genderData, value) ? value : 'No binario';
  const slug = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function profile(character = {}) {
    const className = validClass(character.class);
    const race = validRace(character.race);
    const gender = validGender(character.gender);
    const subclass = subclassData[character.subclass] ? character.subclass : className === 'Guerrero' ? 'Guardia' : className === 'Pícaro' ? 'Sombra' : 'Arcanista';
    const classFile = className === 'Mago' && subclass === 'Tejedor' ? 'identity-mage-ash-pixel.webp' : classFiles[className];
    const raceInfo = raceData[race], genderInfo = genderData[gender], subInfo = subclassData[subclass];
    return {
      class: className, race, gender, subclass,
      classSlug: slug(className), raceSlug: slug(race), genderSlug: genderInfo.key,
      visual: subInfo.visual, mark: subInfo.mark,
      file: classFile, textureKey: 'hero-' + (className === 'Mago' && subclass === 'Tejedor' ? 'mage-ash' : slug(className)),
      scale: raceInfo.scale, filter: raceInfo.filter,
      raceFeature: raceInfo.feature, raceAccent: raceInfo.accent,
      genderFeature: genderInfo.feature, genderAccent: genderInfo.accent,
      accent: subInfo.accent
    };
  }

  function assets() {
    return {
      'hero-warrior': classFiles.Guerrero,
      'hero-rogue': classFiles.Pícaro,
      'hero-mage': classFiles.Mago,
      'hero-mage-ash': 'identity-mage-ash-pixel.webp'
    };
  }

  const api = { classFiles, raceData, genderData, subclassData, profile, assets, slug };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CenizasHeroVisuals = api;
})(typeof window !== 'undefined' ? window : globalThis);
