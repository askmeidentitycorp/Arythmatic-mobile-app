// constants/lumi.js
export const EMOTIONS = [
  'neutral',
  'joy',
  'sadness',
  'anger',
  'fear',
  'surprise',
  'disgust'
];

export const emotionColors = {
  neutral: '#6C7A89',
  joy: '#FFD166',
  sadness: '#6EA4F4',
  anger: '#EF476F',
  fear: '#8E7CC3',
  surprise: '#06D6A0',
  disgust: '#73A942',
};

export const emotionFriendly = {
  neutral: 'calm',
  joy: 'bright',
  sadness: 'blue',
  anger: 'heated',
  fear: 'tense',
  surprise: 'sparked',
  disgust: 'uneasy',
};

// Simple on-device heuristic fallback if no API is configured
export function heuristicAnalyze(text) {
  if (!text) return { label: 'neutral', score: 0.5 };
  const t = text.toLowerCase();
  const lex = [
    { words: ['happy','glad','great','awesome','love','thanks','grateful'], label: 'joy' },
    { words: ['sad','down','depressed','unhappy','cry','lonely'], label: 'sadness' },
    { words: ['angry','mad','furious','annoyed','pissed'], label: 'anger' },
    { words: ['afraid','scared','anxious','nervous','worried'], label: 'fear' },
    { words: ['wow','shocked','surprised','unexpected'], label: 'surprise' },
    { words: ['gross','disgusting','nasty','sick of'], label: 'disgust' },
  ];
  for (const { words, label } of lex) {
    if (words.some(w => t.includes(w))) return { label, score: 0.8 };
  }
  return { label: 'neutral', score: 0.6 };
}
