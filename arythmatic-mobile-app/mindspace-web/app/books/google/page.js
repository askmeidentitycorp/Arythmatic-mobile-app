"use client";
import React from 'react';

export default function GoogleBooksSearch(){
  const [q, setQ] = React.useState('Bhagavad Gita');
  const [items, setItems] = React.useState([]);
  const search = async () => {
    try{
      const r = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10`);
      const j = await r.json();
      setItems(j.items||[]);
    }catch{ setItems([]); }
  };
  React.useEffect(()=>{ search(); }, []);
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-2xl font-semibold mb-2">Google Books</div>
      <div className="flex gap-2 mb-3">
        <input className="flex-1 card px-3 py-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search books" />
        <button className="button" onClick={search}>Search</button>
      </div>
      <div className="grid gap-2">
        {items.map(b => (
          <a key={b.id} href={`/books/google/${b.id}`} className="card p-3 block">
            <div className="font-semibold">{b.volumeInfo?.title}</div>
            <div className="text-sm text-sub">{(b.volumeInfo?.authors||[]).join(', ')}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
