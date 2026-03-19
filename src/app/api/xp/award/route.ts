import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { xpAwardSchema } from '@/utils/validate';
import { adminDb } from '@/lib/firebase-admin';
import type { XPAction } from '@/types/gamification';
import { XP_VALUES, getLevelFromXP, getTierFromLevel, getAvatarStageFromLevel } from '@/lib/xp';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = xpAwardSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const action = result.data.action as XPAction;
    const actionXP = XP_VALUES[action] || 0;

    // Fetch user
    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data()!;
    const currentXP = userData.xp || 0;
    const currentLevel = userData.level || 1;

    const newXP = currentXP + actionXP;
    const newLevel = getLevelFromXP(newXP);
    const newTier = getTierFromLevel(newLevel);
    const newAvatarStage = getAvatarStageFromLevel(newLevel);
    const leveledUp = newLevel > currentLevel;

    // Update user
    await userRef.update({
      xp: newXP,
      level: newLevel,
      tier: newTier,
      avatarStage: newAvatarStage,
    });

    // Update leaderboard
    try {
      await adminDb.collection('leaderboard').doc(user.uid).set(
        {
          userId: user.uid,
          name: userData.name || '',
          xp: newXP,
          level: newLevel,
          tier: newTier,
          weeklyXP: (userData.weeklyXP || 0) + actionXP,
          avatarStage: newAvatarStage,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      newXP,
      newLevel,
      newTier,
      newAvatarStage,
      leveledUp,
      xpAwarded: actionXP,
      badgesUnlocked: [],
    });
  } catch (error) {
    console.error('XP Award API Error:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
