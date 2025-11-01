"use client";
import React from 'react';
import { lsGet, lsSet } from '../../utils/storage';
import { useLumi } from '../../contexts/LumiContext';

export default function PrivacyPage(){
  const { consented, grant, revoke } = useLumi();
  const [exported, setExported] = React.useState('');

  const exportData = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('ms_'));
    const obj = {};
    keys.forEach(k => { try { obj[k] = JSON.parse(localStorage.getItem(k)); } catch { obj[k] = localStorage.getItem(k); } });
    setExported(JSON.stringify(obj, null, 2));
  };

  const deleteData = () => {
    Object.keys(localStorage).filter(k=>k.startsWith('ms_')).forEach(k=> localStorage.removeItem(k));
    alert('Local data cleared');
  };

  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-lg font-semibold mb-2">Privacy Dashboard</div>
      <div className="card p-4 grid gap-2">
        <div className="text-sm">Mood detection: <b>{consented? 'ON':'OFF'}</b></div>
        <div className="flex gap-2">
          {!consented ? (<button className="button" onClick={grant}>Enable</button>) : (<button className="button" onClick={revoke}>Disable</button>)}
        </div>
      </div>

      <div className="card p-4 grid gap-2 mt-3">
        <div className="font-semibold">Export Data</div>
        <button className="button" onClick={exportData}>Generate JSON</button>
        {exported && <textarea className="w-full card p-2" rows={10} value={exported} readOnly />}
      </div>

      <div className="card p-4 grid gap-2 mt-3">
        <div className="font-semibold">Delete Local Data</div>
        <button className="button" onClick={deleteData}>Delete</button>
      </div>
    </div>
  );
}
