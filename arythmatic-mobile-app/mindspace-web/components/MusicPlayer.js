"use client";
import React from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function MusicPlayer({ track, onFav }){
  const audioRef = React.useRef(null);
  const [playing, setPlaying] = React.useState(false);
  const [vol, setVol] = React.useState(0.7);
  const [timer, setTimer] = React.useState(0); // minutes, 0=off
  const [fav, setFav] = React.useState(false);
  const [autoStopOnChat] = React.useState(true);
  const analyserRef = React.useRef(null);
  const dataRef = React.useRef(null);
  const controls = useAnimation();

  React.useEffect(()=>{
    const a = audioRef.current; if (!a) return;
    a.volume = vol;
  }, [vol]);

  React.useEffect(()=>{
    if (!playing) return;
    let tId;
    if (timer>0){ tId = setTimeout(()=> toggle(false), timer*60*1000); }
    return ()=> tId && clearTimeout(tId);
  }, [playing, timer]);

  React.useEffect(()=>{
    const handler = ()=> { if (autoStopOnChat) toggle(false); };
    window.addEventListener('lumi:chat-start', handler);
    return ()=> window.removeEventListener('lumi:chat-start', handler);
  }, [autoStopOnChat]);

  React.useEffect(()=>{
    // WebAudio analyser for orb pulse
    const audio = audioRef.current; if (!audio) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
    const gain = ctx.createGain(); gain.gain.value = 1;
    source.connect(analyser); analyser.connect(gain); gain.connect(ctx.destination);
    analyserRef.current = analyser; dataRef.current = new Uint8Array(analyser.frequencyBinCount);
    let raf;
    const loop = ()=>{
      analyser.getByteFrequencyData(dataRef.current);
      const avg = dataRef.current.reduce((a,b)=>a+b,0)/dataRef.current.length;
      const s = 1 + (avg/255)*0.3;
      controls.start({ scale: s, transition: { duration: 0.2 } });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return ()=> cancelAnimationFrame(raf);
  }, []);

  const toggle = (force) => {
    const a = audioRef.current; if (!a) return;
    const next = typeof force==='boolean'? force : !playing;
    if (next){ a.play().catch(()=>{}); } else { a.pause(); }
    setPlaying(next);
  };

  const onFavClick = async () => {
    setFav(v=>!v);
    onFav && onFav(track);
    try { await fetch('/api/user_tracks', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ track_id: track.id }) }); } catch {}
  };

  return (
    <div className="card p-4 grid gap-2 items-center text-center">
      <div className="text-sm text-sub">{track.title}</div>
      <motion.div animate={controls} className="rounded-full mx-auto" style={{ width: 120, height: 120, boxShadow: '0 0 24px rgba(107,92,231,0.5)', background: 'radial-gradient(circle, rgba(107,92,231,0.6), rgba(107,92,231,0.2))' }} />
      <div className="flex justify-center gap-2">
        <button className="button" onClick={()=>toggle()}>{playing? 'Pause':'Play'}</button>
        <button className="button" onClick={onFavClick}>{fav? '♥':'♡'}</button>
      </div>
      <div className="flex justify-center items-center gap-2 text-xs">
        <span>Vol</span>
        <input type="range" min={0} max={1} step={0.01} value={vol} onChange={e=>setVol(parseFloat(e.target.value))} />
        <span>Timer</span>
        <select className="card px-2 py-1" value={timer} onChange={e=>setTimer(parseInt(e.target.value))}>
          <option value={0}>Off</option>
          <option value={5}>5m</option>
          <option value={15}>15m</option>
          <option value={30}>30m</option>
        </select>
      </div>
      <audio ref={audioRef} src={track.url} loop preload="auto" />
    </div>
  );
}
