"use client";
import React from 'react';
import { tracks } from '../../data/tracks';
import { useLumi } from '../../contexts/LumiContext';
import MusicPlayer from '../../components/MusicPlayer';

const TABS = [
  { key: 'relax', label: 'Relax', filter: t => ['anxious','fear','sadness'].includes(t.mood) },
  { key: 'focus', label: 'Focus', filter: t => t.id==='alpha' },
  { key: 'energy', label: 'Energy', filter: t => t.mood==='joy' },
  { key: 'reflect', label: 'Reflect', filter: t => t.id==='bells' || t.id==='flute' },
];

export default function MusicSpace(){
  const { currentEmotion } = useLumi();
  const [tab, setTab] = React.useState('relax');
  const [favs, setFavs] = React.useState(()=> new Set(JSON.parse(localStorage.getItem('ms_fav_tracks')||'[]')));
  const addFav = (t) => { const next = new Set(favs); next.add(t.id); setFavs(next); localStorage.setItem('ms_fav_tracks', JSON.stringify([...next])); };

  const mood = currentEmotion?.label || 'neutral';
  const recommend = tracks.find(t => t.mood===mood) || tracks[0];
  const list = tracks.filter(TABS.find(x=>x.key===tab).filter);

  return (
    <div className="p-4 pb-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl font-semibold">Music Space</div>
        <a className="button" href="/books#nourish">Back</a>
      </div>

      <div className="card p-4 mb-4">
        <div className="text-sm text-sub mb-2">LUMI recommends for your mood: <b>{mood}</b></div>
        <MusicPlayer track={recommend} onFav={addFav} />
      </div>

      <div className="flex gap-2 mb-2">
        {TABS.map(t => (
          <button key={t.key} className={`button ${tab===t.key?'bg-primary text-white border-primary':''}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
        <a className="button" href="/mindspace">MindSpace</a>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {list.map(t => (
          <MusicPlayer key={t.id} track={t} onFav={addFav} />
        ))}
      </div>

      {favs.size>0 && (
        <div className="mt-4">
          <div className="font-semibold mb-2">My Favourites</div>
          <div className="grid md:grid-cols-2 gap-3">
            {[...favs].map(id => tracks.find(t=>t.id===id)).filter(Boolean).map(t => (
              <MusicPlayer key={t.id} track={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
