"use client";
import React from 'react';

export default function HelpPage(){
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-2xl font-semibold mb-3">Your guide to navigating LUMI</div>
      <Section title="💬 Chat" body="Talk to me like you would to a calm friend. I listen and suggest small steps." />
      <Section title="📊 Insights" body="I visualize your moods to help you understand patterns — no judgment, just awareness." />
      <Section title="🌿 MindSpace" body="Mini-games, readings, and meditations to refresh your mind." />
      <Section title="🎧 Music Space" body="Curated soundscapes to match your emotions." />
      <Section title="📥 Reports" body="Download your weekly reflection to see how far you’ve come." />
      <Section title="🔒 Privacy" body="Everything stays with you. Your reflections are yours alone." />
      <div className="mt-4"><a className="button" href="/chat">Back to Chat</a></div>
    </div>
  );
}
function Section({ title, body }){
  return (
    <div className="card p-3 mb-2">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-sub">{body}</div>
    </div>
  );
}
