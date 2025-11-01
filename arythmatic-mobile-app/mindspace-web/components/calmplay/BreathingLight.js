'use client';
import React from 'react';
import { motion } from 'framer-motion';

export default function BreathingLight() {
  const [phase, setPhase] = React.useState('Inhale');
  React.useEffect(() => {
    let i = 0;
    const seq = ['Inhale','Hold','Exhale','Hold'];
    const timer = setInterval(()=>{ i=(i+1)%seq.length; setPhase(seq[i]); }, 4000);
    return ()=>clearInterval(timer);
  }, []);
  return (
    <div className="card p-4 flex flex-col items-center">
      <motion.div
        className="rounded-full grad-soft"
        initial={{ scale: 0.8 }}
        animate={{ scale: phase==='Inhale'?1.2:phase==='Exhale'?0.8:1.0 }}
        transition={{ duration: 4, ease: 'easeInOut' }}
        style={{ width: 180, height: 180 }}
      />
      <div className="mt-3 text-sm text-sub">{phase}…</div>
      <div className="mt-1 text-xs text-sub">Follow the orb. Let the body lead the mind.</div>
    </div>
  );
}
