'use strict';

(() => {
  const SAVE_KEYS = Object.freeze([
    'cenizas-valdara-v1',
    'cenizas-character-v1',
    'cenizas-campaign-v2',
  ]);
  const BACKUP_KEY = 'cenizas-save-backup-v1';
  const FORMAT = 'cenizas-save-backup';

  function getStorage(storage) {
    if (storage) return storage;
    try {
      return globalThis.localStorage;
    } catch {
      return null;
    }
  }

  function read(storage, key) {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  function hasAny(storage) {
    const target = getStorage(storage);
    return Boolean(target && SAVE_KEYS.some((key) => read(target, key) !== null));
  }

  function nextSequence(storage) {
    const target = getStorage(storage);
    const previous = read(target, BACKUP_KEY);
    if (!previous) return 1;
    try {
      const parsed = JSON.parse(previous);
      return Number.isInteger(parsed?.sequence) && parsed.sequence > 0 ? parsed.sequence + 1 : 1;
    } catch {
      return 1;
    }
  }

  function snapshot(storage, reason = 'new-game-overwrite') {
    const target = getStorage(storage);
    return {
      format: FORMAT,
      schemaVersion: 1,
      sequence: nextSequence(target),
      createdAt: new Date().toISOString(),
      reason,
      // Raw strings are deliberate: unknown fields and legacy formats survive byte-for-byte.
      entries: SAVE_KEYS.map((key) => {
        const raw = read(target, key);
        return { key, present: raw !== null, raw };
      }),
    };
  }

  function storeBackup(backup, storage) {
    const target = getStorage(storage);
    if (!target) return false;
    target.setItem(BACKUP_KEY, JSON.stringify(backup));
    return true;
  }

  function latestBackup(storage) {
    const target = getStorage(storage);
    const raw = read(target, BACKUP_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed?.format === FORMAT && Array.isArray(parsed.entries) ? parsed : null;
    } catch {
      return null;
    }
  }

  function restore(backup, storage) {
    const target = getStorage(storage);
    if (!target || !backup || backup.format !== FORMAT || !Array.isArray(backup.entries)) return false;
    const entries = new Map(backup.entries.map((entry) => [entry?.key, entry]));
    try {
      for (const key of SAVE_KEYS) {
        const entry = entries.get(key);
        if (!entry || !entry.present) target.removeItem(key);
        else target.setItem(key, String(entry.raw ?? ''));
      }
      return true;
    } catch {
      return false;
    }
  }

  function overwrite(storage) {
    const target = getStorage(storage);
    if (!target) return { ok: false, reason: 'storage-unavailable', backup: null };
    const backup = hasAny(target) ? snapshot(target) : null;
    try {
      if (backup) storeBackup(backup, target);
      for (const key of SAVE_KEYS) target.removeItem(key);
      return { ok: true, reason: null, backup };
    } catch {
      // If a storage provider fails midway, rehydrate the captured bytes before reporting failure.
      if (backup) restore(backup, target);
      return { ok: false, reason: 'overwrite-failed', backup };
    }
  }

  function exportText(backup) {
    return JSON.stringify(backup, null, 2);
  }

  function download(backup, documentRef = globalThis.document) {
    if (!backup || !documentRef || typeof Blob !== 'function' || !globalThis.URL?.createObjectURL) return false;
    const blob = new Blob([exportText(backup)], { type: 'application/json;charset=utf-8' });
    const url = globalThis.URL.createObjectURL(blob);
    const anchor = documentRef.createElement('a');
    anchor.href = url;
    anchor.download = `cenizas-respaldo-${backup.sequence || 1}.json`;
    anchor.hidden = true;
    documentRef.body?.append(anchor);
    anchor.click();
    anchor.remove();
    globalThis.setTimeout?.(() => globalThis.URL.revokeObjectURL(url), 0);
    return true;
  }

  const api = {
    SAVE_KEYS,
    BACKUP_KEY,
    hasAny,
    snapshot,
    storeBackup,
    latestBackup,
    restore,
    overwrite,
    exportText,
    download,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else globalThis.CenizasSaveProtection = api;
})();
