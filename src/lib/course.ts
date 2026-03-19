import { adminDb } from './firebase-admin';
import type { CourseStructure, CourseSource } from '@/types/course';

export async function createCourseStructure(
  userId: string,
  structure: CourseStructure,
  source: CourseSource
): Promise<string> {
  const batches: FirebaseFirestore.WriteBatch[] = [adminDb.batch()];
  let operationCount = 0;

  const addToBatch = (ref: FirebaseFirestore.DocumentReference, data: Record<string, unknown>) => {
    let currentBatch = batches[batches.length - 1];
    if (operationCount >= 450) {
      currentBatch = adminDb.batch();
      batches.push(currentBatch);
      operationCount = 0;
    }
    currentBatch.set(ref, data);
    operationCount++;
  };

  const courseRef = adminDb.collection('courses').doc();
  const courseId = courseRef.id;
  const totalUnits = structure.units.length;

  addToBatch(courseRef, {
    courseId,
    userId,
    title: structure.courseTitle,
    subject: structure.courseTitle,
    source,
    totalUnits,
    createdAt: new Date(),
  });

  let unitOrder = 1;
  for (const unit of structure.units) {
    const unitRef = adminDb.collection('units').doc();
    const unitId = unitRef.id;

    addToBatch(unitRef, {
      unitId,
      courseId,
      userId,
      title: unit.unitTitle,
      order: unitOrder++,
      isCompleted: false,
      completedAt: null,
    });

    let topicOrder = 1;
    for (const topic of unit.topics) {
      const topicRef = adminDb.collection('topics').doc();
      const topicId = topicRef.id;

      addToBatch(topicRef, {
        topicId,
        unitId,
        courseId,
        userId,
        title: topic.topicTitle,
        order: topicOrder++,
        isCompleted: false,
        completedAt: null,
      });

      let subtopicOrder = 1;
      for (const subtopicTitle of topic.subtopics) {
        const subtopicRef = adminDb.collection('subtopics').doc();
        const subtopicId = subtopicRef.id;

        addToBatch(subtopicRef, {
          subtopicId,
          topicId,
          unitId,
          courseId,
          userId,
          title: subtopicTitle,
          order: subtopicOrder++,
          isCompleted: false,
          cachedExplanations: {},
          completedAt: null,
        });
      }
    }
  }

  // Create progress document
  const progressRef = adminDb.collection('progress').doc(`${userId}_${courseId}`);
  addToBatch(progressRef, {
    userId,
    courseId,
    completedSubtopics: [],
    completedTopics: [],
    completedUnits: [],
    progressPercentage: 0,
    lastSubtopicId: '',
    lastTopicId: '',
    lastUnitId: '',
    updatedAt: new Date(),
  });

  // Commit all batches
  for (const b of batches) {
    await b.commit();
  }

  return courseId;
}

export async function getCourseById(courseId: string) {
  const doc = await adminDb.collection('courses').doc(courseId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function getCourseUnits(courseId: string) {
  const snapshot = await adminDb
    .collection('units')
    .where('courseId', '==', courseId)
    .get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as any))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getUnitTopics(unitId: string) {
  const snapshot = await adminDb
    .collection('topics')
    .where('unitId', '==', unitId)
    .get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as any))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getTopicSubtopics(topicId: string) {
  const snapshot = await adminDb
    .collection('subtopics')
    .where('topicId', '==', topicId)
    .get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as any))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getUserCourses(userId: string) {
  const snapshot = await adminDb
    .collection('courses')
    .where('userId', '==', userId)
    .get();
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as any))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
}
