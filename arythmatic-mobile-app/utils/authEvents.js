// utils/authEvents.js
// Lightweight auth event bus to coordinate unauthorized handling across modules

const listeners = new Set();

export const subscribeUnauthorized = (fn) => {
  if (typeof fn === 'function') listeners.add(fn);
  return () => listeners.delete(fn);
};

export const emitUnauthorized = (reason = 'unauthorized') => {
  for (const fn of Array.from(listeners)) {
    try { fn(reason); } catch {}
  }
};