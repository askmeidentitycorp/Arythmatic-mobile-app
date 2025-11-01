'use client';
import React from 'react';

export default function ReadingCorner({ items }) {
  return (
    <div className="grid gap-3">
      {items.map((b, i) => (
        <BookCard key={i} book={b} />
      ))}
    </div>
  );
}

function BookCard({ book }) {
  const [open, setOpen] = React.useState(false);
  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    const utter = new SpeechSynthesisUtterance(`${book.title}. ${book.summary}`);
    utter.rate = 0.9; utter.pitch = 1; utter.volume = 0.9;
    speechSynthesis.speak(utter);
  };
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{book.title}</div>
          <div className="text-sub text-sm">{book.theme}</div>
        </div>
        <div className="flex gap-2">
          <button className="button" onClick={() => setOpen(o=>!o)}>Read 3‑min Summary</button>
          <button className="button" onClick={speak}>Listen</button>
        </div>
      </div>
      {open && (
        <p className="text-sm text-sub mt-3">{book.summary}</p>
      )}
    </div>
  );
}
