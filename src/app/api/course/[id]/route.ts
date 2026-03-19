import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { getCourseUnits, getUnitTopics, getTopicSubtopics } from '@/lib/course';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: courseId } = await params;

    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const course = { id: courseDoc.id, ...courseDoc.data() };

    // Get units
    const units = await getCourseUnits(courseId);

    // Get all topics and subtopics
    const topics: Record<string, unknown>[] = [];
    const subtopics: Record<string, unknown>[] = [];

    for (const unit of units) {
      const unitTopics = await getUnitTopics(unit.id);
      for (const topic of unitTopics) {
        topics.push(topic);
        const topicSubtopics = await getTopicSubtopics(topic.id);
        for (const subtopic of topicSubtopics) {
          subtopics.push(subtopic);
        }
      }
    }

    // Get progress
    const progressDoc = await adminDb
      .collection('progress')
      .doc(`${user.uid}_${courseId}`)
      .get();

    const progress = progressDoc.exists ? progressDoc.data() : null;

    return NextResponse.json({
      course,
      units,
      topics,
      subtopics,
      progress,
    });
  } catch (error) {
    console.error('Course API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get course data' },
      { status: 500 }
    );
  }
}
