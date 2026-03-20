import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateSubtopicExplanationSchema } from '@/utils/validate';
import { generateSubtopicPrompt, SYSTEM_PERSONA } from '@/lib/prompt';
import { callGroqJSON, MODEL_SMART } from '@/lib/groq';
import { hashPrompt, getCached, setCached } from '@/lib/cache';
import { adminDb } from '@/lib/firebase-admin';
import type { Explanation } from '@/types/explanation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      subtopicIndex,
    } = result.data;

    // Build cache hash (v17: Storyboard Force Update)
    const cacheKey = `${subtopicId}|${interest}|${mode}|${language}|${specificity || ''}|v17`;
    const hash = await hashPrompt(cacheKey);

    console.log('--- GENERATE EXPLANATION V15 ---');
    console.log('Subtopic:', subtopicTitle);

    // Check cache
    const cached = await getCached(hash);
    if (cached) {
      console.log('CACHE HIT!');
      const explanation = (cached as any).result || cached;
      return NextResponse.json({ explanation, _cached: true });
    }
    console.log('CACHE MISS - GENERATING FRESH...');

    // Generate via Groq
    const prompt = generateSubtopicPrompt(
      subtopicTitle,
      topicTitle,
      courseTitle,
      interest,
      mode,
      language,
      specificity,
      subtopicIndex
    );

    const explanationData = await callGroqJSON<Explanation>(
      prompt,
      MODEL_SMART,
      SYSTEM_PERSONA
    );
    console.log('--- ANALOGY CHOSEN V15 ---');
    console.log('Scene:', explanationData.scene_source);
    console.log('Hook:', explanationData.hook);

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
