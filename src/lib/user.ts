import { adminDb } from './firebase-admin';
import type { UserProfile } from '@/types/user';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const doc = await adminDb.collection('users').doc(userId).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  await adminDb.collection('users').doc(userId).update(updates);
}

export async function createUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  await adminDb.collection('users').doc(userId).set({
    uid: userId,
    name: data.name || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    interests: data.interests || [],
    language: data.language || 'english',
    educationLevel: data.educationLevel || 'undergraduate',
    studyClass: data.studyClass || '',
    profession: data.profession || 'student',
    preferredMode: data.preferredMode || 'casual',
    currentCourseId: '',
    xp: 0,
    level: 1,
    tier: 'Bronze',
    avatarStage: 0,
    streakDays: 0,
    lastActiveDate: new Date(),
    createdAt: new Date(),
    isOnboarded: false,
    badges: [],
    ...data,
  });
}

export async function updateStreak(userId: string): Promise<number> {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return 0;

  const userData = userDoc.data()!;
  const lastActive = userData.lastActiveDate?.toDate?.() || new Date(userData.lastActiveDate);
  const now = new Date();
  const diffMs = now.getTime() - lastActive.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let newStreak = (userData.streakDays as number) || 0;

  if (diffDays === 1) {
    newStreak++;
  } else if (diffDays > 1) {
    newStreak = 1;
  }
  // If same day (diffDays === 0), keep the same streak

  await userRef.update({
    streakDays: newStreak,
    lastActiveDate: now,
  });

  return newStreak;
}
