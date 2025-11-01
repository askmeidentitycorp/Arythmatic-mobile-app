"use client";
import React from 'react';
import { motion } from 'framer-motion';

export default function AmbientParticles(){
  const [points] = React.useState(()=> Array.from({ length: 24 }, () => ({
    x: Math.random()*100, y: Math.random()*100, d: 20 + Math.random()*40, t: 20 + Math.random()*30
  })));
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {points.map((p, i) => (
        <motion.span key={i}
          className="absolute rounded-full"
          style={{ left: p.x+'%', top: p.y+'%', width: p.d, height: p.d, background: 'radial-gradient(circle, rgba(107,92,231,0.15), transparent 60%)' }}
          animate={{ y: [0, -10, 0] }} transition={{ duration: p.t, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}
