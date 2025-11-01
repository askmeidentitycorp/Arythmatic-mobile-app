'use client';
import React from 'react';
import { lsGet, lsSet } from '../../utils/storage';

export default function Journal(){
  const [entries, setEntries] = React.useState(()=> lsGet('ms_journal', []));
  const [fields, setFields] = React.useState({
    moved: '', win: '', letting: ''
  });
  const save = () => {
    const e = { id: Date.now(), ...fields, ts: Date.now() };
    const next = [e, ...entries].slice(0,100);
    setEntries(next); lsSet('ms_journal', next);
    setFields({ moved:'', win:'', letting:'' });
  };
  return (
    <div className="card p-4 grid gap-2">
      <Input label="What moved me today?" value={fields.moved} onChange={v=>setFields(f=>({...f, moved:v}))}/>
      <Input label="What’s one gentle win?" value={fields.win} onChange={v=>setFields(f=>({...f, win:v}))}/>
      <Input label="What am I letting go of?" value={fields.letting} onChange={v=>setFields(f=>({...f, letting:v}))}/>
      <div className="flex justify-end"><button className="button" onClick={save}>Save</button></div>
      {entries.length>0 && (
        <div className="mt-2">
          <div className="text-sm text-sub mb-1">Recent reflections</div>
          <div className="grid gap-2 max-h-40 overflow-auto">
            {entries.map(e=> (
              <div key={e.id} className="card p-2 text-xs text-sub">
                <div className="opacity-70">{new Date(e.ts).toLocaleString()}</div>
                <div>• {e.moved}</div>
                <div>• {e.win}</div>
                <div>• {e.letting}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange }){
  return (
    <label className="grid gap-1">
      <span className="text-sm">{label}</span>
      <textarea className="w-full card p-2" rows={2} value={value} onChange={e=>onChange(e.target.value)} />
    </label>
  );
}
