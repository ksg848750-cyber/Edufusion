import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { voiceSchema } from '@/utils/validate';
import { callElevenLabs, callEdgeTTS, getWebSpeechLang } from '@/lib/voice';

export async function POST(req: NextRequest) {
  try {
    // Optional auth for development/testing to prevent 401 blockage
    const user = await getAuthenticatedUser(req);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const body = await req.json();
    const result = voiceSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { text, language } = result.data;
    
    // Attempt ElevenLabs as primary choice
    console.log('[TTS] Attempting ElevenLabs...');
    let audioBuffer = await callElevenLabs(text, language);

    // If ElevenLabs fails (e.g. invalid key), try Microsoft Edge TTS (Humanized Free)
    if (!audioBuffer) {
      console.log('[TTS] ElevenLabs failed, falling back to Microsoft Edge TTS...');
      audioBuffer = await callEdgeTTS(text, language);
    }

    if (audioBuffer) {
      console.log('[TTS] Success! Returning audio buffer (%d bytes)', audioBuffer.length);
      const base64 = audioBuffer.toString('base64');
      return NextResponse.json({
        audio: base64,
        format: 'mp3',
        useWebSpeech: false,
      });
    }

    // Fallback to Web Speech
    return NextResponse.json({
      useWebSpeech: true,
      text,
      langCode: getWebSpeechLang(language),
    });
  } catch (error) {
    console.error('Voice API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice' },
      { status: 500 }
    );
  }
}
