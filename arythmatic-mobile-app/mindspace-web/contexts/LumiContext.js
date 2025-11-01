'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { heuristicAnalyze, emotionColors } from '../lib/emotion';
import { lsGet, lsSet } from '../utils/storage';

const LumiContext = createContext(null);

export function LumiProvider({ children }) {
  const [consentAsked, setConsentAsked] = useState(false);
  const [consented, setConsented] = useState(false);
  const [listening, setListening] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState({ label: 'neutral', score: 0 });
  const [moodHistory, setMoodHistory] = useState([]);

  useEffect(() => {
    setConsentAsked(lsGet('ms_consentAsked', false));
    setConsented(lsGet('ms_consented', false));
    setMoodHistory(lsGet('ms_moodHistory', []));
  }, []);

  useEffect(() => { lsSet('ms_consentAsked', consentAsked); }, [consentAsked]);
  useEffect(() => { lsSet('ms_consented', consented); }, [consented]);
  useEffect(() => { lsSet('ms_moodHistory', moodHistory.slice(-200)); }, [moodHistory]);

  const grant = () => { setConsented(true); setConsentAsked(true); };
  const decline = () => { setConsented(false); setConsentAsked(true); };
  const revoke = () => { setConsented(false); };

  async function analyze(text) {
    if (!consented) return { label: 'neutral', score: 0 };
    setListening(true);
    try {
      // try server ML first
      let r;
      try {
        const resp = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (resp.ok) {
          r = await resp.json();
        } else {
          r = heuristicAnalyze(text);
        }
      } catch {
        r = heuristicAnalyze(text);
      }
      // smooth low-confidence switches
      const prev = currentEmotion;
      const stable = prev?.label && r.label !== prev.label && (r.score || 0) < 0.55 ? prev : r;
      setCurrentEmotion(stable);
      setMoodHistory(prevHist => [...prevHist, { ts: Date.now(), ...stable }]);
      // fire-and-forget save to Supabase and mark streak activity
      fetch('/api/moods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: stable.label, score: stable.score }) }).catch(()=>{});
      try { const { markActivity } = await import('../utils/activity'); markActivity(); } catch {}
      return stable;
    } finally { setListening(false); }
  }

  async function empathicReply(text) {
    const e = consented ? await analyze(text) : { label: 'neutral', score: 0 };
    const toneWord = { neutral:'calm', joy:'warm', sadness:'gentle', anger:'steady', fear:'reassuring', surprise:'curious', disgust:'grounded' }[e.label] || 'calm';
    const reply = `I’m here. Your message feels ${toneWord}. Want to take a slow breath with me?`;
    return { reply, emotion: e };
  }

  const value = useMemo(() => ({
    consentAsked,
    consented,
    listening,
    currentEmotion,
    moodHistory,
    grant,
    decline,
    revoke,
    analyze,
    empathicReply,
    setEmotion: setCurrentEmotion,
    emotionColors,
  }), [consentAsked, consented, listening, currentEmotion, moodHistory]);

  return <LumiContext.Provider value={value}>{children}</LumiContext.Provider>;
}

export function useLumi() {
  const ctx = useContext(LumiContext);
  if (!ctx) throw new Error('useLumi must be used inside LumiProvider');
  return ctx;
}
