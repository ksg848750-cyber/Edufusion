const LANG_CODES: Record<string, string> = {
  english: 'en-US',
  hindi: 'hi-IN',
  telugu: 'te-IN',
  tamil: 'ta-IN',
  kannada: 'kn-IN',
};

export function getWebSpeechLang(language: string): string {
  return LANG_CODES[language] || 'en-US';
}

import { execSync } from 'node:child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export async function callEdgeTTS(
  text: string,
  _language: string
): Promise<Buffer | null> {
  const voice = 'en-US-AriaNeural'; // High-quality human female voice
  const tempFile = join(tmpdir(), `edge_tts_${Date.now()}.mp3`);
  
  try {
    console.log('[Edge TTS] Generating audio via Python CLI...');
    // Using execSync to call the localized edge-tts command
    // We wrap text in double quotes and escape existing double quotes
    const escapedText = text.replace(/"/g, '\\"');
    
    execSync(`edge-tts --voice ${voice} --text "${escapedText}" --write-media "${tempFile}"`, {
      stdio: 'inherit'
    });

    const audioBuffer = readFileSync(tempFile);
    console.log('[Edge TTS] Successfully generated buffer (%d bytes)', audioBuffer.length);
    
    // Clean up
    try { unlinkSync(tempFile); } catch (e) {}
    
    return audioBuffer;
  } catch (error: any) {
    console.error('[Edge TTS] CLI call failed:', error.message);
    // Cleanup on error
    try { unlinkSync(tempFile); } catch (e) {}
    return null;
  }
}

// ElevenLabs Aria voice ID - Great for humanized explanations
const DEFAULT_FEMALE_VOICE = '9BWtsYjSj8zBH49Srg8_'; 

export async function callElevenLabs(
  text: string,
  _language: string
): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_FEMALE_VOICE;

  if (!apiKey) {
    console.warn('[ElevenLabs] No API key found in environment.');
    return null;
  }

  try {
    console.log('[ElevenLabs] Fetching voice:', voiceId);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs error:', response.status);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    console.error('ElevenLabs call failed:', e);
    return null;
  }
}
