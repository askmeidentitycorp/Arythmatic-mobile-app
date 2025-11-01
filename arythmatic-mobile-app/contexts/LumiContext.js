// contexts/LumiContext.js
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeEmotion as apiAnalyze, chatWithLumi as apiChat, sendFeedback as apiFeedback, hasRemoteAPI } from '../lib/lumiApi';
import { heuristicAnalyze, emotionFriendly } from '../constants/lumi';
import { detectCrisis } from '../constants/crisis';

const STORAGE_KEYS = {
  consent: 'lumi_consent_v1',
  asked: 'lumi_asked_v1',
  history: 'lumi_history_v1',
};

const LumiContext = createContext(null);

export function LumiProvider({ children }) {
  const [consented, setConsented] = useState(false);
  const [asked, setAsked] = useState(false);
  const [listening, setListening] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState({ label: 'neutral', score: 0.0 });
  const [moodHistory, setMoodHistory] = useState([]);

  // load consent and asked flags
  useEffect(() => {
    (async () => {
      try {
        const [c, a, h] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.consent),
          AsyncStorage.getItem(STORAGE_KEYS.asked),
          AsyncStorage.getItem(STORAGE_KEYS.history),
        ]);
        setConsented(c === 'true');
        setAsked(a === 'true');
        setMoodHistory(h ? JSON.parse(h) : []);
      } catch (e) {}
    })();
  }, []);

  // persist changes
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.consent, String(consented)); }, [consented]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.asked, String(asked)); }, [asked]);
  useEffect(() => { AsyncStorage.setItem(STORAGE_KEYS.history, JSON.stringify(moodHistory.slice(-200))); }, [moodHistory]);

  const grantConsent = () => { setConsented(true); setAsked(true); };
  const declineConsent = () => { setConsented(false); setAsked(true); };
  const revokeConsent = () => { setConsented(false); };

  async function analyze(text) {
    if (!consented) return { label: 'neutral', score: 0.0 };
    setListening(true);
    try {
      let result;
      try {
        result = await apiAnalyze(text);
      } catch (e) {
        result = heuristicAnalyze(text);
      }
      setCurrentEmotion(result);
      setMoodHistory(prev => [...prev, { ts: Date.now(), ...result }]);
      return result;
    } finally {
      setListening(false);
    }
  }

  async function chat(text) {
    const crisis = detectCrisis(text);
    if (crisis) {
      return { crisis: true, reply: null, emotion: null };
    }
    const emotion = consented ? await analyze(text) : { label: 'neutral', score: 0.0 };
    try {
      const data = await apiChat({ text, emotion });
      return { crisis: false, reply: data.reply, emotion };
    } catch (e) {
      // local empathetic fallback
      const tone = emotionFriendly[emotion.label] || 'calm';
      const reply = `I hear you. It sounds ${tone}. Want to talk more about it?`;
      return { crisis: false, reply, emotion };
    }
  }

  async function sendFeedback({ messageId, helpful, emotion }) {
    try { await apiFeedback({ messageId, helpful, emotion }); } catch {}
  }

  const value = useMemo(() => ({
    consented,
    asked,
    listening,
    currentEmotion,
    moodHistory,
    grantConsent,
    declineConsent,
    revokeConsent,
    analyze,
    chat,
    sendFeedback,
    hasRemoteAPI,
  }), [consented, asked, listening, currentEmotion, moodHistory]);

  return (
    <LumiContext.Provider value={value}>{children}</LumiContext.Provider>
  );
}

export function useLumi() {
  const ctx = useContext(LumiContext);
  if (!ctx) throw new Error('useLumi must be used within LumiProvider');
  return ctx;
}
