"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { books } from '../../../data/books';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookReaderPage({ params }){
  const { id } = params;
  const book = books.find(b => b.id === id);
  if (!book) return <div className="p-4">Not found</div>;
  if (book.mode === 'external') return (
    <div className="p-4 pb-20 max-w-xl mx-auto">
      <div className="text-xl font-semibold mb-2">{book.title}</div>
      <div className="text-sub text-sm mb-3">Open in source</div>
      <a className="button bg-primary border-primary text-white" href={book.href} target="_blank" rel="noreferrer">Open external text</a>
    </div>
  );
  return <LocalReader book={book} />
}

function LocalReader({ book }){
  const [section, setSection] = useState(book.toc[0]?.id);
  const sel = useMemo(()=> book.toc.find(s=> s.id===section), [section, book]);
  const [dark, setDark] = useState(false);
  const [twoPage, setTwoPage] = useState(true);
  const [reflect, setReflect] = useState('');
  const [highlights, setHighlights] = useState(()=> loadHL(book.id));
  const paneRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState('');
  const [indexMap, setIndexMap] = useState({}); // { sectionId: { md, html, text } }
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(()=>{
    let cancelled=false;
    async function load(){
      if (book.mode === 'md'){
        // preload all chapters for search
        const entries = await Promise.all(
          book.toc.map(async s => {
            const res = await fetch(`${book.basePath}/${s.file}`, { cache: 'force-cache' });
            const md = await res.text();
            const html = marked.parse(md);
            return [s.id, { md, html, text: stripHtml(html) }];
          })
        );
        if (!cancelled){
          const map = Object.fromEntries(entries);
          setIndexMap(map);
          const current = map[sel.id];
          setHtml(current?.html || '');
        }
      }
    }
    load();
    return ()=>{ cancelled=true; };
  }, [book]);

  // update HTML when section changes
  useEffect(()=>{
    if (book.mode === 'md' && indexMap && indexMap[sel.id]){
      setHtml(indexMap[sel.id].html);
      // reset scroll
      const el = paneRef.current; if (el) el.scrollTop = 0;
    }
  }, [sel, indexMap, book]);

  useEffect(()=>{
    const el = paneRef.current; if (!el) return;
    const onScroll = ()=> {
      const max = el.scrollHeight - el.clientHeight; setProgress(max>0? Math.round((el.scrollTop*100)/max):0);
    };
    el.addEventListener('scroll', onScroll); onScroll();
    return ()=> el.removeEventListener('scroll', onScroll);
  }, [html]);

  const listen = () => { try { const text = stripHtml(html); const u = new SpeechSynthesisUtterance(text); u.rate=0.95; speechSynthesis.speak(u); } catch {} };
  const saveReflection = () => { saveReflect(book.id, section, reflect); setReflect(''); alert('Saved'); };
  const saveSelection = () => { try { const t = window.getSelection().toString(); if (!t) return; const next = saveHL(book.id, t); setHighlights(next); } catch {} };

  const goPrev = () => {
    const idx = book.toc.findIndex(s=> s.id===section);
    if (idx>0) setSection(book.toc[idx-1].id);
  };
  const goNext = () => {
    const idx = book.toc.findIndex(s=> s.id===section);
    if (idx<book.toc.length-1) setSection(book.toc[idx+1].id);
  };

  useEffect(()=>{
    const q = query.trim().toLowerCase();
    if (!q){ setResults([]); return; }
    const out = [];
    for (const s of book.toc){
      const entry = indexMap[s.id];
      if (!entry) continue;
      const txt = entry.text.toLowerCase();
      const i = txt.indexOf(q);
      if (i>=0){
        const snippet = entry.text.slice(Math.max(0,i-40), i+q.length+40);
        out.push({ id: s.id, title: s.title, snippet });
      }
    }
    setResults(out.slice(0,8));
  }, [query, indexMap, book]);

  return (
    <div className="p-4 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xl font-semibold">{book.title}</div>
        <div className="flex gap-2 text-xs items-center">
          <input className="card px-2 py-1" placeholder="Search in book" value={query} onChange={e=>setQuery(e.target.value)} />
          <button className="button" onClick={()=>setQuery('')}>Clear</button>
          <button className="button" onClick={goPrev}>Prev</button>
          <button className="button" onClick={goNext}>Next</button>
          <button className="button" onClick={()=>setDark(d=>!d)}>{dark? 'Light':'Night'} mode</button>
          <button className="button" onClick={()=>setTwoPage(t=>!t)}>{twoPage? 'Single':'Two'}‑page</button>
          <button className="button" onClick={listen}>Listen</button>
          <button className="button" onClick={saveSelection}>Save Highlight</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        <div className="card p-3 h-fit sticky top-16">
          <div className="text-sm text-sub mb-2">Contents</div>
          <div className="grid gap-1">
            {book.toc.map(s => (
              <button key={s.id} className={`button ${section===s.id?'bg-primary text-white border-primary':''}`} onClick={()=>setSection(s.id)}>{s.title}</button>
            ))}
          </div>
          {results.length>0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">Results</div>
              <ul className="text-xs text-sub space-y-1">
                {results.map(r => (
                  <li key={r.id}>
                    <button className="underline" onClick={()=>{ setSection(r.id); setResults([]); }}>{r.title}</button>
                    <div className="line-clamp-2">…{r.snippet}…</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {highlights.length>0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold mb-1">My Highlights</div>
              <ul className="list-disc list-inside text-xs text-sub space-y-1">
                {highlights.slice(0,5).map((h,i)=>(<li key={i}>{h}</li>))}
              </ul>
            </div>
          )}
        </div>

        <div className={`card p-4 ${dark? 'bg-black/60 text-white':''}`}>
          <div className="h-1 bg-[#e5e7eb] rounded mb-2"><div className="h-1 rounded bg-[#6B5CE7]" style={{ width: progress+'%' }} /></div>
          <div ref={paneRef} className={`max-h-[60vh] overflow-auto selection:bg-[#6B5CE7]/30`}>
            <AnimatePresence mode="wait">
              <motion.div key={section}
                initial={{ rotateY: 15, x: 30, opacity: 0, transformOrigin: '100% 50%' }}
                animate={{ rotateY: 0, x: 0, opacity: 1 }}
                exit={{ rotateY: -15, x: -30, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`leading-relaxed ${twoPage? 'md:[column-count:2] md:[column-gap:2rem]':''}`}
              >
                <h2 className="text-lg font-semibold mb-2 break-inside-avoid">{sel.title}</h2>
                <div className="prose prose-invert:prose" dangerouslySetInnerHTML={{ __html: html }} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3">
            <div className="text-sm text-sub mb-1">Reflect</div>
            <textarea className="w-full card p-2" rows={3} value={reflect} onChange={e=>setReflect(e.target.value)} placeholder="How does this passage relate to your mood?" />
            <div className="flex justify-end mt-2"><button className="button" onClick={saveReflection}>Save</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function saveHL(bookId, text){
  const k = `ms_book_hl_${bookId}`;
  const arr = JSON.parse(localStorage.getItem(k)||'[]');
  arr.unshift(text); localStorage.setItem(k, JSON.stringify(arr.slice(0,50)));
  return arr.slice(0,50);
}
function loadHL(bookId){
  try { return JSON.parse(localStorage.getItem(`ms_book_hl_${bookId}`)||'[]'); } catch { return []; }
}
function saveReflect(bookId, section, text){
  const k = `ms_book_reflections`;
  const arr = JSON.parse(localStorage.getItem(k)||'[]');
  arr.unshift({ id: Date.now(), bookId, section, text, ts: Date.now() });
  localStorage.setItem(k, JSON.stringify(arr.slice(0,200)));
}

function stripHtml(h){
  if (!h) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = h;
  return tmp.textContent || tmp.innerText || '';
}
