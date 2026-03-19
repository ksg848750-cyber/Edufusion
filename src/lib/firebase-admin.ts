import 'server-only';

import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const adminApp = getApps().length
  ? getApp()
  : initializeApp(
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? {
            credential: cert({
              projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
              clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(
                /\\n/g,
                '\n'
              ),
            }),
          }
        : { projectId: process.env.FIREBASE_ADMIN_PROJECT_ID }
    );

if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error("Firebase Admin Error: FIREBASE_ADMIN_PRIVATE_KEY is missing from .env.local");
}

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export async function verifyAuthToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch {
    return null;
  }
}

export { adminDb, adminAuth };
