'use client';
import React from 'react';

export default function RainGarden(){
  const canvasRef = React.useRef(null);
  const [done, setDone] = React.useState(false);
  const dropsRef = React.useRef([]);

  React.useEffect(()=>{
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
    let raf; let t=0; let clicks=0;
    function spawn(){
      dropsRef.current.push({ x: Math.random()*canvas.width, y: -10, r: 3+Math.random()*3, vy: 0.6+Math.random()*0.8 });
    }
    function draw(){
      t++;
      if (t%20===0 && dropsRef.current.length<50) spawn();
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for (const d of dropsRef.current){ d.y += d.vy; ctx.fillStyle = '#6EA4F4'; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI*2); ctx.fill(); }
      dropsRef.current = dropsRef.current.filter(d=> d.y<canvas.height+10);
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect(); const x = e.clientX-rect.left; const y = e.clientY-rect.top;
      ripple(ctx, x, y); clicks++; if (clicks>30) setDone(true);
    };
    canvas.addEventListener('click', onClick);
    return ()=>{ cancelAnimationFrame(raf); canvas.removeEventListener('click', onClick); };
  }, []);

  function ripple(ctx, x, y){
    let r=2; let steps=0;
    const id = setInterval(()=>{
      steps++; r+=2; ctx.strokeStyle = 'rgba(110,164,244,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
      if (steps>20) clearInterval(id);
    }, 16);
  }

  return (
    <div className="card p-4">
      <div className="text-sm text-sub mb-2">Tap the pond. Each tap creates a ripple. Let the sound of the inner pond settle.</div>
      <canvas ref={canvasRef} width={360} height={200} className="w-full rounded-lg border border-border"/>
      {done && <div className="mt-2 text-sm text-sub">You’ve created calm.</div>}
    </div>
  );
}
