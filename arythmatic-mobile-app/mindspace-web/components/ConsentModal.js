'use client';
import React from 'react';

export default function ConsentModal({ open, onAllow, onDecline }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="card max-w-lg w-full p-5">
        <h2 className="text-lg font-semibold mb-2">LUMI — Emotion by Consent</h2>
        <p className="text-sub mb-4">
          Would you like me to sense your emotional tone as we talk? I can use AI to help
          understand your mood and respond more personally. You can turn this off anytime.
        </p>
        <div className="flex gap-2 justify-end">
          <button className="button bg-primary border-primary text-white" onClick={onAllow}>🔮 Yes, Sense My Mood</button>
          <button className="button" onClick={onDecline}>🚫 No, Just Chat</button>
        </div>
      </div>
    </div>
  );
}
