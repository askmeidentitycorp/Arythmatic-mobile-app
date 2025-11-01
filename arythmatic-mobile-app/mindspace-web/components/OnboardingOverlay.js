"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoodOrb from './MoodOrb';
import { useLumi } from '../contexts/LumiContext';
import { lsGet, lsSet } from '../utils/storage';

export default function OnboardingOverlay(){
  const { consented, grant, decline } = useLumi();
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    const seen = lsGet('ms_seen_onboarding', false);
    if (!seen) setOpen(true);
  }, []);

  const close = () => { setOpen(false); lsSet('ms_seen_onboarding', true); };

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5"
          initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', damping: 20 }}>

          {step === 0 && (
            <div className="grid place-items-center text-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2 }}>
                <MoodOrb listening size={18} />
              </motion.div>
              <div className="text-xl font-semibold">Hi, I’m LUMI</div>
              <div className="text-sub text-sm">Here to bring a little light to your mind.</div>
              <button className="button bg-primary border-primary text-white" onClick={next}>Begin</button>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-3">
              <div className="text-lg font-semibold">Emotion by consent</div>
              <div className="text-sub text-sm">Would you like me to sense your emotional tone while we chat?</div>
              <div className="flex gap-2 justify-end">
                <button className="button" onClick={() => { decline(); next(); }}>No, just talk</button>
                <button className="button bg-primary border-primary text-white" onClick={() => { grant(); next(); }}>Yes, help me understand myself</button>
              </div>
              {consented && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-sub flex items-center gap-2">
                  <MoodOrb listening size={10} /> Emotion sensing activated
                </motion.div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <TourCard icon="🗨️" title="Chat" text="Share how you feel; LUMI listens and responds with care." />
              <TourCard icon="📊" title="Insights" text="Track your emotional patterns through gentle visuals." />
              <TourCard icon="🌿" title="MindSpace" text="Relax, read, or play to refresh your mind." />
              <div className="flex justify-between">
                <button className="button" onClick={back}>Back</button>
                <button className="button bg-primary border-primary text-white" onClick={next}>Let’s start</button>
              </div>
            </div>
          )}

          {step >= 3 && (
            <div className="grid gap-3 text-center">
              <div className="text-sub text-sm">You’re all set.</div>
              <button className="button bg-primary border-primary text-white" onClick={close}>Enter LUMI</button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TourCard({ icon, title, text }){
  return (
    <motion.div className="rounded-xl border border-white/10 bg-white/5 p-3"
      initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <div className="flex items-center gap-2"><span className="text-lg">{icon}</span><div className="font-semibold">{title}</div></div>
      <div className="text-sub text-sm mt-1">{text}</div>
    </motion.div>
  );
}
