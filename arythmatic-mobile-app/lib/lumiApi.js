// lib/lumiApi.js
import axios from 'axios';
import Constants from 'expo-constants';

const EXTRA = (Constants?.expoConfig || Constants?.manifest || {}).extra || {};
const BASE = EXTRA.LUMI_API_BASE || null; // e.g., https://your-api.example.com

export const hasRemoteAPI = !!BASE;

export async function analyzeEmotion(text) {
  if (!BASE) throw new Error('NO_REMOTE_API');
  const { data } = await axios.post(`${BASE}/api/analyze`, { text });
  return data; // { label, score }
}

export async function chatWithLumi({ text, emotion }) {
  if (!BASE) throw new Error('NO_REMOTE_API');
  const { data } = await axios.post(`${BASE}/api/chat`, { text, emotion });
  return data; // { reply }
}

export async function sendFeedback({ messageId, helpful, emotion }) {
  if (!BASE) throw new Error('NO_REMOTE_API');
  const { data } = await axios.post(`${BASE}/api/feedback`, { messageId, helpful, emotion });
  return data;
}

export async function fetchInsights() {
  if (!BASE) throw new Error('NO_REMOTE_API');
  const { data } = await axios.get(`${BASE}/api/insights`);
  return data;
}
