import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { progressUpdateSchema } from '@/utils/validate';
import { adminDb } from '@/lib/firebase-admin';
import { XP_VALUES, getLevelFromXP, getTierFromLevel, getAvatarStageFromLevel } from '@/lib/xp';
import { getTopicSubtopics, getUnitTopics, getCourseUnits } from '@/lib/course';

async function internalAwardXP(uid: string, action: string) {
  const actionXP = XP_VALUES[action as keyof typeof XP_VALUES] || 0;
  if (actionXP === 0) return { leveledUp: false };

  const userRef = adminDb.collection('users').doc(uid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return { leveledUp: false };

  const data = userDoc.data()!;
  const currentLevel = data.level || 1;
  const newXP = (data.xp || 0) + actionXP;
  const newLevel = getLevelFromXP(newXP);

  await userRef.update({
    xp: newXP,
    level: newLevel,
    tier: getTierFromLevel(newLevel),
    avatarStage: getAvatarStageFromLevel(newLevel),
  });

  try {
    await adminDb.collection('leaderboard').doc(uid).set(
      {
        userId: uid,
        name: data.name || '',
        xp: newXP,
        level: newLevel,
        tier: getTierFromLevel(newLevel),
        weeklyXP: (data.weeklyXP || 0) + actionXP,
        avatarStage: getAvatarStageFromLevel(newLevel),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch { /* non-critical */ }

  return { leveledUp: newLevel > currentLevel };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = progressUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { courseId, subtopicId, topicId, unitId } = result.data;

    const progressRef = adminDb.collection('progress').doc(`${user.uid}_${courseId}`);
    const progressDoc = await progressRef.get();

    if (!progressDoc.exists) {
      // Create if doesn't exist
      await progressRef.set({
        userId: user.uid,
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
    }

    const progress = (await progressRef.get()).data()!;
    let xpAwardedTotal = 0;
    let leveledUp = false;

    // 1. Mark Subtopic Complete
    if (!progress.completedSubtopics.includes(subtopicId)) {
      progress.completedSubtopics.push(subtopicId);
      progress.lastSubtopicId = subtopicId;

      try {
        await adminDb.collection('subtopics').doc(subtopicId).update({
          isCompleted: true,
          completedAt: new Date(),
        });
      } catch { /* subtopic may not exist */ }

      const r = await internalAwardXP(user.uid, 'COMPLETE_SUBTOPIC');
      xpAwardedTotal += XP_VALUES.COMPLETE_SUBTOPIC;
      if (r.leveledUp) leveledUp = true;
    }

    // 2. Check Topic Completion
    if (topicId && !progress.completedTopics.includes(topicId)) {
      progress.lastTopicId = topicId;
      const subtopics = await getTopicSubtopics(topicId);
      const allDone = subtopics.every((s) => progress.completedSubtopics.includes(s.id));

      if (allDone && subtopics.length > 0) {
        progress.completedTopics.push(topicId);
        try {
          await adminDb.collection('topics').doc(topicId).update({
            isCompleted: true,
            completedAt: new Date(),
          });
        } catch { /* */ }

        const r = await internalAwardXP(user.uid, 'COMPLETE_TOPIC');
        xpAwardedTotal += XP_VALUES.COMPLETE_TOPIC;
        if (r.leveledUp) leveledUp = true;
      }
    }

    // 3. Check Unit Completion
    if (unitId && !progress.completedUnits.includes(unitId)) {
      progress.lastUnitId = unitId;
      const topics = await getUnitTopics(unitId);
      const allDone = topics.every((t) => progress.completedTopics.includes(t.id));

      if (allDone && topics.length > 0) {
        progress.completedUnits.push(unitId);
        try {
          await adminDb.collection('units').doc(unitId).update({
            isCompleted: true,
            completedAt: new Date(),
          });
        } catch { /* */ }

        const r = await internalAwardXP(user.uid, 'COMPLETE_UNIT');
        xpAwardedTotal += XP_VALUES.COMPLETE_UNIT;
        if (r.leveledUp) leveledUp = true;
      }
    }

    // 4. Check Course Completion
    const units = await getCourseUnits(courseId);
    let courseComplete = false;
    let progressPercentage = 0;

    if (units.length > 0) {
      const allDone = units.every((u) => progress.completedUnits.includes(u.id));
      progressPercentage = Math.round((progress.completedUnits.length / units.length) * 100);

      if (allDone) {
        progressPercentage = 100;
        if ((progress.progressPercentage || 0) < 100) {
          courseComplete = true;
          const r = await internalAwardXP(user.uid, 'COMPLETE_COURSE');
          xpAwardedTotal += XP_VALUES.COMPLETE_COURSE;
          if (r.leveledUp) leveledUp = true;
        }
      }
    }

    // Update Progress
    await progressRef.update({
      completedSubtopics: progress.completedSubtopics,
      completedTopics: progress.completedTopics,
      completedUnits: progress.completedUnits,
      lastSubtopicId: progress.lastSubtopicId || '',
      lastTopicId: progress.lastTopicId || '',
      lastUnitId: progress.lastUnitId || '',
      progressPercentage,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      progressPercentage,
      xpAwarded: xpAwardedTotal,
      leveledUp,
      courseComplete,
    });
  } catch (error) {
    console.error('Progress Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
