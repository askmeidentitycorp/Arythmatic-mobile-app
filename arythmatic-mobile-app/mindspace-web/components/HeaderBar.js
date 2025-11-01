'use client';
import ConsentModal from '../components/ConsentModal';
import MoodOrb from '../components/MoodOrb';
import { useLumi } from '../contexts/LumiContext';
import React from 'react';

export default function HeaderBar(){
  const { consentAsked, consented, grant, decline, listening, currentEmotion } = useLumi();
  const [streak, setStreak] = React.useState(0);
  const [openSet, setOpenSet] = React.useState(false);
  React.useEffect(()=>{ import('../utils/activity').then(m=> setStreak(m.getStreak())); }, [currentEmotion]);
  React.useEffect(()=>{
    if (typeof document !== 'undefined') {
      const cls = JSON.parse(localStorage.getItem('ms_high_contrast')||'false') ? 'high-contrast' : '';
      const font = JSON.parse(localStorage.getItem('ms_font_lg')||'false') ? 'font-lg' : '';
      document.body.classList.toggle('high-contrast', cls==='high-contrast');
      document.body.classList.toggle('font-lg', font==='font-lg');
    }
  }, []);
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-panel/60 backdrop-blur">
      <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <MoodOrb emotion={currentEmotion?.label} listening={listening} />
          <div className="text-sm">LUMI</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-sub">
          <span>🔥 Streak: {streak}d</span>
          <span>{consented? 'Emotion: ON' : 'Emotion: OFF'}</span>
          <button className="button" onClick={()=>setOpenSet(true)} title="Accessibility">Aa</button>
        </div>
      </div>
      <ConsentModal open={!consentAsked} onAllow={grant} onDecline={decline} />
      {openSet && <Settings onClose={()=>setOpenSet(false)} />}
    </div>
  );
}

function Settings({ onClose }){
  const [hc, setHc] = React.useState(false);
  const [fs, setFs] = React.useState(false);
  React.useEffect(()=>{
    setHc(JSON.parse(localStorage.getItem('ms_high_contrast')||'false'));
    setFs(JSON.parse(localStorage.getItem('ms_font_lg')||'false'));
  }, []);
  const apply = () => {
    localStorage.setItem('ms_high_contrast', JSON.stringify(hc));
    localStorage.setItem('ms_font_lg', JSON.stringify(fs));
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('high-contrast', hc);
      document.body.classList.toggle('font-lg', fs);
    }
    onClose();
  };
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
      <div className="card p-4 w-full max-w-sm">
        <div className="font-semibold mb-2">Accessibility</div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hc} onChange={e=>setHc(e.target.checked)} /> High contrast</label>
        <label className="flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={fs} onChange={e=>setFs(e.target.checked)} /> Larger font</label>
        <div className="flex justify-end gap-2 mt-3">
          <button className="button" onClick={onClose}>Cancel</button>
          <button className="button bg-primary border-primary text-white" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
