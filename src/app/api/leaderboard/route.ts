import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top 50 by weeklyXP
    const snapshot = await adminDb
      .collection('leaderboard')
      .orderBy('weeklyXP', 'desc')
      .limit(50)
      .get();

    const entries = snapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data(),
    }));

    // Find current user's rank
    let userRank = -1;
    const userEntry = entries.find((e, i) => {
      if ((e as Record<string, unknown>).userId === user.uid) {
        userRank = i + 1;
        return true;
      }
      return false;
    });

    // If user not in top 50, get their entry separately
    if (!userEntry) {
      const userDoc = await adminDb.collection('leaderboard').doc(user.uid).get();
      if (userDoc.exists) {
        // Count how many have higher weeklyXP
        const higherCount = await adminDb
          .collection('leaderboard')
          .where('weeklyXP', '>', (userDoc.data()?.weeklyXP || 0))
          .count()
          .get();
        userRank = (higherCount.data().count || 0) + 1;
      }
    }

    return NextResponse.json({ entries, userRank });
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    );
  }
}
