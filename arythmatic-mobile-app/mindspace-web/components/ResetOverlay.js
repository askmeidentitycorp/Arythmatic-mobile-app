"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetOverlay({ open, onClose }){
  const audioRef = React.useRef(null);
  React.useEffect(()=>{
    if (open && audioRef.current){ audioRef.current.currentTime = 0; audioRef.current.play().catch(()=>{}); }
    return ()=> { if (audioRef.current) audioRef.current.pause(); };
  }, [open]);

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="card w-full max-w-sm p-6 text-center"
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}>
          <div className="text-sm text-sub mb-2">Mood reset</div>
          <BreathCycles cycles={3} seconds={8} onDone={onClose} />
          <div className="text-xs text-sub mt-2">Feel your shoulders relax.</div>
          <button className="button mt-3" onClick={onClose}>Close</button>
          <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2024/03/18/audio_d49f2f7f3e.mp3?filename=rain-ambient-203013.mp3" preload="auto" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BreathCycles({ cycles=3, seconds=8, onDone }){
  const [step, setStep] = React.useState(0);
  const totalSteps = cycles * 2; // inhale/exhale pairs
  React.useEffect(()=>{
    const id = setInterval(()=> setStep(s=> s+1), seconds*1000);
    const end = setTimeout(()=> onDone && onDone(), totalSteps*seconds*1000);
    return ()=> { clearInterval(id); clearTimeout(end); };
  }, [cycles, seconds, onDone]);
  const phase = step % 2 === 0 ? 'Inhale' : 'Exhale';
  return (
    <div className="grid place-items-center">
      <motion.div className="rounded-full grad-soft" style={{ width: 160, height: 160 }}
        animate={{ scale: phase==='Inhale'?1.2:0.85 }} transition={{ duration: seconds, ease: 'easeInOut' }} />
      <div className="mt-2 text-sm text-sub">{phase}…</div>
    </div>
  );
}
