'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useLumi } from '../../contexts/LumiContext';
import HeaderBar from '../../components/HeaderBar';
import { lsGet, lsSet } from '../../utils/storage';

if (typeof window !== 'undefined') {
  window.dispatchEvent(new Event('lumi:chat-start'));
}

export default function ChatPage(){
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');
  const [showHints, setShowHints] = React.useState(() => !lsGet('ms_chat_hints_shown', false));
  const [resetOpen, setResetOpen] = React.useState(false);
  const { consentAsked, consented, grant, decline, listening, currentEmotion, empathicReply } = useLumi();

  const send = async () => {
    const t = text.trim(); if (!t) return;
    setMessages(m => [...m, { id: Date.now()+'u', role:'user', text: t }]);
    setText('');
    const res = await empathicReply(t);
    setMessages(m => [...m, { id: Date.now()+'b', role:'bot', text: res.reply, emotion: res.emotion?.label }]);
    if (showHints) { setTimeout(()=>{ lsSet('ms_chat_hints_shown', true); setShowHints(false); }, 3000); }
  };

  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <HeaderBar />
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-sub">Chat with LUMI</div>
        <div className="flex gap-2 items-center text-xs">
          <span>{consented? 'Emotion sensing: ON' : 'OFF'}</span>
          {!consentAsked && (
            <>
              <button className="button" onClick={grant}>Allow</button>
              <button className="button" onClick={decline}>Decline</button>
            </>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        {messages.length===0 && showHints && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-3 text-xs text-sub">
            Hint: You can tell me anything… (I’ll respond in a calm tone.)
          </motion.div>
        )}
        {messages.map(m => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`card p-2 text-sm ${m.role==='user'? 'ml-10' : 'mr-10'}`}>{m.text}</motion.div>
        ))}
      </div>
      <div className="fixed bottom-12 inset-x-0 px-4">
        <div className="max-w-xl mx-auto flex gap-2">
          <input className="flex-1 card px-3 py-2" placeholder="Type a message..." value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=> e.key==='Enter' && send()} />
          <button className="button" onClick={() => setResetOpen(true)} title="Mood reset">🌬️</button>
          <button className="button" onClick={send}>Send</button>
        </div>
      </div>
      <ResetPortal open={resetOpen} onClose={()=>setResetOpen(false)} />
    </div>
  );
}

function ResetPortal({ open, onClose }){
  const ResetOverlay = React.useMemo(()=> require('../../components/ResetOverlay').default, []);
  return <ResetOverlay open={open} onClose={onClose} />;
}
