(function (root) {
  'use strict';

  /* Canonical character rules shared by the creator, exploration and combat.
   * Keep this file dependency-free: it is loaded before the other plain
   * scripts in the browser and can also be required by Node tests. */
  const names = ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'];
  const short = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
  const skillNames = ['Abrir cerraduras', 'Artesanía', 'Averiguar intenciones', 'Avistar', 'Buscar', 'Concentración', 'Conocimiento de conjuros', 'Descifrar escritura', 'Diplomacia', 'Engañar', 'Equilibrio', 'Escapismo', 'Esconderse', 'Escuchar', 'Inutilizar mecanismo', 'Intimidar', 'Montar', 'Moverse sigilosamente', 'Nadar', 'Reunir información', 'Saber (arcano)', 'Saber (local)', 'Saltar', 'Trato con animales', 'Trepar', 'Piruetas', 'Usar objeto mágico'];
  const costs = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 8, 16: 10, 17: 13, 18: 16 };

  const classes = {
    Guerrero: { icon: '⚔', tag: 'Acero y resistencia', hp: 10, bab: 1, saves: [2, 0, 0], sp: 2, armor: 4, maxDex: 4, acp: -3, shield: 1, weapon: 'Espada larga', damage: '1d8', damageDie: 8, critical: '19–20 / ×2', pres: [16, 14, 14, 12, 10, 8], gear: 'Camisote de mallas, escudo ligero de madera, espada larga, mochila, pedernal, odre y raciones para 3 días.', features: 'Competencia con armas sencillas y marciales, todas las armaduras y escudos. Dote adicional de combate.' },
    Pícaro: { icon: '◇', tag: 'Sigilo y astucia', hp: 6, bab: 0, saves: [0, 2, 0], sp: 8, armor: 2, maxDex: 6, acp: 0, shield: 0, weapon: 'Espada corta', damage: '1d6', damageDie: 6, critical: '19–20 / ×2', pres: [12, 16, 14, 14, 10, 8], gear: 'Armadura de cuero, espada corta, herramientas de ladrón, mochila, pedernal, odre y raciones para 3 días.', features: 'Ataque furtivo +1d6 cuando el objetivo pierde su bono de Destreza a CA o está flanqueado (con sus restricciones). Encontrar trampas.' },
    Mago: { icon: '✧', tag: 'Conocimiento arcano', hp: 4, bab: 0, saves: [0, 0, 2], sp: 2, armor: 0, maxDex: 99, acp: 0, shield: 0, weapon: 'Bastón (dos manos)', damage: '1d6', damageDie: 6, critical: '20 / ×2', pres: [8, 14, 14, 16, 12, 10], gear: 'Bastón, libro de conjuros, bolsa de componentes, mochila, pedernal, odre y raciones para 3 días.', features: 'Mago generalista. Inscribir rollo de pergamino como dote de clase. Familiar: sapo, que otorga +3 PG mientras permanece a 1,5 km o menos (incluido en la hoja).' }
  };

  /* The campaign gives the level-1 wizard a small survivability floor. The
   * familiar remains a narrative feature, while the extra hit die keeps one
   * early mistake from ending a run before the player learns timing. */
  classes.Mago.hp = 6;

  /* D&D 3.5 modifiers. The Orc has −2 INT, −2 WIS and −2 CHA; the
   * Half-orc has +2 STR and −2 CHA. Small races get the size package below. */
  const raceData = {
    Humano: { mods: [0, 0, 0, 0, 0, 0], speed: 9, size: 'M', skill: '', skillBonuses: {}, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '◇', traits: ['Dote adicional', '4 puntos de habilidad adicionales en nivel 1'], text: 'Humano: versatilidad humana, 1 dote adicional y 4 puntos extra de habilidad en nivel 1. Velocidad: 9 m.' },
    Elfo: { mods: [0, 2, -2, 0, 0, 0], speed: 9, size: 'M', skill: 'Avistar|Buscar|Escuchar', skillBonuses: { Avistar: 2, Buscar: 2, Escuchar: 2 }, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '✧', traits: ['Visión en la penumbra', 'Sentidos agudos'], text: 'Elfo: +2 Destreza, −2 Constitución, sentidos agudos y visión en la penumbra. Velocidad: 9 m.' },
    Enano: { mods: [0, 0, 2, 0, 0, -2], speed: 6, size: 'M', skill: '', skillBonuses: {}, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '⬟', traits: ['Visión en la oscuridad'], text: 'Enano: +2 Constitución, −2 Carisma y visión en la oscuridad. Velocidad: 6 m.' },
    Orco: { mods: [4, 0, 0, -2, -2, -2], speed: 9, size: 'M', skill: 'Intimidar', skillBonuses: { Intimidar: 2 }, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '◆', traits: ['Visión en la oscuridad', 'Intimidar'], text: 'Orco: +4 Fuerza, −2 Inteligencia, −2 Sabiduría y −2 Carisma; una presencia intimidante y visión en la oscuridad. Velocidad: 9 m.' },
    Mediano: { mods: [-2, 2, 0, 0, 0, 0], speed: 6, size: 'S', skill: 'Moverse sigilosamente|Saltar', skillBonuses: { 'Moverse sigilosamente': 2, Saltar: 2 }, acBonus: 1, attackBonus: 1, damageDiePenalty: 2, sigil: '•', traits: ['Bonificador de tamaño pequeño'], text: 'Mediano: −2 Fuerza, +2 Destreza; tamaño Pequeño: +1 CA, +1 ataque y daño reducido. Velocidad: 6 m.' },
    Gnomo: { mods: [-2, 0, 2, 0, 0, 0], speed: 6, size: 'S', skill: 'Inutilizar mecanismo|Saber (arcano)', skillBonuses: { 'Inutilizar mecanismo': 2, 'Saber (arcano)': 2 }, acBonus: 1, attackBonus: 1, damageDiePenalty: 2, sigil: '✿', traits: ['Bonificador de tamaño pequeño', '+2 a mecanismos e ilusiones'], text: 'Gnomo: −2 Fuerza, +2 Constitución; tamaño Pequeño: +1 CA, +1 ataque y daño reducido. +2 a Inutilizar mecanismo y Saber (arcano). Velocidad: 6 m.' },
    Semielfo: { mods: [0, 0, 0, 0, 0, 0], speed: 9, size: 'M', skill: 'Diplomacia|Reunir información', skillBonuses: { Diplomacia: 2, 'Reunir información': 2 }, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '◈', traits: ['Adaptabilidad', '+2 Diplomacia y Reunir información'], text: 'Semielfo: herencia dual, adaptable y diplomática; +2 Diplomacia y Reunir información. Velocidad: 9 m.' },
    Semiorco: { mods: [2, 0, 0, 0, 0, -2], speed: 9, size: 'M', skill: 'Intimidar', skillBonuses: { Intimidar: 2 }, acBonus: 0, attackBonus: 0, damageDiePenalty: 0, sigil: '✹', traits: ['Visión en la oscuridad', 'Intimidar'], text: 'Semiorco: +2 Fuerza, −2 Carisma; vigor de orco con más dominio de las ciudades. Velocidad: 9 m.' }
  };

  const subclassData = {
    Guerrero: [['Guardia', 'Guardia del puente', '✦', 'guardian', '#d9b56c'], ['Berserker', 'Berserker de ceniza', '✹', 'berserker', '#e47f5f']],
    Pícaro: [['Sombra', 'Sombra', '◈', 'shadow', '#8fc8b1'], ['Explorador', 'Explorador', '✧', 'scout', '#c7d98c']],
    Mago: [['Arcanista', 'Arcanista', '✧', 'arcane', '#b9aaf4'], ['Tejedor', 'Tejedor de ceniza', '◌', 'ash-weaver', '#d6a17c']]
  };

  const subclassRules = {
    Guardia: { class: 'Guerrero', label: 'Guardia', ac: 2, damage: 0, initiative: 0, sneakDie: 0, spellSlots: 0, ranged: 0, description: '+2 CA mientras mantienes una postura de guardia.' },
    Berserker: { class: 'Guerrero', label: 'Berserker', ac: -2, damage: 2, initiative: 0, sneakDie: 0, spellSlots: 0, ranged: 0, description: '+2 daño y −2 CA: la furia de ceniza no permite medias tintas.' },
    Sombra: { class: 'Pícaro', label: 'Sombra', ac: 0, damage: 0, initiative: 2, sneakDie: 2, spellSlots: 0, ranged: 0, action: 'finta', description: 'Finta de sombra: asegura el próximo ataque furtivo y suma 1d8 adicional.' },
    Explorador: { class: 'Pícaro', label: 'Explorador', ac: 1, damage: 0, initiative: 2, sneakDie: 0, spellSlots: 0, ranged: 2, action: 'marcar', description: 'Marca del rastreador: +2 iniciativa, +2 alcance y objetivo vulnerable.' },
    Arcanista: { class: 'Mago', label: 'Arcanista', ac: 0, damage: 0, initiative: 0, sneakDie: 0, spellSlots: 1, ranged: 0, spellDC: 1, action: 'canalizar', description: '+1 espacio de conjuro y +1 a la CD de conjuros.' },
    Tejedor: { class: 'Mago', label: 'Tejedor', ac: 0, damage: 1, initiative: 0, sneakDie: 0, spellSlots: 0, ranged: 2, spellDC: 0, action: 'canalizar', description: 'Proyectil de ceniza: +2 alcance y +1 daño mágico.' }
  };
  const classVerbs = {
    Guerrero: { explore: 'Embate', combat: 'Provocar', cost: 1, promise: 'Aguantas golpes, rompes guardias y generas ventaja para tu equipo.', example: 'Provocar · 1 PI → −2 CA al objetivo → golpe pesado.' },
    Pícaro: { explore: 'Registro rápido', combat: 'Marca del Cazador', promise: 'Creas aperturas: marcas, distraes y castigas al distraído.', example: 'Marca → espera la apertura → remata con furtivo.' },
    Mago: { explore: 'Discernir', combat: 'Canalizar', promise: 'Controlas el campo: conviertes un turno en tres.', example: 'Canaliza 1 PI → acepta −2 CA → lanza sin gastar espacio.' }
  };
  const raceVerbs = {
    Humano: { verb: 'Negociar', promise: 'Tu experiencia te permite elegir una respuesta adaptable en cada secreto.', dialogue: 'La guardia escucha tu propuesta antes de cerrar el puente.' },
    Elfo: { verb: 'Percibir', promise: 'Lees la vida escondida entre la vegetación y las inscripciones naturales.', dialogue: 'Las hojas te muestran una escritura que nadie más ve.' },
    Enano: { verb: 'Forjar memoria', promise: 'Reconoces la huella de una compuerta y la dejas registrada.', dialogue: 'El metal vibra bajo tus dedos: reconoces el cierre de la compuerta.' },
    Orco: { verb: 'Intimidar', promise: 'Tu presencia cambia el tono de quienes intentan negar lo ocurrido.', dialogue: 'El encargado retrocede al ver tus colmillos y deja de fingir.' },
    Mediano: { verb: 'Escabullirse', promise: 'Encuentras una rendija y recuperas un recuerdo que otros pasan por alto.', dialogue: 'La criatura del hueco te hace sitio: está acostumbrada a tu tamaño.' },
    Gnomo: { verb: 'Colarse', promise: 'Sigues señales diminutas y descubres una versión inesperada del mito.', dialogue: 'Un ratón de ceniza te responde con un mapa diminuto.' },
    Semielfo: { verb: 'Tender puentes', promise: 'Sostienes dos relatos a la vez y evitas que uno borre al otro.', dialogue: 'La inscripción cambia al oír tu voz y muestra dos caminos.' },
    Semiorco: { verb: 'Imponerse', promise: 'Nombras el daño sin dejar que te conviertan en una caricatura.', dialogue: 'El mercader reconoce tu determinación y ofrece una salida justa.' }
  };
  /*
   * The racial interaction is deliberately additive.  Keep the canonical
   * verb/promise/dialogue above for the creator card, then expose a small
   * scene-specific contract at raceVerbs[race][place].  The campaign can use
   * it without adding hidden modifiers or changing any ending flags.
   */
  const racialPlaceLines = {
    plaza: ['Bajo la fuente encuentras una marca que la lluvia no borra.', 'La plaza conserva una respuesta para quien se detiene a escuchar.'],
    taller: ['El banco de trabajo devuelve un eco cuando reconoces su uso.', 'Ordan ha dejado una señal que solo se entiende desde tu oficio.'],
    criptas: ['La humedad deja visible una inicial que el registro omitió.', 'El pasillo responde a tu forma de nombrar lo que falta.'],
    bosque: ['Las raíces se apartan lo justo para revelar el sendero del agua.', 'El bosque devuelve una pista, no una orden.'],
    lindero: ['Una campana rota marca el borde menos expuesto del camino.', 'El lindero recuerda quién pasó sin romper la senda.'],
    embarcadero: ['El río trae una astilla con el sello de la Vigilia.', 'La corriente conserva pruebas que no caben en un acta.'],
    molino: ['El polvo traza una ruta alrededor del eco del molino.', 'La rueda repite un nombre cuando la miras desde el ángulo correcto.'],
    monasterio: ['La piedra del claustro guarda dos versiones del juramento.', 'El patio deja espacio para que convivan dos testimonios.'],
    archivo: ['Una ficha desplazada demuestra que el índice fue alterado.', 'El archivo te permite comparar lo escrito con lo que falta.'],
    enfermeria: ['La cera bajo una cama conserva la inicial de un cautivo.', 'La enfermería guarda una huella pequeña, pero verificable.'],
    capilla: ['El vitral proyecta una sílaba cuando la campana queda en silencio.', 'La capilla responde con luz a una memoria que no se rinde.'],
    montana: ['El viento ordena las cenizas en dirección a la antesala.', 'La montaña deja que el relato avance sin empujar a nadie.'],
    antesala: ['El atril reconoce la forma en que pronuncias el relato.', 'La antesala no pide obediencia: pide una voz precisa.'],
    umbral: ['La piedra ancla devuelve tu nombre sin borrarlo.', 'El Umbral registra tu decisión y deja intacta la salida.']
  };
  for (const data of Object.values(raceVerbs)) {
    for (const [place, [promise, dialogue]] of Object.entries(racialPlaceLines)) {
      Object.defineProperty(data, place, {
        value: { verb: data.verb, promise: `${data.promise} ${promise}`, dialogue: `${data.dialogue} ${dialogue}` },
        enumerable: false,
        configurable: false
      });
    }
  }
  const genderData = [['Mujer', 'woman', '✧'], ['Hombre', 'man', '◆'], ['No binario', 'nonbinary', '◇']];
  const classSubclassPairs = Object.entries(subclassData).flatMap(([className, entries]) => entries.map(entry => ({ class: className, subclass: entry[0] })));

  const api = { names, short, skillNames, costs, classes, raceData, subclassData, subclassRules, classVerbs, raceVerbs, genderData, classSubclassPairs };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CenizasCharacterData = api;
})(typeof window !== 'undefined' ? window : globalThis);
