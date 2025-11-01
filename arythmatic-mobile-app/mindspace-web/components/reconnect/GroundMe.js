'use client';
import React from 'react';

export default function GroundMe(){
  const [step, setStep] = React.useState(0);
  const prompts = [
    'Name 5 things you can see',
    'Name 4 things you can touch',
    'Name 3 things you can hear',
    'Name 2 things you can smell',
    'Name 1 thing you can taste'
  ];
  const next = ()=> setStep(s => Math.min(s+1, prompts.length));
  return (
    <div className="card p-4">
      {step < prompts.length ? (
        <>
          <div className="text-sm mb-2">{prompts[step]}</div>
          <textarea className="w-full card p-2" rows={3} placeholder="Write a few words..."/>
          <div className="mt-2 flex justify-end"><button className="button" onClick={next}>Next</button></div>
        </>
      ) : (
        <div className="text-sm text-sub">I am here. I am safe. My senses anchor me in the present.</div>
      )}
    </div>
  );
}
