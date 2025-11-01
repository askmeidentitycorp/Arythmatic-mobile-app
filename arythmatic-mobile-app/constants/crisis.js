// constants/crisis.js
export const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'self-harm', 'harm myself', 'end it all',
  'overdose', 'no reason to live', 'hopeless', 'abuse', 'assault', 'emergency'
];

export function detectCrisis(text) {
  if (!text) return false;
  const t = text.toLowerCase();
  return CRISIS_KEYWORDS.some(k => t.includes(k));
}

export const HELPLINES = [
  { label: 'Emergency services', value: 'Call your local emergency number' },
  { label: '988 Suicide & Crisis Lifeline (US)', value: 'Dial 988' },
  { label: 'Samaritans (UK & ROI)', value: '+44 116 123' },
  { label: 'Lifeline (AU)', value: '13 11 14' },
];
