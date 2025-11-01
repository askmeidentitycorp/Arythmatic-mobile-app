'use client';
import React from 'react';

export default function Soundscapes(){
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef(null);
  const [track, setTrack] = React.useState('forest');
  const sources = {
    forest: 'https://cdn.pixabay.com/download/audio/2021/10/26/audio_b8a52d69ee.mp3?filename=forest-nature-sounds-ambient-114354.mp3',
    rain: 'https://cdn.pixabay.com/download/audio/2024/03/18/audio_d49f2f7f3e.mp3?filename=rain-ambient-203013.mp3',
    bells: 'https://cdn.pixabay.com/download/audio/2021/10/27/audio_5a7d88c9d2.mp3?filename=soft-bells-114566.mp3'
  };
  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (a.paused){ a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };
  React.useEffect(()=>{ if (audioRef.current){ audioRef.current.pause(); setPlaying(false); } }, [track]);
  return (
    <div className="card p-4">
      <div className="flex gap-2 mb-2">
        {Object.keys(sources).map(k => (
          <button key={k} className={`button ${track===k?'bg-primary text-white border-primary':''}`} onClick={()=>setTrack(k)}>{k}</button>
        ))}
      </div>
      <audio ref={audioRef} src={sources[track]} loop preload="none"/>
      <button className="button" onClick={toggle}>{playing? 'Pause' : 'Play'} {track}</button>
    </div>
  );
}
