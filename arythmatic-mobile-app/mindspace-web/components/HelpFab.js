"use client";
import React from 'react';

export default function HelpFab(){
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button onClick={()=>setOpen(true)} className="fixed bottom-16 right-4 z-40 rounded-full w-10 h-10 bg-primary text-white">🌙</button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4" onClick={()=>setOpen(false)}>
          <div className="card p-4 w-full max-w-sm" onClick={e=>e.stopPropagation()}>
            <div className="text-lg font-semibold mb-2">Need guidance?</div>
            <ul className="grid gap-2">
              <li><a className="button" href="/chat">How to use Chat</a></li>
              <li><a className="button" href="/insights">Understanding Insights</a></li>
              <li><a className="button" href="/mindspace">MindSpace Activities</a></li>
              <li><a className="button" href="/privacy">Privacy & Mood Detection</a></li>
            </ul>
            <div className="flex justify-end mt-3"><button className="button" onClick={()=>setOpen(false)}>Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}
