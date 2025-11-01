'use client';
import React from 'react';

const words = [
  'joy','sadness','anger','fear','surprise','disgust'
];
function shuffle(a){ return a.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(([,v])=>v); }

export default function EmotionMatch(){
  const [cards, setCards] = React.useState(()=>{
    const items = shuffle([...words, ...words]).map((w, idx)=>({ id: idx, w, open: false, done: false }));
    return items;
  });
  const [first, setFirst] = React.useState(null);
  const [message, setMessage] = React.useState('Flip two cards to find a match.');

  const flip = (id) => {
    setCards(prev => prev.map(c => c.id===id && !c.done ? { ...c, open: !c.open } : c));
  };

  React.useEffect(()=>{
    const open = cards.filter(c=>c.open && !c.done);
    if (open.length===2){
      const [a,b] = open;
      if (a.w===b.w){
        setCards(prev=>prev.map(c=> (c.open&&!c.done)? { ...c, done: true } : c));
        setMessage(`Nice. When did you last feel ${a.w}?`);
        beep(440);
      } else {
        setTimeout(()=>{
          setCards(prev=>prev.map(c=> c.open&&!c.done? { ...c, open: false } : c));
        }, 800);
      }
    }
  }, [cards]);

  function beep(freq){
    try{
      const ac = new (window.AudioContext||window.webkitAudioContext)();
      const o = ac.createOscillator(); const g = ac.createGain();
      o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.001, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.04, ac.currentTime+0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime+0.2);
      o.start(); o.stop(ac.currentTime+0.21);
    }catch(e){}
  }

  const allDone = cards.every(c=>c.done);

  return (
    <div className="card p-4">
      <div className="mb-2 text-sm text-sub">{message}</div>
      <div className="grid grid-cols-3 gap-2">
        {cards.map(c=> (
          <button key={c.id} className={`h-16 rounded-lg border border-border ${c.done? 'bg-good/30':'bg-panel'} `} onClick={()=>flip(c.id)}>
            <span className="text-white font-semibold">{c.open || c.done ? c.w : '🙂'}</span>
          </button>
        ))}
      </div>
      {allDone && <div className="mt-3 text-sm text-sub">You matched all feelings. How do you feel now?</div>}
    </div>
  );
}
