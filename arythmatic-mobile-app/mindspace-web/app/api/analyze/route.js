import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { pipeline } from '@xenova/transformers';

export const runtime = 'nodejs';

let classifierPromise = null;

const LOCAL_DIR = process.env.LOCAL_GOEMOTIONS_DIR || path.resolve(process.cwd(), 'public', 'models', 'roberta-go-emotions');
const DEFAULT_MODEL_ID = process.env.GOEMOTIONS_MODEL || 'Xenova/roberta-base-go-emotions';

const GOEMO_MAP = {
  joy: ['admiration','amusement','approval','curiosity','desire','excitement','gratitude','joy','love','optimism','pride','relief'],
  sadness: ['sadness','disappointment','embarrassment','grief','remorse','loneliness'],
  anger: ['anger','annoyance','disapproval','anger'],
  fear: ['fear','nervousness','apprehension','anxiety'],
  surprise: ['surprise','realization'],
  disgust: ['disgust','contempt'],
  neutral: ['neutral']
};

function groupScores(allScores) {
  const sums = Object.fromEntries(Object.keys(GOEMO_MAP).map(k => [k, 0]));
  for (const { label, score } of allScores) {
    for (const [group, labels] of Object.entries(GOEMO_MAP)) {
      if (labels.includes(label.toLowerCase())) sums[group] += score;
    }
  }
  // pick max
  let best = 'neutral'; let bestScore = sums[best];
  for (const [k, v] of Object.entries(sums)) { if (v > bestScore) { best = k; bestScore = v; } }
  // normalize by sum of all
  const total = Object.values(sums).reduce((a,b)=>a+b, 0) || 1;
  return { label: best, score: bestScore / total };
}

async function getClassifier() {
  if (!classifierPromise) {
    const source = fs.existsSync(LOCAL_DIR) ? LOCAL_DIR : DEFAULT_MODEL_ID;
    classifierPromise = pipeline('text-classification', source, { quantized: true });
  }
  return classifierPromise;
}

export async function POST(req) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') return NextResponse.json({ error: 'text required' }, { status: 400 });
    const classifier = await getClassifier();
    const out = await classifier(text, { topk: null });
    const res = groupScores(out);
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: 'analyze failed', details: String(e.message||e) }, { status: 500 });
  }
}
