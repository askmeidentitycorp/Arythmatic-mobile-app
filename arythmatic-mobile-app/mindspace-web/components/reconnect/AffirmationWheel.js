'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { affirmations } from '../../data/affirmations';
import { emotionColors } from '../../lib/emotion';

export default function AffirmationWheel(){
  const [text, setText] = React.useState(affirmations[0]);
  const [angle, setAngle] = React.useState(0);
  const spin = () => {
    const idx = Math.floor(Math.random()*affirmations.length);
    setText(affirmations[idx]);
    setAngle(a=>a + 360 + Math.floor(Math.random()*360));
  };
  const color = emotionColors.joy + '55';
  return (
    <div className="card p-4 grid gap-3 items-center">
      <motion.div animate={{ rotate: angle }} transition={{ duration: 1.2, ease: 'easeInOut' }} className="rounded-full" style={{ width: 140, height: 140, background: `conic-gradient(${color}, transparent 60%)` }} />
      <div className="text-sm text-sub text-center">{text}</div>
      <div className="flex justify-center"><button className="button" onClick={spin}>Spin</button></div>
    </div>
  );
}
