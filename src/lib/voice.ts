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

export async function callElevenLabs(
  text: string,
  _language: string
): Promise<Buffer | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

  if (!apiKey) return null;

  try {
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
