"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MoodOrb from '../../components/MoodOrb';
import { useLumi } from '../../contexts/LumiContext';

const slides = [
  { id: 'greet', title: 'Welcome to LUMI 🌙', body: 'A space where your mind can breathe.' },
  { id: 'purpose', title: 'What I do', body: 'I listen. I help you notice emotions. I offer calm tools when you need them.' },
];

export default function OnboardingPage(){
  const { consented, grant, decline, setEmotion } = useLumi();
  const [step, setStep] = React.useState(0);
  const [mood, setMood] = React.useState('neutral');

  const next = ()=> setStep(s => s+1);
  const prev = ()=> setStep(s => Math.max(0, s-1));

  React.useEffect(()=>{
    const seen = localStorage.getItem('lumi_seen');
    if (seen) window.location.href = '/chat';
  }, []);

  const finish = () => {
    localStorage.setItem('lumi_seen', 'true');
    try { setEmotion({ label: mood, score: 1 }); } catch {}
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen grad-soft p-4 grid place-items-center">
      <div className="card w-full max-w-md p-5">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid place-items-center gap-3 text-center">
                <MoodOrb listening size={18} />
                <div className="text-xl font-semibold">Hi, I’m LUMI</div>
                <div className="text-sub text-sm">your space for calm and clarity.</div>
                <button className="button bg-primary border-primary text-white" onClick={next}>Continue</button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid gap-3">
                <div className="text-lg font-semibold">Emotion by consent</div>
                <div className="text-sub text-sm">Would you like me to sense your mood as we chat?</div>
                <div className="flex gap-2 justify-end">
                  <button className="button" onClick={()=>{ decline(); next(); }}>No, thanks</button>
                  <button className="button bg-primary border-primary text-white" onClick={()=>{ grant(); next(); }}>Yes, please</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid gap-3">
                <div className="text-lg font-semibold">Explore LUMI</div>
                <div className="grid gap-2">
                  <CardLink href="/chat" title="💬 Chat" body="Talk to me about anything — I’ll listen and guide." />
                  <CardLink href="/insights" title="📊 Insights" body="See your emotional patterns over time." />
                  <CardLink href="/mindspace" title="🌿 MindSpace" body="Relax, read, or play mindfulness games." />
                  <CardLink href="/music" title="🎧 Music Space" body="Soundtracks to calm or energize your mind." />
                </div>
                <div className="flex justify-between">
                  <button className="button" onClick={prev}>Back</button>
                  <button className="button bg-primary border-primary text-white" onClick={next}>Next</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid gap-3">
                <div className="text-lg font-semibold">Choose your light</div>
                <div className="text-sub text-sm">Pick a color that matches your mood.</div>
                <div className="flex gap-2">
                  {['neutral','joy','sadness','anger','fear','surprise','disgust'].map(m => (
                    <button key={m} className={`button ${m===mood?'bg-primary text-white border-primary':''}`} onClick={()=>setMood(m)}>{m}</button>
                  ))}
                </div>
                <div className="flex justify-end"><button className="button bg-primary border-primary text-white" onClick={next}>Continue</button></div>
              </div>
            </motion.div>
          )}

          {step >= 4 && (
            <motion.div key="s4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid gap-3 text-center">
                <div className="text-lg font-semibold">Ready to begin your journey?</div>
                <div className="text-sub text-sm">Tell me how you’re feeling today…</div>
                <button className="button bg-primary border-primary text-white" onClick={finish}>Let’s Start</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CardLink({ href, title, body }){
  return (
    <a href={href} className="card p-3 block">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-sub">{body}</div>
    </a>
  );
}
