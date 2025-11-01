"use client";
import React from 'react';

const SCRIPTS = {
  morning: "Close your eyes and breathe in slowly. Feel the morning light arriving in you. With each breath, choose one gentle intention.",
  evening: "Let the day soften. Breathe out the weight you cannot carry. Thank yourself for what you did. You are enough.",
  exam: "Inhale clarity, exhale tension. Your mind knows the path. Walk it one steady step at a time."
};

export default function Meditations(){
  const [key, setKey] = React.useState('morning');
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(SCRIPTS[key]);
      u.rate = 0.85; u.pitch = 1; u.volume = 1;
      speechSynthesis.speak(u);
    } catch {}
  };
  return (
    <div className="card p-4">
      <div className="text-sm text-sub mb-2">Guided Meditations</div>
      <div className="flex gap-2 mb-2">
        {Object.keys(SCRIPTS).map(k => (
          <button key={k} className={`button ${key===k?'bg-primary text-white border-primary':''}`} onClick={()=>setKey(k)}>{k}</button>
        ))}
      </div>
      <div className="text-sm mb-2">{SCRIPTS[key]}</div>
      <button className="button" onClick={speak}>Play</button>
    </div>
  );
}
