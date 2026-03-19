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

    const imagePrompt = `${sceneDescription}, in the style of ${interest}, educational illustration, concept labels showing '${concept}', dynamic composition, cinematic lighting, clean art style${sceneSource ? `, based on ${sceneSource}` : ''}`;

    const encoded = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=450&nologo=true`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Scene Image API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scene image URL' },
      { status: 500 }
    );
  }
}
