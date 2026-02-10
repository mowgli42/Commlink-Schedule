/**
 * localStorage persistence for Svelte writable stores.
 * Saves store changes to localStorage and hydrates on load.
 */

const STORAGE_PREFIX = 'geocomm_';

/**
 * Load a value from localStorage, falling back to defaultValue.
 * @template T
 * @param {string} key
 * @param {T} defaultValue
 * @returns {T}
 */
export function loadFromStorage(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

/**
 * Save a value to localStorage.
 * @param {string} key
 * @param {*} value
 */
export function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

/**
 * Subscribe a writable store to localStorage persistence.
 * Hydrates with stored value on first call, saves on every change.
 * @template T
 * @param {import('svelte/store').Writable<T>} store
 * @param {string} key
 * @param {T} defaultValue
 */
export function persistStore(store, key, defaultValue) {
  // Hydrate from storage
  const stored = loadFromStorage(key, null);
  if (stored !== null) {
    store.set(stored);
  }

  // Save on changes
  store.subscribe(value => {
    saveToStorage(key, value);
  });
}

/**
 * Clear all GeoComm data from localStorage.
 */
export function clearAllStorage() {
  if (typeof window === 'undefined') return;
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(k);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
