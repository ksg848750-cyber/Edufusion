'use client';

import { useState, useRef, useCallback } from 'react';
import NbButton from '@/components/ui/NbButton';
import { useAuth } from '@/context/AuthContext';

interface VoicePlayerProps {
  text: string;
  language?: string;
  emotion?: string;
}

export default function VoicePlayer({ text, language = 'english', emotion = 'neutral' }: VoicePlayerProps) {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    setLoading(false);
  }, []);

  const play = async () => {
    stop(); // Cancel previous narration if new starts

    setLoading(true);

    try {
      console.log('[VoicePlayer] Starting play sequence...');
      abortControllerRef.current = new AbortController();
      
      console.log('[VoicePlayer] Fetching /api/voice...');
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language
        }),
        signal: abortControllerRef.current.signal
      });

      console.log('[VoicePlayer] API Response status:', res.status);
      if (!res.ok) throw new Error(`Voice API failed with status ${res.status}`);

      const data = await res.json();
      console.log('[VoicePlayer] API Data received:', data.useWebSpeech ? 'fallback requested' : 'audio present');

      if (data.useWebSpeech) {
        throw new Error('Fallback to Web Speech requested by server');
      }

      if (data.audio) {
        console.log('[VoicePlayer] Processing audio data (base64 length: %d)', data.audio.length);
        const audioBlob = await (await fetch(`data:audio/mp3;base64,${data.audio}`)).blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          console.log('[VoicePlayer] Audio playback ended');
          setPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        setPlaying(true);
        setLoading(false);
        console.log('[VoicePlayer] Playing audio...');
        audio.play().catch(err => {
          console.error('[VoicePlayer] Audio play failed:', err);
          throw err;
        });
      } else {
        throw new Error('No audio data received from API');
      }
      
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('[VoicePlayer] Playback aborted');
        return;
      }
      console.error('[VoicePlayer] Caught error:', e.message);
      
      // Graceful fallback behavior using Browser's Neural Voices (Human-like)
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        console.log('[VoicePlayer] Falling back to browser SpeechSynthesis...');
        const voices = window.speechSynthesis.getVoices();
        console.log('[VoicePlayer] Available voices count:', voices.length);
        
        // Priority: Microsoft Neural (Aria, Jenny), then Google Neural/Natural, then any Neural, then any English
        const bestVoice = voices.find(v => v.name.includes('Neural') && v.name.includes('Aria')) ||
                        voices.find(v => v.name.includes('Neural') && v.name.includes('Jenny')) ||
                        voices.find(v => v.name.includes('Neural') && v.lang.startsWith('en')) ||
                        voices.find(v => v.lang.startsWith('en'));

        const utterance = new SpeechSynthesisUtterance(text.slice(0, 2000));
        if (bestVoice) {
          utterance.voice = bestVoice;
          console.log('[VoicePlayer] Selected voice:', bestVoice.name);
        } else {
          console.warn('[VoicePlayer] No neural voice found, using default');
        }
        
        utterance.lang = 'en-US';
        utterance.rate = 0.95;
        utterance.onend = () => {
          console.log('[VoicePlayer] SpeechSynthesis ended');
          setPlaying(false);
        };
        
        window.speechSynthesis.speak(utterance);
        setPlaying(true);
        setLoading(false);
      } else {
        console.error('[VoicePlayer] No TTS options available');
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <NbButton 
        variant="default" 
        size="sm" 
        onClick={playing ? stop : play} 
        disabled={loading}
        style={{ 
          background: playing ? 'var(--theme-accent-danger, #ff4444)' : 'var(--theme-accent-secondary)', 
          color: 'var(--theme-bg)',
          transition: 'all 0.3s ease'
        }}
      >
        {loading ? '⏳ Loading...' : playing ? '⏹ STOP' : '🔊 HEAR IT'}
      </NbButton>

      {playing && (
        <div className="nb-waveform mt-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="nb-waveform-bar"
              style={{ animationDelay: `${i * 0.1}s`, background: 'var(--theme-accent-secondary)' }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
