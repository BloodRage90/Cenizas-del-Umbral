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
      description: 'El Pícaro abre una grieta: el próximo golpe del Guerrero suma +2 daño y −2 CA durante el ciclo.'
    }),
    llamaArcana: Object.freeze({
      id: 'llamaArcana',
      name: 'Llama Arcana',
      requires: ['Mago', 'Guerrero'],
      cost: 3,
      multiplier: 1.6,
      description: 'El Mago imbuye el arma: el próximo golpe del Guerrero añade 1d4 de fuego.'
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
      description: 'El Guerrero quiebra la defensa del objetivo: −2 CA hasta el siguiente ciclo.'
    })
  });

  const Data = typeof module !== 'undefined' && module.exports ? require('./character-data.js') : (root.CenizasCharacterData || {});
  const classVerbs = Data?.classVerbs || {};
  const raceVerbs = Data?.raceVerbs || {};

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

  const racialPlaceDetails = {
    plaza: 'La fuente conserva una marca de tiza bajo el borde.',
    taller: 'El metal repite tu verbo cuando rozas la herramienta correcta.',
    criptas: 'La humedad revela un nombre que no figura en el registro.',
    bosque: 'Las raíces dejan un sendero breve hacia el agua.',
    lindero: 'Una campana rota señala el paso menos expuesto.',
    embarcadero: 'El río devuelve una astilla con el sello de la Vigilia.',
    molino: 'El polvo del molino dibuja una ruta alrededor del eco.',
    monasterio: 'La piedra del claustro guarda dos versiones del mismo juramento.',
    archivo: 'Una ficha desplazada demuestra que el índice fue alterado.',
    enfermeria: 'La cera bajo una cama conserva la última inicial de un cautivo.',
    capilla: 'El vitral proyecta una sílaba cuando la campana queda en silencio.',
    montana: 'El viento ordena las cenizas en dirección a la antesala.',
    antesala: 'El atril reconoce la forma en que pronuncias el relato.',
    umbral: 'La piedra ancla devuelve el eco de tu nombre sin borrarlo.'
  };
  const classHooks = {
    plaza: { Guerrero: 'Maela te pide que protejas la copia física.', Pícaro: 'Maela te confía una marca que no aparece en el mapa.', Mago: 'Maela te pregunta qué tinta resiste a la ceniza.' },
    taller: { Guerrero: 'Ordan te muestra el soporte que solo cede ante un golpe firme.', Pícaro: 'Ordan señala una ranura de mantenimiento para manos precisas.', Mago: 'Ordan pide que leas la resonancia antes de mover la palanca.' },
    monasterio: { Guerrero: 'Sereth mide tu voluntad de responder por quienes caminan contigo.', Pícaro: 'Sereth reconoce que un registro también puede esconderse a plena vista.', Mago: 'Sereth te pregunta qué versión del archivo puede sostenerse ante el Umbral.' },
    umbral: { Guerrero: 'El nombre exige una postura y no una orden.', Pícaro: 'El nombre se esconde entre otros hasta que lo señalas.', Mago: 'El nombre responde a la palabra exacta, no a la fuerza del conjuro.' }
  };
  function racialSecret(race, place, className) {
    const base = raceVerbs[race] || raceVerbs.Humano || { verb: 'Recordar', promise: 'Reconocer las señales del Umbral.', dialogue: 'El Umbral escucha a quien conserva su propia voz.' };
    const data = base[place]?.verb ? base[place] : base;
    const detail = base[place]?.verb ? '' : (racialPlaceDetails[place] || 'El Umbral guarda una pista para quien decide observar.');
    const hook = classHooks[place]?.[className];
    return { id: `${place}:${race}`, race, place, verb: data.verb, promise: `${data.promise}${detail ? ` ${detail}` : ''}`, dialogue: `${data.dialogue}${hook ? ` ${hook}` : ''}` };
  }

  const api = { MAX_PI, TECHS, classVerbs, raceVerbs, resources, beginBlock, resolveBlock, partyClasses, canUseTech, racialSecret };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CenizasCombatSystems = api;
})(typeof window !== 'undefined' ? window : globalThis);
