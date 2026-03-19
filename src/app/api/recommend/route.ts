import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { generateLearningPathPrompt } from '@/lib/prompt';
import { callGroqJSON, MODEL_FAST } from '@/lib/groq';
import type { UserProfile } from '@/types/user';

interface RecommendationResponse {
  recommendations: {
    title: string;
    reason: string;
    difficulty: string;
    estimatedHours: number;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data() as UserProfile;

    // Get completed courses
    const coursesSnapshot = await adminDb
      .collection('courses')
      .where('userId', '==', user.uid)
      .get();

    const completedCourses: string[] = [];
    for (const doc of coursesSnapshot.docs) {
      const progressDoc = await adminDb
        .collection('progress')
        .doc(`${user.uid}_${doc.id}`)
        .get();
      if (progressDoc.exists && (progressDoc.data()?.progressPercentage || 0) >= 100) {
        completedCourses.push(doc.data().title || '');
      }
    }

    const prompt = generateLearningPathPrompt(
      userData.educationLevel || 'undergraduate',
      userData.studyClass || '',
      userData.profession || '',
      completedCourses,
      userData.interests || []
    );

    const result = await callGroqJSON<RecommendationResponse>(prompt, MODEL_FAST);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Recommend API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
