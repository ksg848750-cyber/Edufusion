import { adminDb } from './firebase-admin';

export async function hashPrompt(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const CACHE_TTL_DAYS = 30;

export async function getCached(hash: string): Promise<Record<string, unknown> | null> {
  try {
    const doc = await adminDb.collection('explanationCache').doc(hash).get();
    if (!doc.exists) return null;

    const data = doc.data();
    if (!data) return null;

    // Check TTL
    const createdAt = data.createdAt?.toDate?.() || new Date(data.createdAt);
    const ageMs = Date.now() - createdAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    if (ageDays > CACHE_TTL_DAYS) {
      // Expired — delete and return null
      await adminDb.collection('explanationCache').doc(hash).delete();
      return null;
    }

    return data.result as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function setCached(
  hash: string,
  data: {
    subtopicTitle: string;
    interest: string;
    mode: string;
    language: string;
    specificity: string;
    scene: string;
    sceneSource: string;
    result: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await adminDb.collection('explanationCache').doc(hash).set({
      hash,
      ...data,
      createdAt: new Date(),
    });
  } catch (e) {
    console.error('Cache write error:', e);
  }
}
