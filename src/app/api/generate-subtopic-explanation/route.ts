import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateSubtopicExplanationSchema } from '@/utils/validate';
import { generateSubtopicPrompt } from '@/lib/prompt';
import { callGroqJSON } from '@/lib/groq';
import { hashPrompt, getCached, setCached } from '@/lib/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { Explanation } from '@/types/explanation';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = generateSubtopicExplanationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      subtopicId,
      subtopicTitle,
      topicTitle,
      courseTitle,
      interest,
      mode,
      language,
      specificity,
    } = result.data;

    // Build cache hash
    const cacheKey = `${subtopicTitle}|${interest}|${mode}|${language}|${specificity || ''}`;
    const hash = await hashPrompt(cacheKey);

    // Check cache
    const cached = await getCached(hash);
    if (cached) {
      return NextResponse.json({ explanation: cached, _cached: true });
    }

    // Generate via Groq
    const prompt = generateSubtopicPrompt(
      subtopicTitle,
      topicTitle,
      courseTitle,
      interest,
      mode,
      language,
      specificity
    );

    const explanationData = await callGroqJSON<Explanation>(prompt);

    // Save to cache
    await setCached(hash, {
      subtopicTitle,
      interest,
      mode,
      language,
      specificity: specificity || '',
      scene: explanationData.scene || '',
      sceneSource: explanationData.scene_source || '',
      result: explanationData as unknown as Record<string, unknown>,
    });

    // Update subtopic cachedExplanations
    try {
      const subtopicRef = adminDb.collection('subtopics').doc(subtopicId);
      await subtopicRef.update({
        [`cachedExplanations.${interest}`]: explanationData,
      });
    } catch {
      // Non-critical — cache write failure shouldn't break the response
    }

    return NextResponse.json({ explanation: explanationData, _cached: false });
  } catch (error) {
    console.error('Generate Subtopic Explanation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
