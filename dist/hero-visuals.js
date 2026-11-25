(function (root) {
  'use strict';

  /*
   * Visual contract shared by the creator, exploration and combat.
   *
   * The four supplied pixel sheets remain the source art, but they are never
   * shown raw anymore. The browser builds a deterministic variant from class,
   * race, gender and subclass, so every playable combination has a distinct
   * sprite without adding 144 large binary files to the repository.
   */
  const classFiles = {
    Guerrero: 'identity-warrior-pixel.webp',
    Pícaro: 'identity-rogue-pixel.webp',
    Mago: 'identity-mage-pixel.webp'
  };
  const classKeys = { Guerrero: 'hero-warrior', Pícaro: 'hero-rogue', Mago: 'hero-mage' };

  const raceData = {
    Humano: { scale: 1, silhouette: [1, 1], filter: 'none', accent: '#d9b56c', feature: 'round', skin: '#c68b68' },
    Elfo: { scale: 1.03, silhouette: [.97, 1.04], filter: 'saturate(1.12) hue-rotate(8deg)', accent: '#a9d6b6', feature: 'ears', skin: '#d3a07f' },
    Enano: { scale: .91, silhouette: [1.08, .86], filter: 'sepia(.13) saturate(.92) contrast(1.06)', accent: '#c58d62', feature: 'beard', skin: '#b97b59' },
    Orco: { scale: 1.12, silhouette: [1.08, 1.1], filter: 'saturate(.72) sepia(.3) hue-rotate(26deg) contrast(1.08)', accent: '#92a85d', feature: 'tusks', skin: '#718a4e' },
    Mediano: { scale: .78, silhouette: [.8, .8], filter: 'saturate(1.08) brightness(1.04)', accent: '#e2bc7a', feature: 'small', skin: '#d39b70' },
    Gnomo: { scale: .83, silhouette: [.76, .76], filter: 'saturate(.98) hue-rotate(-7deg) brightness(1.04)', accent: '#d8a1d2', feature: 'cap', skin: '#d7a27d' },
    Semielfo: { scale: 1, silhouette: [1, 1], filter: 'saturate(1.04) hue-rotate(2deg)', accent: '#b9d0b2', feature: 'half-ears', skin: '#c99576' },
    Semiorco: { scale: 1.08, silhouette: [1.05, 1.06], filter: 'saturate(.82) sepia(.2) hue-rotate(25deg) contrast(1.08)', accent: '#a9a36b', feature: 'half-tusks', skin: '#8f8256' }
  };
  const genderData = {
    Mujer: { key: 'woman', accent: '#e6a3b8', feature: 'ribbon', hair: '#9a6044' },
    Hombre: { key: 'man', accent: '#9eb9d1', feature: 'braid', hair: '#4a3029' },
    'No binario': { key: 'nonbinary', accent: '#b9aaf4', feature: 'sash', hair: '#6f516d' }
  };
  const subclassData = {
    Guardia: { class: 'Guerrero', visual: 'guardian', accent: '#d9b56c', mark: 'shield', equipment: 'escudo-capa' },
    Berserker: { class: 'Guerrero', visual: 'berserker', accent: '#e47f5f', mark: 'rage', equipment: 'hacha-furia' },
    Sombra: { class: 'Pícaro', visual: 'shadow', accent: '#8fc8b1', mark: 'crescent', equipment: 'capucha-dagas' },
    Explorador: { class: 'Pícaro', visual: 'scout', accent: '#c7d98c', mark: 'compass', equipment: 'arco-rastreo' },
    Arcanista: { class: 'Mago', visual: 'arcane', accent: '#b9aaf4', mark: 'rune', equipment: 'baston-runa' },
    Tejedor: { class: 'Mago', visual: 'ash-weaver', accent: '#d6a17c', mark: 'ember', equipment: 'manto-ceniza' }
  };
  const defaults = { Guerrero: 'Guardia', Pícaro: 'Sombra', Mago: 'Arcanista' };
  // Anchors are expressed in pixels of one source frame. They keep race and
  // presentation details attached to the actual head/hands instead of
  // floating at percentages of the card. The four supplied sheets use the
  // same 2×2 pose layout; the mage sheet has a 627px frame and the warrior /
  // rogue sheets a 656px frame.
  const heroAnchors = {
    'identity-warrior-pixel.webp': { frame: 656, head: [330, 116], handR: [455, 320], handL: [245, 320], feet: [330, 560] },
    'identity-rogue-pixel.webp': { frame: 656, head: [330, 116], handR: [455, 320], handL: [245, 320], feet: [330, 560] },
    'identity-mage-pixel.webp': { frame: 627, head: [318, 116], handR: [456, 318], handL: [225, 320], feet: [318, 580] },
    'identity-mage-ash-pixel.webp': { frame: 627, head: [318, 116], handR: [456, 318], handL: [225, 320], feet: [318, 580] }
  };
  const slug = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const valid = (table, value, fallback) => Object.prototype.hasOwnProperty.call(table, value) ? value : fallback;

  function variantKey({ className, race, gender, subclass }) {
    return `hero-${classKeys[className]}-${slug(race)}-${genderData[gender].key}-${slug(subclass)}`;
  }

  function profile(character = {}) {
    const className = valid(classFiles, character.class, 'Guerrero');
    const race = valid(raceData, character.race, 'Humano');
    const gender = valid(genderData, character.gender, 'No binario');
    const subclass = subclassData[character.subclass]?.class === className ? character.subclass : defaults[className];
    const classFile = className === 'Mago' && subclass === 'Tejedor' ? 'identity-mage-ash-pixel.webp' : classFiles[className];
    const baseTextureKey = className === 'Mago' && subclass === 'Tejedor' ? 'hero-mage-ash' : classKeys[className];
    const raceInfo = raceData[race], genderInfo = genderData[gender], subInfo = subclassData[subclass];
    const key = variantKey({ className, race, gender, subclass });
    return {
      class: className, race, gender, subclass,
      classSlug: slug(className), raceSlug: slug(race), genderSlug: genderInfo.key,
      visual: subInfo.visual, mark: subInfo.mark, file: classFile, baseTextureKey,
      textureKey: key, variantKey: key, scale: raceInfo.scale, filter: raceInfo.filter,
      raceFeature: raceInfo.feature, raceAccent: raceInfo.accent, raceSkin: raceInfo.skin,
      genderFeature: genderInfo.feature, genderAccent: genderInfo.accent, genderHair: genderInfo.hair,
      accent: subInfo.accent, subclassEquipment: subInfo.equipment,
      silhouette: raceInfo.silhouette || [1, 1]
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

  function polygon(ctx, points, fill, stroke = '#241a16', width = 4) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.lineWidth = width; ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  function drawVariantFrame(ctx, x, y, width, height, spec) {
    const u = Math.min(width, height) / 100;
    const cx = x + width * .5;
    const headY = y + height * .255;
    const bodyY = y + height * .44;
    const skin = spec.raceSkin || '#c68b68';
    const dark = '#241a16';
    const race = spec.raceAccent || spec.accent;
    const sub = spec.accent || '#d9b56c';
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.lineJoin = 'miter';

    /* Race is carried by the silhouette, not just a hue filter. */
    if (spec.raceFeature === 'ears' || spec.raceFeature === 'half-ears') {
      const reach = spec.raceFeature === 'ears' ? 18 : 12;
      polygon(ctx, [[cx - 10 * u, headY], [cx - (32 + reach) * u, headY - 16 * u], [cx - 23 * u, headY + 9 * u]], skin, dark, 3);
      polygon(ctx, [[cx + 10 * u, headY], [cx + (32 + reach) * u, headY - 16 * u], [cx + 23 * u, headY + 9 * u]], skin, dark, 3);
    }
    if (spec.raceFeature === 'beard') {
      polygon(ctx, [[cx - 20 * u, headY + 13 * u], [cx + 20 * u, headY + 13 * u], [cx + 14 * u, headY + 34 * u], [cx, headY + 44 * u], [cx - 14 * u, headY + 34 * u]], '#6d4436', dark, 3);
      ctx.fillStyle = '#b2784e'; ctx.fillRect(cx - 9 * u, headY + 20 * u, 18 * u, 4 * u);
    }
    if (spec.raceFeature === 'tusks' || spec.raceFeature === 'half-tusks') {
      const amount = spec.raceFeature === 'tusks' ? 10 : 6;
      ctx.globalAlpha = spec.raceFeature === 'tusks' ? .3 : .2; ctx.fillStyle = skin; ctx.beginPath(); ctx.ellipse(cx, headY + 9 * u, 21 * u, 22 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      polygon(ctx, [[cx - 11 * u, headY + 18 * u], [cx - 3 * u, headY + 18 * u], [cx - 7 * u, headY + (18 + amount) * u]], '#f7e3b1', dark, 2);
      polygon(ctx, [[cx + 11 * u, headY + 18 * u], [cx + 3 * u, headY + 18 * u], [cx + 7 * u, headY + (18 + amount) * u]], '#f7e3b1', dark, 2);
    }
    if (spec.raceFeature === 'cap') {
      polygon(ctx, [[cx - 27 * u, headY - 11 * u], [cx + 27 * u, headY - 11 * u], [cx + 2 * u, headY - 37 * u], [cx - 7 * u, headY - 22 * u]], race, dark, 3);
      ctx.strokeStyle = '#f3d68f'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(cx - 20 * u, headY - 11 * u); ctx.lineTo(cx + 20 * u, headY - 11 * u); ctx.stroke();
    }
    if (spec.raceFeature === 'small') {
      ctx.fillStyle = race; ctx.globalAlpha = .9; ctx.fillRect(cx - 20 * u, bodyY + 34 * u, 40 * u, 4 * u); ctx.globalAlpha = 1;
    }

    /* Gender presentation is an actual accessory with a different shape. */
    ctx.lineWidth = 3 * u;
    if (spec.genderFeature === 'ribbon') {
      ctx.strokeStyle = spec.genderAccent; ctx.beginPath(); ctx.moveTo(cx + 20 * u, headY - 16 * u); ctx.lineTo(cx + 30 * u, headY + 19 * u); ctx.lineTo(cx + 22 * u, headY + 34 * u); ctx.stroke();
      ctx.fillStyle = spec.genderHair; ctx.fillRect(cx + 18 * u, headY - 18 * u, 7 * u, 24 * u);
    } else if (spec.genderFeature === 'braid') {
      ctx.strokeStyle = spec.genderAccent; ctx.beginPath(); ctx.moveTo(cx - 20 * u, headY - 15 * u); ctx.lineTo(cx - 30 * u, headY + 10 * u); ctx.lineTo(cx - 22 * u, headY + 29 * u); ctx.stroke();
      ctx.fillStyle = spec.genderHair; ctx.fillRect(cx - 26 * u, headY - 18 * u, 8 * u, 23 * u);
    } else {
      ctx.strokeStyle = spec.genderAccent; ctx.beginPath(); ctx.moveTo(cx - 29 * u, bodyY + 4 * u); ctx.lineTo(cx + 27 * u, bodyY + 30 * u); ctx.stroke();
      ctx.fillStyle = spec.genderAccent; ctx.fillRect(cx + 19 * u, bodyY + 24 * u, 10 * u, 7 * u);
    }

    /* Subclass equipment is a small physical cue, never a floating debug glyph. */
    const gearX = x + width * .78, gearY = y + height * .53;
    ctx.strokeStyle = sub; ctx.fillStyle = sub; ctx.lineWidth = 3 * u;
    if (spec.mark === 'shield') {
      polygon(ctx, [[gearX - 7 * u, gearY - 9 * u], [gearX + 7 * u, gearY - 9 * u], [gearX + 6 * u, gearY + 8 * u], [gearX, gearY + 13 * u], [gearX - 6 * u, gearY + 8 * u]], sub, dark, 2);
      ctx.strokeStyle = '#f9e6a9'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.moveTo(gearX, gearY - 5 * u); ctx.lineTo(gearX, gearY + 6 * u); ctx.stroke();
    } else if (spec.mark === 'rage') {
      ctx.strokeStyle = '#e47f5f'; ctx.lineWidth = 4 * u; ctx.beginPath(); ctx.moveTo(gearX - 5 * u, gearY + 10 * u); ctx.lineTo(gearX + 7 * u, gearY - 11 * u); ctx.stroke(); ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(gearX + 2 * u, gearY - 10 * u); ctx.lineTo(gearX + 11 * u, gearY - 4 * u); ctx.stroke();
    } else if (spec.mark === 'crescent') {
      ctx.strokeStyle = '#8fc8b1'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(gearX - 8 * u, gearY + 10 * u); ctx.lineTo(gearX + 9 * u, gearY - 12 * u); ctx.stroke();
    } else if (spec.mark === 'compass') {
      ctx.strokeStyle = '#c7d98c'; ctx.lineWidth = 2 * u; ctx.beginPath(); ctx.arc(gearX, gearY, 8 * u, 0, Math.PI * 2); ctx.moveTo(gearX - 10 * u, gearY); ctx.lineTo(gearX + 10 * u, gearY); ctx.stroke();
    } else if (spec.mark === 'rune') {
      ctx.strokeStyle = '#b9aaf4'; ctx.lineWidth = 3 * u; ctx.beginPath(); ctx.moveTo(gearX, gearY + 12 * u); ctx.lineTo(gearX, gearY - 7 * u); ctx.stroke(); ctx.fillStyle = '#dcd3ff'; ctx.beginPath(); ctx.arc(gearX, gearY - 10 * u, 7 * u, 0, Math.PI * 2); ctx.fill();
    } else if (spec.mark === 'ember') {
      ctx.shadowColor = '#d6a17c'; ctx.shadowBlur = 8 * u; ctx.fillStyle = '#d6a17c'; ctx.beginPath(); ctx.arc(gearX, gearY - 3 * u, 8 * u, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  function anchorFor(spec) {
    return heroAnchors[spec.file] || heroAnchors['identity-warrior-pixel.webp'];
  }

  /* Draw only details that are anchored to the source pose. This replaces the
   * old card-relative polygons and keeps the visual identity on the head or
   * hands when the sprite is resized, flipped or shown in combat. */
  function drawAnchoredTraits(ctx, x, y, width, height, spec) {
    const anchor = anchorFor(spec), factor = width / anchor.frame;
    const [headX, headY] = anchor.head.map(value => value * factor);
    const [handX, handY] = anchor.handR.map(value => value * factor);
    const [leftX, leftY] = anchor.handL.map(value => value * factor);
    const skin = spec.raceSkin || '#c68b68';
    const accent = spec.raceAccent || spec.accent || '#d9b56c';
    const gender = spec.genderAccent || '#b9aaf4';
    const cx = x + headX, cy = y + headY;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.lineWidth = Math.max(2, factor * 3);
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    if (spec.raceFeature === 'ears' || spec.raceFeature === 'half-ears') {
      const reach = spec.raceFeature === 'ears' ? 19 : 12;
      polygon(ctx, [[cx - 7 * factor, cy], [cx - (28 + reach) * factor, cy - 12 * factor], [cx - 19 * factor, cy + 8 * factor]], skin, '#241a16', 2 * factor);
      polygon(ctx, [[cx + 7 * factor, cy], [cx + (28 + reach) * factor, cy - 12 * factor], [cx + 19 * factor, cy + 8 * factor]], skin, '#241a16', 2 * factor);
    } else if (spec.raceFeature === 'beard') {
      polygon(ctx, [[cx - 16 * factor, cy + 9 * factor], [cx + 16 * factor, cy + 9 * factor], [cx, cy + 28 * factor]], '#6d4436', '#241a16', 2 * factor);
    } else if (spec.raceFeature === 'tusks' || spec.raceFeature === 'half-tusks') {
      const length = spec.raceFeature === 'tusks' ? 10 : 6;
      polygon(ctx, [[cx - 9 * factor, cy + 11 * factor], [cx - 3 * factor, cy + 11 * factor], [cx - 6 * factor, cy + (11 + length) * factor]], '#f7e3b1', '#241a16', factor);
      polygon(ctx, [[cx + 9 * factor, cy + 11 * factor], [cx + 3 * factor, cy + 11 * factor], [cx + 6 * factor, cy + (11 + length) * factor]], '#f7e3b1', '#241a16', factor);
    } else if (spec.raceFeature === 'cap') {
      polygon(ctx, [[cx - 20 * factor, cy - 8 * factor], [cx + 20 * factor, cy - 8 * factor], [cx + 2 * factor, cy - 27 * factor], [cx - 6 * factor, cy - 17 * factor]], accent, '#241a16', 2 * factor);
    }
    ctx.strokeStyle = gender;
    ctx.lineWidth = Math.max(2, factor * 3);
    if (spec.genderFeature === 'ribbon') {
      ctx.beginPath(); ctx.moveTo(cx + 16 * factor, cy - 12 * factor); ctx.lineTo(cx + 25 * factor, cy + 15 * factor); ctx.stroke();
    } else if (spec.genderFeature === 'braid') {
      ctx.beginPath(); ctx.moveTo(cx - 16 * factor, cy - 12 * factor); ctx.lineTo(cx - 25 * factor, cy + 15 * factor); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.moveTo(x + leftX, y + leftY + 26 * factor); ctx.lineTo(x + handX, y + handY + 15 * factor); ctx.stroke();
    }
    /* Each subclass has a physical silhouette/equipment cue. These are
     * deliberately anchored to the source pose, so the creator, exploration
     * and combat previews show the same readable role without inventing six
     * separate binary sprite sheets. */
    const bodyX = x + width * .5, shoulderY = y + height * .4, hipY = y + height * .7;
    const rightHand = [x + handX, y + handY], leftHand = [x + leftX, y + leftY];
    ctx.lineJoin = 'miter'; ctx.lineCap = 'square'; ctx.strokeStyle = spec.accent || accent; ctx.fillStyle = spec.accent || accent; ctx.lineWidth = Math.max(2, factor * 3);
    if (spec.mark === 'shield') {
      polygon(ctx, [[bodyX - width * .22, shoulderY], [bodyX - width * .02, shoulderY - height * .035], [bodyX + width * .18, shoulderY + height * .025], [bodyX + width * .13, hipY], [bodyX - width * .18, hipY - height * .01]], spec.accent + '55', spec.accent, Math.max(2, factor * 2));
      polygon(ctx, [[leftHand[0] - 12 * factor, leftHand[1] - 16 * factor], [leftHand[0] + 13 * factor, leftHand[1] - 13 * factor], [leftHand[0] + 10 * factor, leftHand[1] + 18 * factor], [leftHand[0], leftHand[1] + 28 * factor], [leftHand[0] - 11 * factor, leftHand[1] + 18 * factor]], spec.accent, '#241a16', Math.max(2, factor * 2));
      ctx.strokeStyle = '#f9e6a9'; ctx.lineWidth = Math.max(2, factor * 2); ctx.beginPath(); ctx.moveTo(leftHand[0], leftHand[1] - 10 * factor); ctx.lineTo(leftHand[0], leftHand[1] + 17 * factor); ctx.stroke();
    } else if (spec.mark === 'rage') {
      polygon(ctx, [[bodyX - width * .24, shoulderY + height * .02], [bodyX - width * .07, shoulderY - height * .07], [bodyX + width * .02, hipY], [bodyX - width * .28, hipY - height * .03]], '#6f2f2b99', '#e47f5f', Math.max(2, factor * 2));
      const axeX = rightHand[0], axeY = rightHand[1] - 4 * factor; ctx.strokeStyle = '#d7c7a0'; ctx.lineWidth = Math.max(2, factor * 3); ctx.beginPath(); ctx.moveTo(axeX - 4 * factor, axeY + 22 * factor); ctx.lineTo(axeX + 12 * factor, axeY - 20 * factor); ctx.stroke();
      polygon(ctx, [[axeX + 3 * factor, axeY - 18 * factor], [axeX + 25 * factor, axeY - 26 * factor], [axeX + 17 * factor, axeY - 4 * factor], [axeX + 3 * factor, axeY + 2 * factor]], '#e47f5f', '#241a16', Math.max(2, factor * 2));
    } else if (spec.mark === 'crescent') {
      polygon(ctx, [[cx - 25 * factor, cy - 4 * factor], [cx - 18 * factor, cy - 26 * factor], [cx + 18 * factor, cy - 26 * factor], [cx + 25 * factor, cy - 4 * factor], [cx + 17 * factor, cy + 8 * factor], [cx - 17 * factor, cy + 8 * factor]], '#172630dd', '#8fc8b1', Math.max(2, factor * 2));
      ctx.strokeStyle = '#e7f5dd'; ctx.lineWidth = Math.max(2, factor * 2); ctx.beginPath(); ctx.moveTo(rightHand[0], rightHand[1] - 4 * factor); ctx.lineTo(rightHand[0] + 17 * factor, rightHand[1] + 17 * factor); ctx.moveTo(leftHand[0], leftHand[1] - 4 * factor); ctx.lineTo(leftHand[0] - 15 * factor, leftHand[1] + 17 * factor); ctx.stroke();
    } else if (spec.mark === 'compass') {
      polygon(ctx, [[bodyX - width * .21, shoulderY], [bodyX + width * .2, shoulderY], [bodyX + width * .15, hipY], [bodyX, hipY + height * .035], [bodyX - width * .15, hipY]], '#43604a99', '#c7d98c', Math.max(2, factor * 2));
      ctx.strokeStyle = '#d7e7b1'; ctx.lineWidth = Math.max(2, factor * 2); ctx.beginPath(); ctx.arc(rightHand[0], rightHand[1], 28 * factor, -1.2, 1.2); ctx.moveTo(rightHand[0] - 8 * factor, rightHand[1] - 18 * factor); ctx.lineTo(rightHand[0] + 32 * factor, rightHand[1] - 35 * factor); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(leftHand[0] - 11 * factor, leftHand[1] - 14 * factor); ctx.lineTo(leftHand[0] + 10 * factor, leftHand[1] + 10 * factor); ctx.stroke();
    } else if (spec.mark === 'rune') {
      polygon(ctx, [[bodyX - width * .17, shoulderY], [bodyX + width * .17, shoulderY], [bodyX + width * .11, hipY + height * .02], [bodyX, hipY + height * .06], [bodyX - width * .11, hipY + height * .02]], '#433b6f99', '#b9aaf4', Math.max(2, factor * 2));
      ctx.strokeStyle = '#e2d8ff'; ctx.lineWidth = Math.max(2, factor * 2); ctx.beginPath(); ctx.moveTo(rightHand[0], rightHand[1] + 22 * factor); ctx.lineTo(rightHand[0], rightHand[1] - 65 * factor); ctx.stroke(); ctx.fillStyle = '#dcd3ff'; ctx.beginPath(); ctx.arc(rightHand[0], rightHand[1] - 71 * factor, 10 * factor, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#b9aaf4'; ctx.beginPath(); ctx.arc(cx, cy - 6 * factor, 38 * factor, 0, Math.PI * 2); ctx.stroke();
    } else if (spec.mark === 'ember') {
      polygon(ctx, [[bodyX - width * .22, shoulderY], [bodyX + width * .18, shoulderY - height * .015], [bodyX + width * .3, hipY + height * .05], [bodyX + width * .06, hipY], [bodyX - width * .2, hipY + height * .04]], '#5f3a2fbb', '#d6a17c', Math.max(2, factor * 2));
      ctx.strokeStyle = '#e7c39d'; ctx.lineWidth = Math.max(2, factor * 2); ctx.beginPath(); ctx.moveTo(rightHand[0], rightHand[1] + 20 * factor); ctx.lineTo(rightHand[0] + 5 * factor, rightHand[1] - 45 * factor); ctx.stroke();
      for (let i = 0; i < 3; i++) { const ex = rightHand[0] + (i - 1) * 17 * factor, ey = rightHand[1] - (38 + (i % 2) * 12) * factor; ctx.fillStyle = i === 1 ? '#f5e2a7' : '#d6a17c'; ctx.beginPath(); ctx.arc(ex, ey, (5 + i) * factor, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }

  function render(character = {}, options = {}) {
    const spec = character.variantKey ? character : profile(character);
    const source = options.source;
    const columns = options.columns || 2, rows = options.rows || 2;
    const frame = Math.max(0, Math.floor(options.frame || 0));
    const size = Math.max(32, Math.floor(options.size || 256));
    const canvas = (typeof document !== 'undefined') ? document.createElement('canvas') : null;
    if (!canvas) return { variantKey: spec.variantKey, spec };
    canvas.width = size; canvas.height = size; canvas.dataset.variantKey = spec.variantKey;
    const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    if (source?.naturalWidth || source?.width) {
      const sw = (source.naturalWidth || source.width) / columns;
      const sh = (source.naturalHeight || source.height) / rows;
      const sx = (frame % columns) * sw, sy = Math.floor(frame / columns) * sh;
      ctx.save(); ctx.filter = spec.filter || 'none';
      const silhouette = spec.silhouette || [1, 1];
      const drawW = size * silhouette[0], drawH = size * silhouette[1];
      ctx.drawImage(source, sx, sy, sw, sh, (size - drawW) / 2, size - drawH, drawW, drawH); ctx.restore();
      drawAnchoredTraits(ctx, (size - drawW) / 2, size - drawH, drawW, drawH, spec);
    } else {
      drawAnchoredTraits(ctx, 0, 0, size, size, spec);
    }
    return canvas;
  }

  function paintVariantCanvas(ctx, source, spec, columns = 2, rows = 2) {
    if (!ctx || !source) return;
    const width = source.width, height = source.height;
    ctx.clearRect(0, 0, width, height); ctx.imageSmoothingEnabled = false;
    ctx.save(); try { ctx.filter = spec.filter || 'none'; } catch { /* old WebViews ignore canvas filters */ }
    ctx.drawImage(source, 0, 0, width, height); ctx.restore();
    const frameWidth = width / columns, frameHeight = height / rows;
    for (let row = 0; row < rows; row++) for (let column = 0; column < columns; column++) drawAnchoredTraits(ctx, column * frameWidth, row * frameHeight, frameWidth, frameHeight, spec);
  }

  const api = { classFiles, raceData, genderData, subclassData, profile, assets, variantKey, render, paintVariantCanvas, heroAnchors, slug };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CenizasHeroVisuals = api;
})(typeof window !== 'undefined' ? window : globalThis);
