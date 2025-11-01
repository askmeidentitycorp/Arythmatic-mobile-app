export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'self-harm', 'harm myself', 'end it all', 'overdose', 'no reason to live', 'hopeless', 'abuse', 'assault', 'emergency'
];
export function detectCrisis(text) {
  const t = (text||'').toLowerCase();
  return CRISIS_KEYWORDS.some(k => t.includes(k));
}
