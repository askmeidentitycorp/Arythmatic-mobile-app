'use client';
import React, { useMemo, useRef, useState } from 'react';
import HeaderBar from '../../components/HeaderBar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InsightsPage(){
  const [entries, setEntries] = React.useState([]);
  const [daily, setDaily] = React.useState([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const reportRef = useRef(null);

  React.useEffect(()=>{
    fetch('/api/insights').then(r=>r.json()).then(d=> {
      setEntries(d.entries||[]);
      setDaily(d.daily||[]);
    }).catch(()=> { setEntries([]); setDaily([]); });
  }, []);

  const total = useMemo(()=> entries.reduce((a,b)=>a+b.n,0), [entries]);
  const pct = (n)=> total? Math.round((n*100)/total) : 0;

  async function downloadReport() {
    // close modal if open
    const el = reportRef.current;
    if (!el) return;
    // Temporarily ensure white background for capture
    const prev = el.className;
    el.className += ' bg-white text-black';
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = { width: pageWidth - 20 };
    const imgHeight = (canvas.height * imgProps.width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 10, imgProps.width, Math.min(imgHeight, pageHeight - 20));
    pdf.save('LUMI-Emotional-Report.pdf');
    el.className = prev;
    setNote('');
    setNoteOpen(false);
  }

  const startDownload = () => setNoteOpen(true);

  function shareLink(){
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify({ entries, daily }))));
    const url = `${location.origin}/light?d=${payload}`;
    navigator.clipboard?.writeText(url).catch(()=>{});
    alert('Share link copied to clipboard');
  }

  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <HeaderBar />
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">Weekly emotional weather</div>
        <div className="flex gap-2">
          <button className="button" onClick={shareLink}>Share My Light</button>
          <button className="button bg-primary border-primary text-white" onClick={startDownload}>⬇️ Download Report</button>
        </div>
      </div>
      {(entries.length===0) && <div className="text-sub text-sm">No data yet. Chat with LUMI or use MindSpace.</div>}

      {/* Report content to export */}
      <div ref={reportRef} id="report-content" className="card p-4 mt-2">
        <div className="text-center">
          <div className="text-xl font-semibold">🌙 LUMI Emotional Report</div>
          <div className="text-sub text-sm">Date: {new Date().toLocaleDateString()}</div>
        </div>
        <div className="mt-3">
          <div className="font-semibold mb-1">Mood Summary</div>
          <div className="grid gap-1">
            {entries.map(({label, n}) => (
              <div key={label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
                <div className="text-sm capitalize">{label}</div>
                <div className="h-2 bg-[#e5e7eb] rounded">
                  <div className="h-2 rounded bg-[#6B5CE7]" style={{ width: Math.min(100, pct(n))+'%' }} />
                </div>
                <div className="text-sm text-right">{pct(n)}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="font-semibold mb-1">Mood Timeline (Positivity Index)</div>
          <Timeline daily={daily} />
        </div>

        <WeeklyReflection />

        <div className="mt-4">
          <div className="font-semibold mb-1">Behavioral Insights</div>
          <div className="text-sm text-sub">Stress can rise midweek; consider a short breathing session on Wednesdays. Celebrate small wins to reinforce joy.</div>
        </div>

        {note && (
          <div className="mt-4">
            <div className="font-semibold mb-1">Note to Future Self</div>
            <div className="text-sm italic">{note}</div>
          </div>
        )}

        <div className="mt-6 text-xs text-sub text-center">LUMI | Emotional Wellness Companion | © 2025</div>
      </div>

      {/* Modal to capture note */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-4">
            <div className="font-semibold mb-2">You’ve completed another chapter ✨</div>
            <div className="text-sub text-sm mb-2">Add a note for your future self (optional):</div>
            <textarea className="w-full card p-2 bg-white/10" rows={4} value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a gentle reflection..." />
            <div className="flex justify-end gap-2 mt-3">
              <button className="button" onClick={()=>{ setNote(''); downloadReport(); }}>Skip</button>
              <button className="button bg-primary border-primary text-white" onClick={downloadReport}>Add & Download</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyReflection(){
  const [text, setText] = React.useState('');
  React.useEffect(()=>{ fetch('/api/weekly_reflection').then(r=>r.json()).then(d=> setText(d.text||'')); }, []);
  if (!text) return null;
  return (
    <div className="mt-4">
      <div className="font-semibold mb-1">Weekly Reflection</div>
      <div className="text-sm text-sub">{text}</div>
    </div>
  );
}

function Timeline({ daily }){
  if (!daily || daily.length===0) return <div className="text-sm text-sub">No timeline data.</div>;
  const w = 300, h = 100, pad = 10;
  const xs = daily.map((_, i) => i);
  const ys = daily.map(d => Math.max(-1, Math.min(1, d.value||0)));
  const xMax = Math.max(1, xs[xs.length-1]);
  const points = ys.map((v,i)=>{
    const x = pad + (i/xMax)*(w - 2*pad);
    const y = pad + (1 - (v+1)/2)*(h - 2*pad);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="bg-white rounded border border-[#e5e7eb]">
      <polyline fill="none" stroke="#6B5CE7" strokeWidth="2" points={points} />
    </svg>
  );
}
}
