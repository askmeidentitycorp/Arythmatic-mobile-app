"use client";
import React from 'react';

const samples = [
  { label: 'joy', text: 'I feel really happy and grateful today!' },
  { label: 'sadness', text: 'I am feeling down and tearful right now.' },
  { label: 'anger', text: 'This makes me so mad and frustrated.' },
  { label: 'fear', text: 'I am worried and anxious about tomorrow.' },
  { label: 'surprise', text: 'Wow, I did not expect that to happen!' },
  { label: 'disgust', text: 'That was gross and nasty, I hated it.' },
  { label: 'neutral', text: 'I will go to the store later and buy milk.' },
];

export default function EvalPage(){
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const run = async () => {
    setLoading(true);
    const out = [];
    for (const s of samples){
      try{
        const resp = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text: s.text }) });
        const r = await resp.json();
        out.push({ expected: s.label, predicted: r.label, score: r.score });
      }catch(e){ out.push({ expected: s.label, predicted: 'error', score: 0 }); }
    }
    setRows(out); setLoading(false);
  };

  const acc = rows.length? Math.round(100 * rows.filter(r=>r.expected===r.predicted).length / rows.length) : null;

  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-lg font-semibold mb-2">Emotion Model Diagnostics</div>
      <button className="button" onClick={run} disabled={loading}>{loading? 'Running…':'Run test'}</button>
      {acc!==null && <div className="text-sm text-sub mt-2">Accuracy on samples: {acc}%</div>}
      <div className="grid gap-2 mt-3">
        {rows.map((r,i)=> (
          <div key={i} className="grid grid-cols-[1fr_1fr_80px] gap-2 text-sm card p-2">
            <div>Expected: <b>{r.expected}</b></div>
            <div>Predicted: <b>{r.predicted}</b></div>
            <div className="text-right">{(r.score||0).toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
