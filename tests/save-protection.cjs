const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Protection = require('../dist/save-protection.js');

class MemoryStorage {
  constructor(entries = {}) {
    this.data = new Map(Object.entries(entries));
  }

  getItem(key) {
    return this.data.has(key) ? this.data.get(key) : null;
  }

  setItem(key, value) {
    this.data.set(key, String(value));
  }

  removeItem(key) {
    this.data.delete(key);
  }
}

function makeElement(id) {
  return {
    id,
    hidden: false,
    open: false,
    dataset: {},
    style: {},
    classList: { add() {}, remove() {} },
    setAttribute() {},
    querySelector() {
      return null;
    },
    addEventListener(type, listener) {
      this[`on${type}`] = listener;
    },
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
      this.onclose?.();
    },
    click() {
      this.onclick?.();
    },
  };
}

function loadMenu(storage, bridge) {
  const ids = [
    'main-menu',
    'intro-cinema',
    'intro-video',
    'skip-intro',
    'new-game',
    'continue-game',
    'exit-game',
    'menu-status',
    'overwrite-save-modal',
    'overwrite-save-status',
    'export-save',
  ];
  const elements = new Map(ids.map((id) => [id, makeElement(id)]));
  const menu = elements.get('main-menu');
  menu.dataset.active = 'true';
  const menuVideo = makeElement('menu-video-slot');
  menu.querySelector = (selector) => (selector === '.menu-video-slot' ? menuVideo : null);
  const intro = elements.get('intro-cinema');
  intro.hidden = true;
  const video = elements.get('intro-video');
  video.currentTime = 0;
  video.load = () => {};
  video.pause = () => {};
  video.play = () => Promise.resolve();
  const film = makeElement('intro-film');
  film.hidden = false;
  film.querySelector = (selector) =>
    selector === '.intro-fallback' ? makeElement('intro-fallback') : null;
  const copy = makeElement('intro-copy');
  const context = {
    document: {
      getElementById: (id) => elements.get(id),
      querySelector: (selector) =>
        selector === '.intro-film' ? film : selector === '.intro-copy' ? copy : null,
    },
    window: {
      CenizasBridge: bridge,
      CenizasSaveProtection: Protection,
      CenizasMusic: { enable() {}, set() {} },
      addEventListener() {},
    },
    localStorage: storage,
    setTimeout: () => 1,
    clearTimeout() {},
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('dist/menu.js', 'utf8'), context);
  return elements;
}

// (a) A new game over existing data opens an explicit confirmation dialog.
{
  const storage = new MemoryStorage({ 'cenizas-valdara-v1': '{"stage":2}' });
  let starts = 0;
  const bridge = {
    hasAnySave: () => Protection.hasAny(storage),
    hasSave: () => true,
    startNew: () => {
      starts += 1;
    },
    continueGame() {},
  };
  const elements = loadMenu(storage, bridge);
  elements.get('new-game').click();
  assert.equal(
    elements.get('overwrite-save-modal').open,
    true,
    'se muestra la confirmación antes de sobrescribir',
  );
  assert.equal(starts, 0, 'el juego nuevo no comienza antes de confirmar');
}

// (b) Cancelling leaves all three save keys byte-for-byte untouched.
{
  const original = {
    'cenizas-valdara-v1': '{"stage":2,"x":17}',
    'cenizas-character-v1': '{"name":"Iria","unknown":"legacy"}',
    'cenizas-campaign-v2': '{"level":3,"flags":{"intro":true}}',
  };
  const storage = new MemoryStorage(original);
  let starts = 0;
  const bridge = {
    hasAnySave: () => Protection.hasAny(storage),
    hasSave: () => true,
    startNew: () => {
      starts += 1;
    },
    continueGame() {},
  };
  const elements = loadMenu(storage, bridge);
  elements.get('new-game').click();
  const dialog = elements.get('overwrite-save-modal');
  dialog.returnValue = 'cancel';
  dialog.onclose();
  for (const key of Protection.SAVE_KEYS)
    assert.equal(storage.getItem(key), original[key], `${key} no cambia al cancelar`);
  assert.equal(starts, 0, 'cancelar no inicia una partida nueva');
}

// (c) Confirming creates a downloadable JSON payload and a restorable local copy.
{
  const legacyCampaign = '{"level":3,"flags":{"intro":true},"customUnknown":{"chapter":"old"}}';
  const storage = new MemoryStorage({
    'cenizas-valdara-v1': '{"stage":2}',
    'cenizas-character-v1': '{"name":"Aren"}',
    'cenizas-campaign-v2': legacyCampaign,
  });
  const before = Object.fromEntries(Protection.SAVE_KEYS.map((key) => [key, storage.getItem(key)]));
  const result = Protection.overwrite(storage);
  assert.equal(result.ok, true, 'la sobrescritura confirmada se completa');
  assert.equal(
    storage.getItem(Protection.BACKUP_KEY) !== null,
    true,
    'queda un respaldo versionado local',
  );
  const backup = Protection.latestBackup(storage);
  assert.equal(backup.sequence, 1);
  assert.equal(
    Protection.exportText(backup).includes('customUnknown'),
    true,
    'el JSON exportable conserva campos desconocidos',
  );
  assert.equal(Protection.restore(backup, storage), true, 'el respaldo se puede restaurar');
  for (const key of Protection.SAVE_KEYS)
    assert.equal(storage.getItem(key), before[key], `${key} se restaura byte a byte`);
}

// (d) Legacy/unknown fields survive migration because backups retain raw values.
{
  const storage = new MemoryStorage({ 'cenizas-campaign-v2': '{"version":1,"unknownFlag":true}' });
  const backup = Protection.snapshot(storage, 'legacy-migration');
  storage.removeItem('cenizas-campaign-v2');
  assert.equal(Protection.restore(backup, storage), true);
  assert.equal(storage.getItem('cenizas-campaign-v2'), '{"version":1,"unknownFlag":true}');
}

console.log(
  'PASS: new-game save protection confirms, exports, restores, and preserves legacy fields.',
);
