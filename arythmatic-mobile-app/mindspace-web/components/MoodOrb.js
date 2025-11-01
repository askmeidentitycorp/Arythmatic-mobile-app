'use client';
import React from 'react';
import { motion, useAnimation } from 'framer-motion';
import { emotionColors } from '../lib/emotion';

export default function MoodOrb({ emotion='neutral', listening=false, size=14, onClick }) {
  const controls = useAnimation();
  React.useEffect(() => {
    let loop;
    if (listening) {
      controls.start({ scale: [1, 1.2, 1], transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } });
    } else {
      controls.start({ scale: 1 });
    }
    return () => loop && clearInterval(loop);
  }, [listening]);
  const color = emotionColors[emotion] || emotionColors.neutral;
  return (
    <motion.div
      onClick={onClick}
      animate={controls}
      className="rounded-full"
      style={{ width: size*4, height: size*4, boxShadow: `0 0 16px ${color}66`, backgroundColor: color }}
    />
  );
}
