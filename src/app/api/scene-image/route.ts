import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { sceneImageSchema } from '@/utils/validate';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = sceneImageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { sceneDescription, concept, interest, sceneSource } = result.data;

    // Trademark-Safe & Hyphenated: High stability for Pollinations
    // We strip specific movie/brand names to avoid copyright filters
    const bannedWords = ['shawshank', 'redemption', 'disney', 'marvel', 'cricket', 'mi ', 'csk ', 'mumbai indians', 'chennai super kings'];
    let safeDescription = (sceneDescription || '').toLowerCase();
    bannedWords.forEach(word => {
      safeDescription = safeDescription.replace(new RegExp(word, 'g'), 'the scene');
    });

    // ULTRA-EXTREME SHORTENING (Max 40 chars)
    // Complex prompts trigger rate-limiting or filtering faster.
    const promptBase = `${safeDescription.slice(0, 30)} ${interest}`.replace(/[^a-zA-Z0-9]/g, ' ').trim();
    const hyphenatedPrompt = promptBase.replace(/\s+/g, '-').slice(0, 40);

    console.log('--- ULTRA-SAFE PROMPT ---');
    console.log(hyphenatedPrompt);

    const imageUrl = `https://image.pollinations.ai/prompt/${hyphenatedPrompt}?seed=${Math.floor(Math.random() * 100000)}&nologo=true&width=800&height=450`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Scene Image API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scene image URL' },
      { status: 500 }
    );
  }
}
