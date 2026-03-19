'use client';

import { useState, useRef, useCallback } from 'react';
import NbButton from '@/components/ui/NbButton';
import { useAuth } from '@/context/AuthContext';

interface VoicePlayerProps {
  text: string;
  language?: string;
}

export default function VoicePlayer({ text, language = 'english' }: VoicePlayerProps) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  const play = async () => {
    if (playing) {
      stop();
      return;
    }

    setLoading(true);

    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.slice(0, 4000), language }),
      });

      const data = await res.json();

      if (data.audio && !data.useWebSpeech) {
        // ElevenLabs audio
        const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
        audioRef.current = audio;
        audio.onended = () => setPlaying(false);
        await audio.play();
        setPlaying(true);
      } else {
        // Web Speech fallback
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(data.text || text);
          utterance.lang = data.langCode || 'en-US';
          utterance.rate = 0.9;
          utterance.onend = () => setPlaying(false);
          synthRef.current = utterance;
          window.speechSynthesis.speak(utterance);
          setPlaying(true);
        }
      }
    } catch (e) {
      console.error('Voice play error:', e);
      // Fallback to browser speech
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onend = () => setPlaying(false);
        window.speechSynthesis.speak(utterance);
        setPlaying(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NbButton variant="nova" size="sm" onClick={play} disabled={loading}>
        {loading ? '⏳ Loading...' : playing ? '⏹ STOP' : '🔊 HEAR IT'}
      </NbButton>

      {playing && (
        <div className="nb-waveform mt-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="nb-waveform-bar"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
