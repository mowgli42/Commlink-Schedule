/**
 * Shared toast notification store.
 * Any component can import and call toast() to show a message.
 */
import { writable } from 'svelte/store';

/**
 * @typedef {{ id: number, message: string, type: 'success'|'warning'|'error'|'info', timeout: number }} Toast
 */

/** @type {import('svelte/store').Writable<Toast[]>} */
export const toasts = writable([]);

let nextId = 0;

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'warning'|'error'|'info'} [type='info']
 * @param {number} [timeout=3000] - Auto-dismiss ms (0 = manual dismiss)
 */
export function toast(message, type = 'info', timeout = 3000) {
  const id = ++nextId;
  toasts.update(list => [...list, { id, message, type, timeout }]);

  if (timeout > 0) {
    setTimeout(() => dismissToast(id), timeout);
  }
}

/**
 * Dismiss a toast by ID.
 * @param {number} id
 */
export function dismissToast(id) {
  toasts.update(list => list.filter(t => t.id !== id));
}
