"use client";
import React from 'react';
import { lsGet, lsSet } from '../utils/storage';

export default function CheckIn(){
  const [entry, setEntry] = React.useState({ feel:'', cause:'', action:'' });
  const [items, setItems] = React.useState(()=> lsGet('ms_checkins', []));
  const save = () => {
    const e = { id: Date.now(), ...entry, ts: Date.now() };
    const next = [e, ...items].slice(0,200);
    setItems(next); lsSet('ms_checkins', next);
    setEntry({ feel:'', cause:'', action:'' });
  };
  return (
    <div className="card p-4 grid gap-2">
      <div className="font-semibold">LUMI Check‑In</div>
      <input className="card p-2" placeholder="How do I feel?" value={entry.feel} onChange={e=>setEntry({...entry, feel:e.target.value})} />
      <input className="card p-2" placeholder="What caused it?" value={entry.cause} onChange={e=>setEntry({...entry, cause:e.target.value})} />
      <input className="card p-2" placeholder="One thing I can do now" value={entry.action} onChange={e=>setEntry({...entry, action:e.target.value})} />
      <div className="flex justify-end"><button className="button" onClick={save}>Save</button></div>
      {items.length>0 && <div className="text-xs text-sub">Last: “{items[0].feel}” → {items[0].action}</div>}
    </div>
  );
}
