(function (root) {
  'use strict';

  /* Small, engine-free combat contracts shared by the campaign and tests. */
  const MAX_PI = 5;
  const TECHS = Object.freeze({
    filoUmbrio: Object.freeze({
      id: 'filoUmbrio',
      name: 'Filo Umbrío',
      requires: ['Pícaro', 'Guerrero'],
      cost: 2,
      multiplier: 1.5,
      description: 'El Pícaro marca una grieta y el Guerrero golpea ignorando 2 CA.'
    }),
    llamaArcana: Object.freeze({
      id: 'llamaArcana',
      name: 'Llama Arcana',
      requires: ['Mago', 'Guerrero'],
      cost: 3,
      multiplier: 1.6,
      description: 'El Mago imbuye el arma: fuego en área pequeña en el siguiente golpe.'
    }),
    sombraDoble: Object.freeze({
      id: 'sombraDoble',
      name: 'Sombra Doble',
      requires: ['Pícaro', 'Mago'],
      cost: 2,
      multiplier: 1.5,
      description: 'El Mago ralentiza y el Pícaro garantiza el ataque furtivo.'
    }),
    provocar: Object.freeze({
      id: 'provocar',
      name: 'Provocar',
      requires: ['Guerrero'],
      cost: 1,
      multiplier: 1,
      description: 'El Guerrero quiebra la defensa del objetivo: −2 CA durante este encuentro.'
    })
  });

  const Data = typeof module !== 'undefined' && module.exports ? require('./character-data.js') : root.CenizasCharacterData;
  const classVerbs = Data.classVerbs;
  const raceVerbs = Data.raceVerbs;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const resources = (state = {}) => ({
    pi: clamp(Number.isFinite(state.pi) ? Math.floor(state.pi) : 0, 0, MAX_PI),
    piMax: MAX_PI,
    block: state.block && typeof state.block === 'object' ? { ...state.block } : null,
    blockStreak: Number.isFinite(state.blockStreak) ? Math.max(0, Math.floor(state.blockStreak)) : 0,
    techsUsed: Array.isArray(state.techsUsed) ? state.techsUsed.slice(-20) : []
  });

  function beginBlock(targetId = 'enemy', options = {}) {
    return {
      targetId,
      startedAt: Number.isFinite(options.startedAt) ? options.startedAt : Date.now(),
      duration: Number.isFinite(options.duration) ? options.duration : 1200,
      windowStart: Number.isFinite(options.windowStart) ? options.windowStart : 0.38,
      windowEnd: Number.isFinite(options.windowEnd) ? options.windowEnd : 0.7,
      attempts: 0,
      status: 'pending',
      reduction: 0
    };
  }

  function resolveBlock(block, elapsed, options = {}) {
    if (!block || block.status !== 'pending') return { success: false, ignored: true, reduction: 0, piGain: 0 };
    block.attempts = (block.attempts || 0) + 1;
    const progress = elapsed > 1 ? elapsed / block.duration : elapsed;
    const success = progress >= block.windowStart && progress <= block.windowEnd;
    block.status = success ? 'success' : 'fail';
    block.reduction = success ? clamp(Number(options.reduction) || 0.5, 0.4, 0.6) : 0;
    block.piGain = success ? 1 : 0;
    return { success, reduction: block.reduction, piGain: block.piGain, attempts: block.attempts };
  }

  function partyClasses(party = []) {
    const classes = new Set();
    for (const unit of party) {
      if (!unit || unit.hp <= 0) continue;
      const declared = Array.isArray(unit.classes) ? unit.classes : [unit.class];
      for (const name of declared) if (name) classes.add(name);
    }
    return classes;
  }
  function canUseTech(id, party = [], pi = 0) {
    const tech = TECHS[id];
    if (!tech || pi < tech.cost) return false;
    const classes = partyClasses(party);
    return tech.requires.every(name => classes.has(name));
  }

  function racialSecret(race, place) {
    const data = raceVerbs[race] || raceVerbs.Humano;
    return { id: `${place}:${race}`, race, place, verb: data.verb, promise: data.promise, dialogue: data.dialogue };
  }

  const api = { MAX_PI, TECHS, classVerbs, raceVerbs, resources, beginBlock, resolveBlock, partyClasses, canUseTech, racialSecret };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CenizasCombatSystems = api;
})(typeof window !== 'undefined' ? window : globalThis);
