'use client';
import React from 'react';

export default function FlowMaze(){
  const [hits, setHits] = React.useState(0);
  const [pos, setPos] = React.useState({ x: 10, y: 10 });
  const areaRef = React.useRef(null);

  function onMouseMove(e){
    const rect = areaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    setPos({ x, y });
    // simple bounds to simulate walls
    if (x<20 || x>rect.width-20 || y<20 || y>rect.height-20){
      setPos({ x: 10, y: 10 }); setHits(h=>h+1);
    }
  }

  return (
    <div className="card p-4">
      <div className="text-sm text-sub mb-2">Guide the dot to the lower-right corner. If you hit walls, you’ll softly restart.</div>
      <div ref={areaRef} onMouseMove={onMouseMove} className="relative h-56 rounded-lg border border-border overflow-hidden bg-[#0b1220]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-5 bg-primary/20"/>
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-primary/20"/>
          <div className="absolute top-0 bottom-0 left-0 w-5 bg-primary/20"/>
          <div className="absolute top-0 bottom-0 right-0 w-5 bg-primary/20"/>
        </div>
        <div className="absolute rounded-full bg-white" style={{ width: 12, height: 12, transform: `translate(${pos.x}px, ${pos.y}px)` }} />
        <div className="absolute right-3 bottom-3 text-xs text-sub">Goal →</div>
      </div>
      <div className="text-xs text-sub mt-2">Soft restarts: {hits}</div>
    </div>
  );
}
