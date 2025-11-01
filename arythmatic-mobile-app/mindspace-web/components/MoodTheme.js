"use client";
import { useEffect } from 'react';
import { useLumi } from '../contexts/LumiContext';

const MAP = {
  joy: 'joy',
  sadness: 'sad',
  anger: 'anxious',
  fear: 'anxious',
  surprise: 'joy',
  disgust: 'sad',
  neutral: 'neutral',
};

export default function MoodTheme(){
  const { currentEmotion } = useLumi();
  useEffect(() => {
    const mood = MAP[currentEmotion?.label] || 'neutral';
    if (typeof document !== 'undefined') {
      document.body.dataset.mood = mood;
    }
  }, [currentEmotion]);
  return null;
}
