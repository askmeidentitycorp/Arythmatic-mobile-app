'use client';
import React from 'react';
import { lsGet, lsSet } from '../../utils/storage';
import { kindnessActs } from '../../data/content';

export default function KindnessQuest(){
  const [today, setToday] = React.useState(()=> lsGet('ms_kindness', null));
  const pick = () => {
    const idx = Math.floor(Math.random()*kindnessActs.length);
    const k = { ts: new Date().toDateString(), act: kindnessActs[idx], done: false };
    setToday(k); lsSet('ms_kindness', k);
  };
  React.useEffect(()=>{ if (!today) pick(); }, []);
  const mark = () => { const k = { ...today, done: true }; setToday(k); lsSet('ms_kindness', k); };
  return (
    <div className="card p-4">
      <div className="text-sm">Today’s small act:</div>
      <div className="text-sub text-sm mt-1">{today?.act}</div>
      <div className="flex gap-2 mt-2">
        <button className="button" onClick={pick}>New</button>
        <button className="button" onClick={mark}>{today?.done? 'Completed' : 'Mark done'}</button>
      </div>
    </div>
  );
}
