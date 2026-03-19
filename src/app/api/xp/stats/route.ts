import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { getXPForNextLevel } from '@/lib/xp';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = userDoc.data()!;
    const xpForNext = getXPForNextLevel(data.level || 1);

    return NextResponse.json({
      xp: data.xp || 0,
      level: data.level || 1,
      tier: data.tier || 'Bronze',
      avatarStage: data.avatarStage || 0,
      streakDays: data.streakDays || 0,
      xpForNextLevel: xpForNext,
      badges: data.badges || [],
    });
  } catch (error) {
    console.error('XP Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get XP stats' },
      { status: 500 }
    );
  }
}
