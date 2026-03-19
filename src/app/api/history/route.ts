import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const coursesSnapshot = await adminDb
      .collection('courses')
      .where('userId', '==', user.uid)
      .get();

    const courses = coursesSnapshot.docs
      .map((doc) => ({
        courseId: doc.id,
        ...doc.data(),
      }) as any)
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    // Get progress for each course
    const history = await Promise.all(
      courses.map(async (course) => {
        const progressDoc = await adminDb
          .collection('progress')
          .doc(`${user.uid}_${course.courseId}`)
          .get();
        const progress = progressDoc.exists ? progressDoc.data() : null;

        return {
          courseId: course.courseId,
          courseTitle: (course as Record<string, unknown>).title || '',
          totalUnits: (course as Record<string, unknown>).totalUnits || 0,
          completedTopics: (progress?.completedTopics || []).length,
          completedSubtopics: (progress?.completedSubtopics || []).length,
          progressPercentage: progress?.progressPercentage || 0,
        };
      })
    );

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get history' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { topic, interest, mode, language, specificContext } = body;

    // Save explanation history entry
    await adminDb.collection('explanationHistory').add({
      userId: user.uid,
      topic: topic || '',
      interest: interest || '',
      mode: mode || 'casual',
      language: language || 'english',
      specificContext: specificContext || '',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}
